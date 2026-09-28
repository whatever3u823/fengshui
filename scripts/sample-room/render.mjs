import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript" };
const server = createServer(async (req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const body = await readFile(path);
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
}).listen(4789);

const [w, h] = [process.argv[3] ?? 1536, process.argv[4] ?? 1024];
const out = process.argv[2] ?? root;
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
for (const state of ["before", "after"]) {
  await page.goto(`http://localhost:4789/scene.html?state=${state}&w=${w}&h=${h}`);
  await page.waitForFunction(() => window.__done === true, null, { timeout: 180000 });
  await page.locator("canvas").screenshot({ path: join(out, `bedroom-${state}.png`) });
  console.log("rendered", state);
}
await browser.close();
server.close();
