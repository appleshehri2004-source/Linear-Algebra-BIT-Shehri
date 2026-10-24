// Takes the 4 poster pictures of station 1 that the homepage shows while its 3D world loads
// (docs/homepage-brief.md §4): dark and light, wide (computer) and tall (phone).
// It opens the homepage in Chrome with no window (headless), hides the page's words (they're drawn on top of
// the poster anyway), waits for the 3D world's first frame, and saves a JPEG of the screen.
//
// Run it while a dev server or preview is running, and again whenever station 1 changes:
//   node scripts/capture-posters.mjs http://localhost:4321/Linear-Algebra-BIT-Shehri/
// It uses the Chrome already installed on this Mac (set CHROME_PATH to use another one).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.argv[2];
if (!url) {
  console.error('Give the homepage address, e.g. node scripts/capture-posters.mjs http://localhost:4321/Linear-Algebra-BIT-Shehri/');
  process.exit(1);
}
const chromePath = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outDir = fileURLToPath(new URL('../src/assets/posters/', import.meta.url));

// The 4 pictures: [file name, theme, width, height, pixel ratio, phone?]
const shots = [
  ['dark-wide.jpg', 'dark', 1600, 1000, 1, false],
  ['light-wide.jpg', 'light', 1600, 1000, 1, false],
  ['dark-tall.jpg', 'dark', 430, 932, 2, true],
  ['light-tall.jpg', 'light', 430, 932, 2, true],
];

// Everything on the page except the world itself.
const HIDE_WORDS = `.site-name, .station-rail, .station-label, .scroll-hint, .theme-toggle, .tip-handle { visibility: hidden !important; }`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Start Chrome with remote control switched on (a private, throwaway profile).
const profile = mkdtempSync(join(tmpdir(), 'posters-'));
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9333',
  `--user-data-dir=${profile}`,
  '--hide-scrollbars',
  // The Mac's real graphics card (Metal). Without it Chrome draws in software, so slowly that the world's
  // frame-rate watch turns the glow off, and the dark posters would come out without it.
  '--use-angle=metal',
  'about:blank',
]);

try {
  // Wait for Chrome to be ready, then find the open tab's control socket.
  let tab;
  for (let i = 0; i < 50 && !tab; i++) {
    await sleep(200);
    tab = await fetch('http://127.0.0.1:9333/json/list')
      .then((r) => r.json())
      .then((tabs) => tabs.find((t) => t.type === 'page'))
      .catch(() => undefined);
  }
  if (!tab) throw new Error('Chrome did not start');

  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener('open', resolve));
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  /** Send one command to Chrome and wait for its answer. */
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });

  for (const [file, theme, width, height, scale, phone] of shots) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: phone });
    await send('Emulation.setTouchEmulationEnabled', { enabled: phone });
    // Open the page once to save the theme choice, then again so it starts in that theme.
    await send('Page.navigate', { url });
    await sleep(1500);
    await evaluate(`localStorage.setItem('theme', '${theme}')`);
    await send('Page.navigate', { url });
    await sleep(1500);
    await evaluate(`document.head.insertAdjacentHTML('beforeend', '<style>${HIDE_WORDS}</style>')`);
    // Wait until the 3D world has drawn its first frame (it gets the "ready" class), then a moment more.
    const ready = await evaluate(`new Promise((resolve) => {
      const start = Date.now();
      const check = () => document.querySelector('.world-canvas.ready') ? resolve(true)
        : Date.now() - start > 30000 ? resolve(false) : setTimeout(check, 200);
      check();
    })`);
    if (!ready.result.value) throw new Error(`The 3D world never appeared for ${file}`);
    await sleep(2500);
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
    writeFileSync(join(outDir, file), Buffer.from(shot.data, 'base64'));
    console.log(`saved src/assets/posters/${file}`);
  }
  socket.close();
} finally {
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
