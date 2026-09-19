# Site3D external-tile disclosure (MASON, 2026-09-19)
Static export (`next build` → `out/`), real OpenFreeMap requests, Playwright at 320/390/768/1440.
`results.json`: notice text, line count, no overlap with map/marker, no horizontal overflow; observed provider requests carry no query string and Referer is the site origin only.
Boundary: provider sees tile z/x/y (viewed area), IP, UA, origin Referer. Not sent: ULPIN, parcel id, project data, auth (URLs are fixed constants; no transformRequest).
