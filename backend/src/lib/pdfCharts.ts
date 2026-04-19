// Lightweight SVG chart renderer — no runtime deps. Produces print-safe
// SVG strings that embed directly in Puppeteer HTML. Charts are sized in
// mm so they scale predictably on A4.

export interface Period {
  label: string;
  revenue?: number;
  costs?: number;
  cashIn?: number;
  cashOut?: number;
}

export interface FinancePayload {
  startingCash?: number;
  periods?: Period[];
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

function formatK(n: number, currency: string): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ${currency}`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)}k ${currency}`;
  return `${Math.round(n)} ${currency}`;
}

interface ChartOpts {
  accent: string;
  currency: string;
  title: string;
  subtitle?: string;
}

/** Revenue vs. Costs grouped bar chart. Returns an SVG string. */
export function revenueCostsChart(periods: Period[], opts: ChartOpts): string {
  if (!periods.length) return '';
  const W = 600;
  const H = 280;
  const M = { top: 40, right: 20, bottom: 48, left: 56 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;

  const maxVal = Math.max(...periods.flatMap((p) => [p.revenue || 0, p.costs || 0]), 1);
  const yTicks = 4;
  const barGap = 6;
  const groupW = iw / periods.length;
  const barW = (groupW - barGap * 3) / 2;
  const costColor = '#ef4444';

  const yPos = (v: number) => M.top + ih - (v / maxVal) * ih;

  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = (maxVal / yTicks) * i;
    const y = yPos(v);
    return `
      <line x1="${M.left}" x2="${W - M.right}" y1="${y}" y2="${y}" stroke="#e5e7eb" stroke-width="0.6" />
      <text x="${M.left - 8}" y="${y + 4}" text-anchor="end" font-size="9" fill="#9ca3af">${esc(formatK(v, opts.currency))}</text>
    `;
  }).join('');

  const bars = periods.map((p, i) => {
    const gx = M.left + i * groupW + barGap;
    const rY = yPos(p.revenue || 0);
    const cY = yPos(p.costs || 0);
    return `
      <rect x="${gx}" y="${rY}" width="${barW}" height="${M.top + ih - rY}" fill="${opts.accent}" rx="2" />
      <rect x="${gx + barW + barGap}" y="${cY}" width="${barW}" height="${M.top + ih - cY}" fill="${costColor}" opacity="0.82" rx="2" />
      <text x="${gx + barW + barGap / 2}" y="${H - M.bottom + 16}" text-anchor="middle" font-size="9" fill="#6b7280">${esc(p.label)}</text>
    `;
  }).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="chart-svg">
  <text x="${M.left}" y="20" font-size="13" font-weight="700" fill="#0b1120">${esc(opts.title)}</text>
  ${opts.subtitle ? `<text x="${M.left}" y="34" font-size="9" fill="#6b7280">${esc(opts.subtitle)}</text>` : ''}
  ${gridLines}
  ${bars}
  <g transform="translate(${W - M.right - 150}, ${14})">
    <rect x="0" y="-6" width="10" height="10" fill="${opts.accent}" rx="2" />
    <text x="16" y="2" font-size="10" fill="#374151">Umsatz</text>
    <rect x="70" y="-6" width="10" height="10" fill="${costColor}" opacity="0.82" rx="2" />
    <text x="86" y="2" font-size="10" fill="#374151">Kosten</text>
  </g>
</svg>`;
}

/** Cumulative cash flow line / area chart. */
export function cashFlowChart(periods: Period[], startingCash: number, opts: ChartOpts): string {
  if (!periods.length) return '';
  const W = 600;
  const H = 260;
  const M = { top: 40, right: 20, bottom: 48, left: 56 };
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;

  // Cumulative cash trajectory
  let bal = startingCash || 0;
  const points = [{ label: 'Start', bal }];
  periods.forEach((p) => {
    bal += (p.cashIn || 0) - (p.cashOut || 0);
    points.push({ label: p.label, bal });
  });

  const vals = points.map((p) => p.bal);
  const minV = Math.min(0, ...vals);
  const maxV = Math.max(...vals, 1);
  const range = maxV - minV || 1;
  const yTicks = 4;

  const xPos = (i: number) => M.left + (i / Math.max(1, points.length - 1)) * iw;
  const yPos = (v: number) => M.top + ih - ((v - minV) / range) * ih;

  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = minV + (range / yTicks) * i;
    const y = yPos(v);
    return `
      <line x1="${M.left}" x2="${W - M.right}" y1="${y}" y2="${y}" stroke="#e5e7eb" stroke-width="0.6" />
      <text x="${M.left - 8}" y="${y + 4}" text-anchor="end" font-size="9" fill="#9ca3af">${esc(formatK(v, opts.currency))}</text>
    `;
  }).join('');

  const zeroY = yPos(0);
  const zeroLine = minV < 0 ? `<line x1="${M.left}" x2="${W - M.right}" y1="${zeroY}" y2="${zeroY}" stroke="#0b1120" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.5" />` : '';

  const polyPoints = points.map((p, i) => `${xPos(i)},${yPos(p.bal)}`).join(' ');
  const areaPoints = `${M.left},${yPos(Math.max(0, minV))} ${polyPoints} ${xPos(points.length - 1)},${yPos(Math.max(0, minV))}`;

  const xLabels = points.map((p, i) => {
    if (i % 2 !== 0 && i !== points.length - 1) return '';
    return `<text x="${xPos(i)}" y="${H - M.bottom + 16}" text-anchor="middle" font-size="9" fill="#6b7280">${esc(p.label)}</text>`;
  }).join('');

  const dots = points.map((p, i) => `<circle cx="${xPos(i)}" cy="${yPos(p.bal)}" r="3" fill="${opts.accent}" />`).join('');

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="chart-svg">
  <text x="${M.left}" y="20" font-size="13" font-weight="700" fill="#0b1120">${esc(opts.title)}</text>
  ${opts.subtitle ? `<text x="${M.left}" y="34" font-size="9" fill="#6b7280">${esc(opts.subtitle)}</text>` : ''}
  ${gridLines}
  ${zeroLine}
  <polygon points="${areaPoints}" fill="${opts.accent}" opacity="0.12" />
  <polyline points="${polyPoints}" fill="none" stroke="${opts.accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
  ${dots}
  ${xLabels}
</svg>`;
}

/** Render both charts into one block with basic KPI row above. */
export function renderFinanceChartsBlock(finance: FinancePayload, accent: string, currency: string): string {
  const periods = finance.periods || [];
  if (periods.length === 0) return '';

  const totalRevenue = periods.reduce((s, p) => s + (p.revenue || 0), 0);
  const totalCosts = periods.reduce((s, p) => s + (p.costs || 0), 0);
  const profit = totalRevenue - totalCosts;
  const startingCash = finance.startingCash || 0;
  let cash = startingCash;
  periods.forEach((p) => { cash += (p.cashIn || 0) - (p.cashOut || 0); });

  const kpi = (label: string, value: string, positive?: boolean) => `
    <div class="kpi">
      <span class="kpi-label">${esc(label)}</span>
      <span class="kpi-value" style="color:${positive === false ? '#ef4444' : positive === true ? '#22c55e' : '#0b1120'}">${esc(value)}</span>
    </div>
  `;

  return `
    <div class="finance-chart-block">
      <div class="kpi-row">
        ${kpi('Umsatz gesamt', formatK(totalRevenue, currency))}
        ${kpi('Kosten gesamt', formatK(totalCosts, currency))}
        ${kpi('Ergebnis', formatK(profit, currency), profit >= 0)}
        ${kpi('Kassenbestand Ende', formatK(cash, currency), cash >= 0)}
      </div>
      <div class="chart-wrap">
        ${revenueCostsChart(periods, { accent, currency, title: 'Umsatz vs. Kosten', subtitle: 'pro Periode' })}
      </div>
      <div class="chart-wrap">
        ${cashFlowChart(periods, startingCash, { accent, currency, title: 'Liquidität — kumulierter Kassenstand', subtitle: `Startkapital ${formatK(startingCash, currency)}` })}
      </div>
    </div>
  `;
}
