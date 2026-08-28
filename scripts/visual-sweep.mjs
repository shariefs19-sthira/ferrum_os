import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const OUT_DIR = path.join(process.cwd(), 'docs', 'shots');

const routes = [
  '/',
  '/structura',
  '/promarket',
  '/buildos',
  '/procurehub',
  '/investflow',
  '/communitybuild',
  '/landintel',
  '/boq-pro'
];

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Starting visual sweep at 1280px viewport targeting ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    const filename = route === '/' ? 'index.png' : `${route.replace('/', '')}.png`;
    const filepath = path.join(OUT_DIR, filename);

    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      console.warn(`Networkidle timeout for ${url}, proceeding with screenshot: ${e.message}`);
    }

    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`Saved screenshot to ${filepath}`);
  }

  await browser.close();
  console.log('Visual sweep completed successfully.');
}

main().catch((err) => {
  console.error('Error during visual sweep:', err);
  process.exit(1);
});
