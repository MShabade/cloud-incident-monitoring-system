const CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js';
const LOCAL = '/vendor/chart.umd.min.js';

function waitForChart(maxMs = 10000) {
  return new Promise((resolve, reject) => {
    if (window.Chart) return resolve();

    const started = Date.now();
    const tick = () => {
      if (window.Chart) return resolve();
      if (Date.now() - started > maxMs) return reject(new Error('Chart.js load timeout'));
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function injectScript(src, isFallback = false) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.dataset.chartLoader = isFallback ? 'fallback' : 'primary';
    script.onload = () => (window.Chart ? resolve() : reject(new Error('Chart global missing after load')));
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/** Ensure Chart.js is loaded before dashboard renders */
export async function ensureChartJs() {
  if (window.Chart) return;

  // Allow inline <script> tag (with CDN onerror fallback) time to finish
  try {
    await waitForChart(3000);
    return;
  } catch {
    // continue to dynamic load
  }

  try {
    await injectScript(LOCAL);
    return;
  } catch {
    // local missing — try CDN
  }

  await injectScript(CDN, true);
  if (!window.Chart) throw new Error('Chart.js unavailable');
}
