import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

interface MetricRow {
  id: number;
  metricName: string;
  metricValue: number;
  timestamp: string;
}

interface DashboardData {
  users?: { total: number; active: number; new24h: number; new7d: number; new30d: number };
  posts?: { total: number; published: number; drafts: number };
}

interface SystemHealthData {
  uptime?: number;
  uptimeFormatted?: string;
  memoryUsage?: { rss: number; heapUsed: number; heapTotal: number; percentUsed: number };
  cpu?: { loadAvg1m: string; cores: number };
  api?: { totalRequests: number; avgResponseTime: number };
  system?: { platform: string; nodeVersion: string; totalMemory: number; freeMemory: number };
}

const COLORS = {
  primary: '#3b82f6',
  dark: '#0f172a',
  text: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
  success: '#22c55e',
  white: '#ffffff',
};

/**
 * Generate a styled PDF report of system metrics.
 * Returns a Buffer containing the PDF data.
 */
export const generateMetricsPDF = async (
  metrics: MetricRow[],
  dashboardData?: DashboardData,
  systemHealth?: SystemHealthData
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Aura Admin — Metrics Report',
        Author: 'Aura Admin Dashboard',
        Subject: 'System Metrics Export',
        CreationDate: new Date(),
      },
    });

    const buffers: Buffer[] = [];
    const stream = new PassThrough();

    stream.on('data', (chunk: Buffer) => buffers.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);

    doc.pipe(stream);

    // ─── Header ───
    drawHeader(doc);

    // ─── Dashboard Summary ───
    if (dashboardData) {
      drawDashboardSummary(doc, dashboardData);
    }

    // ─── System Health ───
    if (systemHealth) {
      drawSystemHealth(doc, systemHealth);
    }

    // ─── Metrics Table ───
    if (metrics.length > 0) {
      drawMetricsTable(doc, metrics);
    }

    // ─── Footer ───
    drawFooter(doc);

    doc.end();
  });
};

function drawHeader(doc: PDFKit.PDFDocument) {
  // Brand bar
  doc.rect(0, 0, doc.page.width, 80).fill(COLORS.primary);
  doc.fontSize(24).fill(COLORS.white).text('A', 50, 22, { continued: true });
  doc.fontSize(20).text('  Aura Admin — Metrics Report', { baseline: 'middle' });
  doc.fontSize(10).fill('#dbeafe').text(
    `Generated: ${new Date().toLocaleString()}`,
    50, 52
  );
  doc.moveDown(3);
  doc.y = 100;
}

function drawDashboardSummary(doc: PDFKit.PDFDocument, data: DashboardData) {
  doc.fontSize(16).fill(COLORS.text).text('Dashboard Overview', 50);
  doc.moveDown(0.5);

  const startY = doc.y;
  const colWidth = 160;
  const boxHeight = 60;
  const items = [
    { label: 'Total Users', value: String(data.users?.total ?? '—') },
    { label: 'Active Users', value: String(data.users?.active ?? '—') },
    { label: 'New (7d)', value: String(data.users?.new7d ?? '—') },
    { label: 'Published Posts', value: String(data.posts?.published ?? '—') },
    { label: 'Draft Posts', value: String(data.posts?.drafts ?? '—') },
  ];

  items.forEach((item, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 50 + col * (colWidth + 10);
    const y = startY + row * (boxHeight + 10);

    doc.rect(x, y, colWidth, boxHeight).lineWidth(1).stroke(COLORS.border);
    doc.fontSize(9).fill(COLORS.muted).text(item.label, x + 10, y + 10, { width: colWidth - 20 });
    doc.fontSize(18).fill(COLORS.text).text(item.value, x + 10, y + 28, { width: colWidth - 20 });
  });

  doc.y = startY + Math.ceil(items.length / 3) * (boxHeight + 10) + 10;
  doc.moveDown(1);
}

function drawSystemHealth(doc: PDFKit.PDFDocument, health: SystemHealthData) {
  doc.fontSize(16).fill(COLORS.text).text('System Health', 50);
  doc.moveDown(0.5);

  const rows = [
    ['Uptime', health.uptimeFormatted || '—'],
    ['Memory Usage', `${health.memoryUsage?.percentUsed ?? 0}% (${health.memoryUsage?.heapUsed ?? 0}MB / ${health.memoryUsage?.heapTotal ?? 0}MB)`],
    ['CPU Load (1m)', health.cpu?.loadAvg1m || '0'],
    ['CPU Cores', String(health.cpu?.cores ?? '—')],
    ['Avg Response Time', `${health.api?.avgResponseTime ?? 0}ms`],
    ['Total Requests', String(health.api?.totalRequests ?? 0)],
    ['Platform', health.system?.platform || '—'],
    ['Node.js', health.system?.nodeVersion || '—'],
    ['Total Memory', `${health.system?.totalMemory ?? 0} MB`],
    ['Free Memory', `${health.system?.freeMemory ?? 0} MB`],
  ];

  const tableTop = doc.y;
  const col1Width = 160;
  const col2Width = 320;
  const rowHeight = 22;

  rows.forEach((row, i) => {
    const y = tableTop + i * rowHeight;
    if (i % 2 === 0) {
      doc.rect(50, y, col1Width + col2Width, rowHeight).fill('#f8fafc');
    }
    doc.fontSize(10).fill(COLORS.muted).text(row[0], 55, y + 6, { width: col1Width - 10 });
    doc.fontSize(10).fill(COLORS.text).text(row[1], 50 + col1Width + 5, y + 6, { width: col2Width - 10 });
  });

  doc.y = tableTop + rows.length * rowHeight + 15;
  doc.moveDown(1);
}

function drawMetricsTable(doc: PDFKit.PDFDocument, metrics: MetricRow[]) {
  // Check if we need a new page
  if (doc.y > 600) {
    doc.addPage();
    doc.y = 50;
  }

  doc.fontSize(16).fill(COLORS.text).text('Metrics Data', 50);
  doc.moveDown(0.5);

  const headers = ['#', 'Metric Name', 'Value', 'Timestamp'];
  const colWidths = [40, 160, 100, 190];
  const rowHeight = 20;
  let y = doc.y;

  // Header row
  doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill(COLORS.primary);
  let x = 55;
  headers.forEach((header, i) => {
    doc.fontSize(9).fill(COLORS.white).text(header, x, y + 6, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });
  y += rowHeight;

  // Data rows (limit to 100 rows per page section)
  const maxRows = Math.min(metrics.length, 200);
  for (let i = 0; i < maxRows; i++) {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }

    const m = metrics[i];
    if (i % 2 === 0) {
      doc.rect(50, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill('#f8fafc');
    }

    x = 55;
    const cells = [
      String(m.id),
      m.metricName,
      String(m.metricValue),
      new Date(m.timestamp).toLocaleString(),
    ];
    cells.forEach((cell, ci) => {
      doc.fontSize(8).fill(COLORS.text).text(cell, x, y + 6, { width: colWidths[ci] - 10 });
      x += colWidths[ci];
    });
    y += rowHeight;
  }

  if (metrics.length > maxRows) {
    doc.fontSize(9).fill(COLORS.muted).text(
      `... and ${metrics.length - maxRows} more rows (showing first ${maxRows})`,
      55, y + 5
    );
  }

  doc.y = y + 15;
}

function drawFooter(doc: PDFKit.PDFDocument) {
  const bottom = doc.page.height - 40;
  doc.fontSize(8).fill(COLORS.muted).text(
    `© ${new Date().getFullYear()} Aura Admin Dashboard — Confidential`,
    50, bottom,
    { align: 'center', width: doc.page.width - 100 }
  );
}
