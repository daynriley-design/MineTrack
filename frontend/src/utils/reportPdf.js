/**
 * Generateur de rapports PDF MineTrack (texte vectoriel, jsPDF).
 *
 * Page de garde : modele « Annual Report » (formes geometriques, grand titre
 * serif, periode, bloc « Prepare pour ») en orange pale.
 * Corps : modele du rapport technique (table des matieres, sections
 * numerotees 1. / 1.1, tableaux legendes « Tableau N : », numero de page).
 *
 * generateReport({
 *   fileName, period, title: ['Rapport', 'de shift'], kind: 'JOURNALIER',
 *   preparedFor: ['Reliant Congo', 'Site Kadutu'], preparedBy: 'Manager',
 *   sections: [{ title, blocks: [
 *     { type: 'p', text },
 *     { type: 'table', caption, head: [...], rows: [[...]], widths?: [fractions] },
 *     { type: 'sub', title, blocks: [...] },
 *     { type: 'list', items: [...] },
 *     { type: 'signatures', roles: ['Superviseur', 'Chef de mine'] },
 *   ] }],
 * })
 */

const PAGE_W = 210;
const PAGE_H = 297;
const M_LEFT = 25;
const M_RIGHT = 20;
const M_TOP = 25;
const M_BOTTOM = 25;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;
const PT = 0.3528; // 1 pt en mm

// Orange pale (pas l'orange vif de l'interface)
const ORANGE = {
  deep: [240, 178, 128],   // formes « sombres » du modele
  mid: [246, 199, 158],
  soft: [250, 222, 196],
  light: [253, 238, 224],  // formes claires, en-tetes de tableau
  line: [232, 196, 166],   // filets
};
const INK = [26, 26, 26];
const GREY = [85, 85, 85];
const MUTED = [130, 130, 130];
const RULE = [200, 200, 200];

// Polices standard PDF = WinAnsi : on remplace ce qu'elles ne savent pas afficher.
const WINANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const REPLACE = { '≤': '<=', '≥': '>=', '≠': '!=', '→': '->', '←': '<-', '✓': 'v', '✔': 'v', '✗': 'x', '·': '·', ' ': ' ', ' ': ' ' };
export function pdfText(value) {
  const s = value === null || value === undefined ? '' : String(value);
  let out = '';
  for (const ch of s) {
    if (REPLACE[ch] !== undefined) out += REPLACE[ch];
    else if (ch.codePointAt(0) <= 0xff || WINANSI_EXTRA.includes(ch)) out += ch;
    // sinon (emoji, symboles) : ignore
  }
  return out.replace(/[ \t]+\n/g, '\n').trim();
}

async function loadImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

function poly(doc, points, rgb) {
  doc.setFillColor(...rgb);
  const [x0, y0] = points[0];
  const deltas = [];
  for (let i = 1; i < points.length; i++) {
    deltas.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
  }
  doc.lines(deltas, x0, y0, [1, 1], 'F', true);
}

function drawCover(doc, { period, title, kind, preparedFor, preparedBy, logo }) {
  // Formes du haut (modele : grand coin sombre, bande claire, petit triangle)
  poly(doc, [[37, 0], [210, 0], [210, 4], [64, 34]], ORANGE.soft);
  poly(doc, [[0, 0], [37, 0], [81, 61], [0, 47.5]], ORANGE.mid);
  poly(doc, [[0, 0], [24, 0], [58, 50], [0, 40]], ORANGE.deep); // effet degrade
  poly(doc, [[67, 35], [97, 31], [86, 60]], ORANGE.light);

  // Formes du bas
  poly(doc, [[111, 267], [123, 297], [93, 297]], ORANGE.light);
  poly(doc, [[115, 263], [184, 228], [140, 297], [126, 297]], ORANGE.soft);
  poly(doc, [[210, 188], [210, 297], [130, 297]], ORANGE.mid);
  poly(doc, [[210, 212], [210, 297], [150, 297]], ORANGE.deep);

  if (logo) {
    const w = 40;
    const h = (logo.h / logo.w) * w;
    doc.addImage(logo.dataUrl, 'PNG', 152, 44, w, h);
  }

  const x = 21;
  doc.setFont('times', 'normal');
  doc.setTextColor(...GREY);
  doc.setFontSize(26);
  doc.text(pdfText(period), x, 96);

  // Grand titre : taille ajustee pour tenir dans ~125 mm
  doc.setTextColor(...INK);
  const lines = (Array.isArray(title) ? title : [title]).map(pdfText);
  let size = 72;
  doc.setFontSize(size);
  while (size > 30 && Math.max(...lines.map((l) => doc.getTextWidth(l))) > 125) {
    size -= 2;
    doc.setFontSize(size);
  }
  const lineGap = size * PT * 0.95;
  let y = 96 + 8 + size * PT * 0.75;
  lines.forEach((l) => { doc.text(l, x - 1, y); y += lineGap; });

  doc.setTextColor(...GREY);
  doc.setFontSize(17);
  doc.text(pdfText(kind).toUpperCase(), x, y - lineGap + 13, { charSpace: 1.1 });

  // Bloc « Prepare pour »
  let by = 241;
  doc.setTextColor(40, 40, 60);
  doc.setFontSize(13);
  doc.text('Préparé pour :', x + 1, by, { charSpace: 0.6 });
  doc.setFontSize(11.5);
  (preparedFor || []).forEach((l) => { by += 8.5; doc.text(pdfText(l), x, by, { charSpace: 0.35 }); });
  if (preparedBy) {
    by += 12;
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(pdfText(`Préparé par : ${preparedBy}`), x, by);
  }
}

class Writer {
  constructor(doc, docTitle) {
    this.doc = doc;
    this.docTitle = docTitle;
    this.y = M_TOP;
    this.tableNo = 0;
    this.toc = [];
  }

  newPage() {
    this.doc.addPage();
    this.y = M_TOP;
  }

  ensure(h) {
    if (this.y + h > PAGE_H - M_BOTTOM) this.newPage();
  }

  page() {
    return this.doc.getCurrentPageInfo().pageNumber;
  }

  heading(num, label, level) {
    const doc = this.doc;
    const size = level === 1 ? 15 : 12.5;
    // Un titre ne reste jamais seul en bas de page : on reserve la place
    // du titre + le debut de son contenu (en-tete de tableau + 2 lignes).
    this.ensure(level === 1 ? 48 : 42);
    if (level === 1 && this.y > M_TOP + 1) this.y += 4;
    doc.setFont('times', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(...INK);
    const text = `${num} ${pdfText(label)}`;
    const lines = doc.splitTextToSize(text, CONTENT_W);
    this.y += size * PT;
    doc.text(lines, M_LEFT, this.y);
    this.y += (lines.length - 1) * size * PT * 1.25 + (level === 1 ? 5 : 3.5);
    this.toc.push({ level, label: text, page: this.page() });
  }

  paragraph(text) {
    const doc = this.doc;
    const size = 11.5;
    const lh = size * PT * 1.5;
    doc.setFont('times', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...INK);
    pdfText(text).split(/\n+/).forEach((para) => {
      const lines = doc.splitTextToSize(para, CONTENT_W);
      let i = 0;
      while (i < lines.length) {
        const room = Math.max(1, Math.floor((PAGE_H - M_BOTTOM - this.y) / lh));
        if (room < 2 && lines.length - i > 1) { this.newPage(); continue; }
        const chunk = lines.slice(i, i + room);
        const last = i + chunk.length >= lines.length;
        chunk.forEach((ln, k) => {
          const isLastLine = last && k === chunk.length - 1;
          this.y += lh * (k === 0 ? 0.8 : 1);
          if (isLastLine || chunk.length === 1) doc.text(ln, M_LEFT, this.y);
          else doc.text(ln, M_LEFT, this.y, { align: 'justify', maxWidth: CONTENT_W });
        });
        this.y += lh * 0.2;
        i += chunk.length;
        if (i < lines.length) this.newPage();
      }
      this.y += 2.5;
    });
  }

  list(items) {
    const doc = this.doc;
    const size = 11.5;
    const lh = size * PT * 1.45;
    doc.setFont('times', 'normal');
    doc.setFontSize(size);
    items.forEach((it) => {
      const lines = doc.splitTextToSize(pdfText(it), CONTENT_W - 8);
      this.ensure(lines.length * lh + 2);
      doc.setTextColor(...ORANGE.deep);
      doc.text('»', M_LEFT + 1, this.y + lh * 0.8);
      doc.setTextColor(...INK);
      lines.forEach((ln, k) => doc.text(ln, M_LEFT + 7, this.y + lh * (0.8 + k)));
      this.y += lines.length * lh + 1;
    });
    this.y += 2;
  }

  table({ caption, head, rows, widths }) {
    const doc = this.doc;
    const n = head.length;
    const fr = widths && widths.length === n ? widths : Array(n).fill(1);
    const sum = fr.reduce((a, b) => a + b, 0);
    const colW = fr.map((f) => (f / sum) * CONTENT_W);
    const size = 10;
    const lh = size * PT * 1.35;
    const pad = 2;

    const measure = (cells, bold) => {
      doc.setFont('times', bold ? 'bold' : 'normal');
      doc.setFontSize(size);
      const wrapped = cells.map((c, i) => doc.splitTextToSize(pdfText(c) || '—', colW[i] - 2 * pad));
      const h = Math.max(...wrapped.map((w) => w.length)) * lh + 2 * pad;
      return { wrapped, h };
    };

    const drawRow = (cells, bold, fill) => {
      const { wrapped, h } = measure(cells, bold);
      if (fill) {
        doc.setFillColor(...fill);
        doc.rect(M_LEFT, this.y, CONTENT_W, h, 'F');
      }
      let x = M_LEFT;
      doc.setTextColor(...INK);
      wrapped.forEach((lines, i) => {
        lines.forEach((ln, k) => {
          const ty = this.y + pad + lh * (k + 0.78);
          if (bold) doc.text(ln, x + colW[i] / 2, ty, { align: 'center' });
          else doc.text(ln, x + pad, ty);
        });
        x += colW[i];
      });
      doc.setDrawColor(...RULE);
      doc.setLineWidth(0.2);
      doc.line(M_LEFT, this.y + h, M_LEFT + CONTENT_W, this.y + h);
      // filets verticaux discrets
      let vx = M_LEFT;
      colW.slice(0, -1).forEach((w) => { vx += w; doc.line(vx, this.y, vx, this.y + h); });
      this.y += h;
    };

    const drawHead = () => {
      doc.setDrawColor(...ORANGE.line);
      doc.setLineWidth(0.5);
      doc.line(M_LEFT, this.y, M_LEFT + CONTENT_W, this.y);
      drawRow(head, true, ORANGE.light);
    };

    this.ensure(measure(head, true).h + (rows[0] ? measure(rows[0], false).h : 0) + 12);
    drawHead();
    rows.forEach((r) => {
      const { h } = measure(r, false);
      if (this.y + h > PAGE_H - M_BOTTOM - 8) { this.newPage(); drawHead(); }
      drawRow(r, false, null);
    });
    doc.setDrawColor(...ORANGE.line);
    doc.setLineWidth(0.5);
    doc.line(M_LEFT, this.y, M_LEFT + CONTENT_W, this.y);

    this.tableNo += 1;
    if (caption) {
      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(...GREY);
      this.y += 5;
      doc.text(pdfText(`Tableau ${this.tableNo} : ${caption}`), PAGE_W / 2 + (M_LEFT - M_RIGHT) / 2, this.y, { align: 'center' });
    }
    this.y += 6;
  }

  signatures(roles) {
    const doc = this.doc;
    this.ensure(42);
    this.y += 14;
    const w = (CONTENT_W - 20) / roles.length;
    roles.forEach((role, i) => {
      const x = M_LEFT + i * (w + 20 / Math.max(1, roles.length - 1 || 1));
      doc.setDrawColor(...INK);
      doc.setLineWidth(0.3);
      doc.line(x, this.y + 18, x + w, this.y + 18);
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text(pdfText(role), x + w / 2, this.y + 24, { align: 'center' });
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...MUTED);
      doc.text("Nom, date et visa d'approbation", x + w / 2, this.y + 29, { align: 'center' });
    });
    this.y += 34;
  }

  blocks(list, num) {
    let sub = 0;
    (list || []).forEach((b) => {
      if (b.type === 'p') this.paragraph(b.text);
      else if (b.type === 'list') this.list(b.items || []);
      else if (b.type === 'table') this.table(b);
      else if (b.type === 'signatures') this.signatures(b.roles || []);
      else if (b.type === 'sub') {
        sub += 1;
        this.heading(`${num}.${sub}`, b.title, 2);
        this.blocks(b.blocks, `${num}.${sub}`);
      }
    });
  }
}

function drawToc(doc, entries) {
  doc.setPage(2);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text('Table des matières', PAGE_W / 2 + (M_LEFT - M_RIGHT) / 2, M_TOP + 12, { align: 'center' });
  let y = M_TOP + 28;
  entries.forEach((e) => {
    if (y > PAGE_H - M_BOTTOM) return; // la table tient sur une page
    const indent = e.level === 1 ? 0 : 7;
    const size = e.level === 1 ? 11.5 : 11;
    doc.setFont('times', 'bold');
    doc.setFontSize(size);
    const label = doc.splitTextToSize(e.label, CONTENT_W - indent - 14)[0];
    const num = String(e.page);
    const lw = doc.getTextWidth(label);
    const nw = doc.getTextWidth(num);
    doc.text(label, M_LEFT + indent, y);
    doc.setFont('times', 'normal');
    doc.text(num, M_LEFT + CONTENT_W, y, { align: 'right' });
    // points de conduite
    const dotsStart = M_LEFT + indent + lw + 1.5;
    const dotsEnd = M_LEFT + CONTENT_W - nw - 1.5;
    const dw = doc.getTextWidth('.');
    if (dotsEnd > dotsStart) doc.text('.'.repeat(Math.floor((dotsEnd - dotsStart) / dw)), dotsStart, y);
    y += e.level === 1 ? 9 : 7.5;
  });
}

function drawFooters(doc, docTitle) {
  const total = doc.getNumberOfPages();
  for (let p = 2; p <= total; p++) {
    doc.setPage(p);
    doc.setDrawColor(...ORANGE.line);
    doc.setLineWidth(0.3);
    doc.line(M_LEFT, 14, PAGE_W - M_RIGHT, 14);
    doc.setFont('times', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(pdfText(`MineTrack — ${docTitle}`), M_LEFT, 11.5);
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(String(p), PAGE_W / 2 + (M_LEFT - M_RIGHT) / 2, PAGE_H - 12, { align: 'center' });
  }
}

/** Construit le PDF et le telecharge. Renvoie le document jsPDF (tests). */
export async function generateReport(opts) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  // opts.logo ({ dataUrl, w, h }) permet de fournir le logo hors navigateur (tests).
  const logo = opts.logo || await loadImage('/logo-full.png');
  const docTitle = (Array.isArray(opts.title) ? opts.title.join(' ') : opts.title) + (opts.kind ? ` ${opts.kind.toLowerCase()}` : '');

  doc.setProperties({ title: `MineTrack — ${docTitle}`, creator: 'MineTrack' });
  drawCover(doc, { ...opts, logo });

  doc.addPage(); // page 2 reservee a la table des matieres
  const w = new Writer(doc, docTitle);
  w.newPage();
  (opts.sections || []).forEach((s, i) => {
    w.heading(`${i + 1}.`, s.title, 1);
    w.blocks(s.blocks, `${i + 1}`);
  });

  drawToc(doc, w.toc);
  drawFooters(doc, docTitle);
  if (opts.fileName !== false) doc.save(opts.fileName || 'rapport_minetrack.pdf');
  return doc;
}

/** Transforme un payload de rapport (objet JSON) en lignes « Champ | Valeur ». */
export function payloadRows(raw) {
  let data;
  try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return [['Contenu', String(raw)]]; }
  if (!data || typeof data !== 'object') return [['Contenu', String(data ?? '—')]];
  const label = (k) => k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const val = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
    if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? Object.values(x).join(' · ') : x)).join('\n');
    if (typeof v === 'object') return Object.entries(v).map(([k, x]) => `${label(k)} : ${val(x)}`).join('\n');
    return String(v);
  };
  return Object.entries(data).map(([k, v]) => [label(k), val(v)]);
}
