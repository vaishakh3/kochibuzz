import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = process.cwd();
const WIDTH = 1200;
const HEIGHT = 630;

async function dataUrl(filePath: string, mimeType: string) {
  const file = await readFile(path.join(ROOT, filePath));
  return `data:${mimeType};base64,${file.toString("base64")}`;
}

async function generate() {
const [artwork, geistSans, geistMono, fraunces] = await Promise.all([
  dataUrl("assets/social/kochi-buzz-city-signal-v2.png", "image/png"),
  dataUrl("assets/social/fonts/geist-sans.woff2", "font/woff2"),
  dataUrl("assets/social/fonts/geist-mono.woff2", "font/woff2"),
  dataUrl("assets/social/fonts/fraunces.woff2", "font/woff2"),
]);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});

await page.setContent(`
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @font-face {
          font-family: "Social Geist";
          src: url("${geistSans}") format("woff2");
          font-style: normal;
          font-weight: 100 900;
        }
        @font-face {
          font-family: "Social Mono";
          src: url("${geistMono}") format("woff2");
          font-style: normal;
          font-weight: 100 900;
        }
        @font-face {
          font-family: "Social Fraunces";
          src: url("${fraunces}") format("woff2");
          font-style: normal;
          font-weight: 100 900;
        }
        * { box-sizing: border-box; }
        html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
        body { background: #f5f0e7; }
        .card {
          position: relative;
          width: 1200px;
          height: 630px;
          isolation: isolate;
          overflow: hidden;
          color: #f5f0e7;
          font-family: "Social Geist", Arial, sans-serif;
        }
        .city-art {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          filter: saturate(1.04) contrast(1.02);
          z-index: -3;
        }
        .ink-panel {
          position: absolute;
          inset: 0 auto 0 0;
          width: 57%;
          background:
            linear-gradient(90deg, rgba(11, 11, 18, 0.99) 0%, rgba(11, 11, 18, 0.98) 72%, rgba(11, 11, 18, 0.88) 100%);
          clip-path: polygon(0 0, 91% 0, 100% 100%, 0 100%);
          z-index: -2;
        }
        .ink-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .14;
          background-image:
            linear-gradient(rgba(245,240,231,.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,240,231,.14) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to right, #000, transparent 96%);
        }
        .edge-signal {
          position: absolute;
          left: 609px;
          top: -34px;
          width: 5px;
          height: 706px;
          background: #72dcc7;
          transform: rotate(-5.2deg);
          transform-origin: center;
          box-shadow: 0 0 0 1px rgba(11,11,18,.12);
          z-index: -1;
        }
        .content {
          position: absolute;
          inset: 58px auto 52px 62px;
          width: 510px;
          display: flex;
          flex-direction: column;
          height: 520px;
        }
        .eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #72dcc7;
          font-family: "Social Mono", monospace;
          font-size: 15px;
          line-height: 1;
          font-weight: 760;
          letter-spacing: .2em;
          text-transform: uppercase;
        }
        .pulse {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #ff6542;
          box-shadow: 0 0 0 7px rgba(255,101,66,.15);
          flex: none;
        }
        .wordmark {
          margin: 58px 0 0;
          font-family: "Social Fraunces", Georgia, serif;
          font-size: 104px;
          line-height: .82;
          font-weight: 650;
          letter-spacing: -.065em;
          white-space: nowrap;
        }
        .wordmark em {
          color: #d7f24b;
          font-style: italic;
          font-weight: 560;
        }
        .promise {
          margin: 33px 0 0;
          font-family: "Social Fraunces", Georgia, serif;
          font-size: 59px;
          line-height: .94;
          font-weight: 520;
          letter-spacing: -.045em;
        }
        .promise span { color: #ff6542; font-style: italic; }
        .footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 18px;
          color: rgba(245,240,231,.76);
          font-family: "Social Mono", monospace;
          font-size: 13px;
          font-weight: 650;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .footer-line {
          width: 54px;
          height: 3px;
          border-radius: 99px;
          background: linear-gradient(90deg, #d7f24b 0 33%, #ff6542 33% 66%, #72dcc7 66%);
        }
        .stamp {
          position: absolute;
          right: 43px;
          bottom: 38px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 17px;
          border: 1px solid rgba(245,240,231,.72);
          border-radius: 999px;
          background: rgba(11,11,18,.88);
          color: #f5f0e7;
          box-shadow: 0 12px 36px rgba(11,11,18,.18);
          font-family: "Social Mono", monospace;
          font-size: 13px;
          font-weight: 760;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .stamp-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #d7f24b;
        }
      </style>
    </head>
    <body>
      <main class="card" aria-label="Kochi Buzz — The city, by date">
        <img class="city-art" src="${artwork}" alt="" />
        <div class="ink-panel"></div>
        <div class="edge-signal"></div>
        <section class="content">
          <div class="eyebrow"><i class="pulse"></i> Kochi · Live city calendar</div>
          <h1 class="wordmark">kochi<em>.buzz</em></h1>
          <p class="promise">The city,<br /><span>by date.</span></p>
          <div class="footer"><i class="footer-line"></i> Events · people · work</div>
        </section>
        <div class="stamp"><i class="stamp-dot"></i> Kochi.buzz</div>
      </main>
    </body>
  </html>
`);

await page.evaluate(() => document.fonts.ready);
await page.screenshot({
  path: path.join(ROOT, "public/social/kochi-buzz-preview-v2.jpg"),
  type: "jpeg",
  quality: 88,
  fullPage: false,
});

await browser.close();
}

generate().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
