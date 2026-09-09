#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [graphArg, outArg, labelArg] = process.argv.slice(2);

if (!graphArg || !outArg || !labelArg) {
  console.error("Usage: node scripts/make-3d-viz.mjs <graph.json> <out.html> <label>");
  process.exit(2);
}

const graphPath = resolve(graphArg);
const outPath = resolve(outArg);
const graph = JSON.parse(await readFile(graphPath, "utf8"));
const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
const links = Array.isArray(graph.links)
  ? graph.links
  : Array.isArray(graph.edges)
    ? graph.edges
    : [];

if (!nodes.length) throw new Error(`Graph has no nodes: ${graphPath}`);

const nodeIds = new Set(nodes.map((node) => String(node.id)));
const endpointId = (endpoint) =>
  typeof endpoint === "object" && endpoint !== null ? String(endpoint.id) : String(endpoint);
const validLinks = links.filter(
  (link) => nodeIds.has(endpointId(link.source)) && nodeIds.has(endpointId(link.target)),
);
const degree = new Map(nodes.map((node) => [String(node.id), 0]));
for (const link of validLinks) {
  const source = endpointId(link.source);
  const target = endpointId(link.target);
  degree.set(source, (degree.get(source) ?? 0) + 1);
  degree.set(target, (degree.get(target) ?? 0) + 1);
}

const communityCounts = new Map();
for (const node of nodes) {
  const community = String(node.community ?? "unassigned");
  communityCounts.set(community, (communityCounts.get(community) ?? 0) + 1);
}
const topCommunities = [...communityCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 20)
  .map(([community]) => community);
const topCommunitySet = new Set(topCommunities);

const payload = {
  nodes: nodes.map((node) => ({
    ...node,
    id: String(node.id),
    label: node.label || node.norm_label || String(node.id),
    community: String(node.community ?? "unassigned"),
    degree: degree.get(String(node.id)) ?? 0,
    colorCommunity: topCommunitySet.has(String(node.community ?? "unassigned"))
      ? String(node.community ?? "unassigned")
      : "other",
  })),
  links: validLinks.map((link) => ({
    ...link,
    source: endpointId(link.source),
    target: endpointId(link.target),
  })),
};

const palette = [
  "#ff6b35", "#2ec4b6", "#ffbf00", "#e71d36", "#6a4c93",
  "#8ac926", "#1982c4", "#ff595e", "#ffca3a", "#6a994e",
  "#00b4d8", "#f72585", "#4cc9f0", "#fb8500", "#90be6d",
  "#577590", "#f9844a", "#43aa8b", "#b5179e", "#f9c74f",
];
const colors = Object.fromEntries(topCommunities.map((community, index) => [community, palette[index]]));
colors.other = "#667085";

const cdnUrl = "https://unpkg.com/3d-force-graph@1.79.0/dist/3d-force-graph.min.js";
let libraryMarkup;
let needsInternet = false;
try {
  const response = await fetch(cdnUrl, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const library = (await response.text()).replaceAll("</script", "<\\/script");
  libraryMarkup = `<script>${library}</script>`;
} catch (error) {
  needsInternet = true;
  console.warn(`Library inline fetch failed (${error.message}); emitting CDN fallback.`);
  libraryMarkup = `<script src="${cdnUrl}"></script>`;
}

const safeJson = (value) => JSON.stringify(value).replaceAll("</script", "<\\/script");
const safeText = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const legend = [
  ...topCommunities.map((community) => ({
    community,
    count: communityCounts.get(community),
    color: colors[community],
  })),
  {
    community: "other",
    count: nodes.filter((node) => !topCommunitySet.has(String(node.community ?? "unassigned"))).length,
    color: colors.other,
  },
].filter((item) => item.count > 0);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeText(labelArg)} — 3D graph</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; overflow: hidden; background: #06080d; color: #f5f7fa; }
    header { position: fixed; z-index: 4; inset: 0 0 auto; display: flex; align-items: center; gap: 18px; min-height: 58px; padding: 10px 18px; background: rgba(6,8,13,.92); border-bottom: 1px solid #28303d; backdrop-filter: blur(8px); }
    h1 { margin: 0; font-size: 16px; letter-spacing: .04em; }
    .count { color: #aab4c3; font: 12px ui-monospace, SFMono-Regular, Consolas, monospace; }
    #network-warning { margin-left: auto; padding: 6px 10px; border: 1px solid #f59e0b; color: #fbbf24; font-size: 12px; }
    #graph { position: fixed; inset: 58px 0 0; }
    aside { position: fixed; z-index: 3; top: 74px; left: 14px; width: 210px; max-height: calc(100vh - 90px); overflow: auto; padding: 12px; background: rgba(10,14,22,.88); border: 1px solid #28303d; border-radius: 8px; }
    aside h2 { margin: 0 0 9px; font-size: 12px; text-transform: uppercase; letter-spacing: .1em; color: #aab4c3; }
    .legend-row { display: grid; grid-template-columns: 10px 1fr auto; gap: 8px; align-items: center; padding: 3px 0; font-size: 11px; }
    .swatch { width: 9px; height: 9px; border-radius: 50%; }
    .legend-count { color: #8d99a8; font-family: ui-monospace, monospace; }
    .hint { position: fixed; z-index: 3; right: 14px; bottom: 12px; color: #8d99a8; font-size: 11px; }
  </style>
  ${libraryMarkup}
</head>
<body>
  <header>
    <h1>${safeText(labelArg)}</h1>
    <span class="count">${payload.nodes.length.toLocaleString("en-US")} nodes · ${payload.links.length.toLocaleString("en-US")} edges</span>
    ${needsInternet ? '<span id="network-warning">NEEDS INTERNET — visualization library uses CDN fallback</span>' : ""}
  </header>
  <aside><h2>Top communities</h2>${legend.map((item) => `<div class="legend-row"><span class="swatch" style="background:${item.color}"></span><span>${safeText(item.community === "other" ? "Other" : `Community ${item.community}`)}</span><span class="legend-count">${item.count}</span></div>`).join("")}</aside>
  <div id="graph"></div>
  <div class="hint">Drag: orbit · wheel: zoom · right-drag: pan · click node: focus</div>
  <script>
    const GRAPH_DATA = ${safeJson(payload)};
    const COMMUNITY_COLORS = ${safeJson(colors)};
    const maxDegree = Math.max(1, ...GRAPH_DATA.nodes.map(node => node.degree));
    const graph = ForceGraph3D()(document.getElementById("graph"))
      .graphData(GRAPH_DATA)
      .backgroundColor("#06080d")
      .nodeColor(node => COMMUNITY_COLORS[node.colorCommunity] || COMMUNITY_COLORS.other)
      .nodeVal(node => 1.4 + Math.pow(node.degree / maxDegree, 0.62) * 16)
      .nodeOpacity(0.9)
      .nodeResolution(10)
      .nodeLabel(node => "<strong>" + String(node.label).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]) + "</strong><br>Community " + node.community + "<br>Degree " + node.degree)
      .linkColor(() => "rgba(143,155,179,0.28)")
      .linkWidth(link => Math.max(0.15, Number(link.weight || 1) * 0.22))
      .linkOpacity(0.34)
      .onNodeClick(node => {
        const distance = 90;
        const length = Math.hypot(node.x || 0, node.y || 0, node.z || 0) || 1;
        const ratio = 1 + distance / length;
        graph.cameraPosition(
          { x: (node.x || 0) * ratio, y: (node.y || 0) * ratio, z: (node.z || 0) * ratio },
          node,
          900,
        );
      });
    graph.controls().enableDamping = true;
    graph.controls().dampingFactor = 0.08;
    graph.d3Force("charge").strength(-58);
    graph.onEngineStop(() => {
      for (const node of GRAPH_DATA.nodes) {
        if (node.degree < maxDegree * 0.75) continue;
        node.__godNode = true;
        const material = node.__threeObj && node.__threeObj.material;
        if (material && material.emissive && typeof material.emissive.set === "function") {
          material.emissive.set(COMMUNITY_COLORS[node.colorCommunity] || "#ffffff");
          material.emissiveIntensity = 1.35;
        }
      }
    });
  </script>
</body>
</html>`;

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, html, "utf8");
console.log(`wrote ${outPath} (${Buffer.byteLength(html).toLocaleString("en-US")} bytes; ${needsInternet ? "CDN fallback" : "library inlined"})`);
