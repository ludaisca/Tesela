// ============================================================================
// Tesela — Motor procedural de miniaturas UI en SVG (24 insignias de carpeta + 212 vistas previas en vivo por slug)
// Código vectorial 100% propio: adaptable al tema, a la medida de cada slug y animado al pasar el cursor
// ============================================================================

(function () {
  function hashSlug(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // --------------------------------------------------------------------------
  // 1. 24 iconos en miniatura para los encabezados de categoría (SVG de micro-ventanas a medida, 80x60)
  // --------------------------------------------------------------------------
  function getCategoryIcon(catId) {
    const frame = (inner) => `<svg viewBox="0 0 80 60" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="cat-mini-svg">
      <rect x="0.5" y="0.5" width="79" height="59" rx="3.5" class="op-30"/>
      <line x1="0.5" y1="6.5" x2="79.5" y2="6.5" class="op-45"/>
      <circle cx="3.5" cy="3.5" r="0.75" fill="currentColor" class="op-35" stroke="none"/>
      <circle cx="6" cy="3.5" r="0.75" fill="currentColor" class="op-35" stroke="none"/>
      <circle cx="8.5" cy="3.5" r="0.75" fill="currentColor" class="op-35" stroke="none"/>
      ${inner}
    </svg>`;

    switch (catId) {
      case "layouts":
        return frame(`
          <rect x="1" y="7" width="22" height="52.5" fill="currentColor" class="op-05" stroke="none"/>
          <line x1="23" y1="7" x2="23" y2="59.5" class="op-40"/>
          <rect x="4" y="10" width="3.5" height="3.5" rx="0.6" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="9" y="10.5" width="9" height="1.3" rx="0.4" fill="currentColor" class="op-65" stroke="none"/>
          <rect x="3" y="18" width="17" height="3.6" rx="0.9" fill="currentColor" class="op-15" stroke="none"/>
          <rect x="4.5" y="19.2" width="12" height="1.3" rx="0.4" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="4.5" y="24.5" width="11" height="1.2" rx="0.4" fill="currentColor" class="op-45" stroke="none"/>
          <rect x="4.5" y="28.5" width="13" height="1.2" rx="0.4" fill="currentColor" class="op-45" stroke="none"/>
          <rect x="27" y="11" width="22" height="1.8" rx="0.5" fill="currentColor" class="op-70" stroke="none"/>
          <rect x="27" y="19" width="48" height="15" rx="1.5" class="op-35"/>
          <rect x="27" y="38" width="48" height="15" rx="1.5" class="op-35"/>
        `);
      case "forms":
        return frame(`
          <rect x="12" y="11" width="56" height="43" rx="2.5" class="op-35"/>
          <rect x="17" y="16" width="18" height="1.6" rx="0.5" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="17" y="20" width="46" height="6.5" rx="1.2" class="op-45"/>
          <rect x="17" y="30" width="15" height="1.6" rx="0.5" fill="currentColor" class="op-65" stroke="none"/>
          <rect x="17" y="34" width="46" height="6.5" rx="1.2" class="op-45"/>
          <rect x="47" y="44" width="16" height="5.5" rx="1.2" fill="currentColor" class="op-85" stroke="none"/>
        `);
      case "auth":
        return frame(`
          <rect x="18" y="10" width="44" height="45" rx="2.5" class="op-35"/>
          <circle cx="40" cy="16" r="2.2" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="23" y="22" width="15" height="5" rx="1" class="op-40"/>
          <rect x="42" y="22" width="15" height="5" rx="1" class="op-40"/>
          <line x1="23" y1="31" x2="35" y2="31" class="op-25"/>
          <text x="40" y="32.5" text-anchor="middle" font-size="4.2" fill="currentColor" stroke="none" class="op-55">o</text>
          <line x1="45" y1="31" x2="57" y2="31" class="op-25"/>
          <rect x="23" y="36" width="34" height="5.5" rx="1" class="op-40"/>
          <rect x="23" y="44.5" width="34" height="5.5" rx="1" fill="currentColor" class="op-85" stroke="none"/>
        `);
      case "dashboards":
        return frame(`
          <rect x="5" y="10" width="21" height="13" rx="1.5" class="op-35"/>
          <rect x="29.5" y="10" width="21" height="13" rx="1.5" class="op-35"/>
          <rect x="54" y="10" width="21" height="13" rx="1.5" class="op-35"/>
          <rect x="5" y="26.5" width="45.5" height="28" rx="1.5" class="op-35"/>
          <polyline points="9,49 18,43 26,45 36,35 46,31" stroke="currentColor" stroke-width="1.4" class="op-85"/>
          <rect x="54" y="26.5" width="21" height="28" rx="1.5" class="op-35"/>
        `);
      case "tables":
        return frame(`
          <rect x="5" y="11" width="70" height="43" rx="2" class="op-35"/>
          <line x1="5" y1="19" x2="75" y2="19" class="op-40"/>
          <line x1="5" y1="29" x2="75" y2="29" class="op-22"/>
          <line x1="5" y1="39" x2="75" y2="39" class="op-22"/>
          <line x1="5" y1="49" x2="75" y2="49" class="op-22"/>
          <rect x="9" y="14" width="16" height="1.8" rx="0.5" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="9" y="23" width="22" height="1.6" rx="0.5" fill="currentColor" class="op-60" stroke="none"/>
          <rect x="9" y="33" width="19" height="1.6" rx="0.5" fill="currentColor" class="op-60" stroke="none"/>
          <rect x="9" y="43" width="24" height="1.6" rx="0.5" fill="currentColor" class="op-60" stroke="none"/>
        `);
      case "filters":
        return frame(`
          <rect x="6" y="11" width="26" height="7" rx="3.5" class="op-55"/>
          <rect x="35" y="11" width="26" height="7" rx="3.5" class="op-30" stroke-dasharray="1.5 1.5"/>
          <rect x="14" y="22" width="46" height="32" rx="2.5" class="op-55"/>
          <rect x="19" y="27" width="4" height="4" rx="0.8" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="26" y="28.2" width="22" height="1.6" rx="0.5" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="19" y="35" width="4" height="4" rx="0.8" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="26" y="36.2" width="18" height="1.6" rx="0.5" fill="currentColor" class="op-75" stroke="none"/>
        `);
      case "empty-states":
        return frame(`
          <rect x="10" y="12" width="60" height="42" rx="2.5" stroke-dasharray="2.5 2.5" class="op-35"/>
          <circle cx="40" cy="26" r="5.5" class="op-65"/>
          <rect x="28" y="35" width="24" height="2" rx="0.6" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="32" y="40" width="16" height="5" rx="1.2" fill="currentColor" class="op-85" stroke="none"/>
        `);
      case "settings":
        return frame(`
          <rect x="10" y="13" width="60" height="16" rx="2" class="op-35"/>
          <rect x="15" y="19.5" width="24" height="2" rx="0.6" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="54" y="17.5" width="11" height="6" rx="3" fill="currentColor" class="op-85" stroke="none"/>
          <circle cx="62" cy="20.5" r="2" fill="var(--bg)" stroke="none"/>
          <rect x="10" y="34" width="60" height="16" rx="2" class="op-35"/>
          <rect x="15" y="40.5" width="20" height="2" rx="0.6" fill="currentColor" class="op-55" stroke="none"/>
          <rect x="54" y="38.5" width="11" height="6" rx="3" class="op-45"/>
        `);
      case "cards":
        return frame(`
          <rect x="14" y="12" width="52" height="41" rx="3" class="op-55"/>
          <circle cx="24" cy="22" r="4" fill="currentColor" class="op-30" stroke="none"/>
          <rect x="31" y="19.5" width="22" height="2.2" rx="0.6" fill="currentColor" class="op-80" stroke="none"/>
          <rect x="20" y="31" width="38" height="1.8" rx="0.5" fill="currentColor" class="op-45" stroke="none"/>
          <rect x="20" y="42" width="16" height="5.5" rx="1.2" fill="currentColor" class="op-85" stroke="none"/>
        `);
      case "modals":
        return frame(`
          <rect x="1" y="7" width="78" height="52" fill="currentColor" class="op-06" stroke="none"/>
          <rect x="16" y="15" width="48" height="35" rx="3" fill="var(--bg)" stroke="currentColor" class="op-80"/>
          <rect x="22" y="21" width="22" height="2.4" rx="0.6" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="22" y="26.5" width="34" height="1.8" rx="0.5" fill="currentColor" class="op-45" stroke="none"/>
          <rect x="44" y="40" width="14" height="5.5" rx="1.2" fill="currentColor" class="op-90" stroke="none"/>
        `);
      case "charts":
        return frame(`
          <circle cx="26" cy="33" r="13" stroke-width="3" class="op-20"/>
          <circle cx="26" cy="33" r="13" stroke-width="3" stroke-dasharray="50 90" transform="rotate(-90 26 33)" class="op-85"/>
          <text x="26" y="35" text-anchor="middle" font-size="6.5" font-weight="600" fill="currentColor" stroke="none">62%</text>
          <rect x="48" y="34" width="5" height="14" rx="1" fill="currentColor" class="op-45" stroke="none"/>
          <rect x="56" y="25" width="5" height="23" rx="1" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="64" y="19" width="5" height="29" rx="1" fill="currentColor" class="op-90" stroke="none"/>
        `);
      case "timelines":
        return frame(`
          <line x1="20" y1="12" x2="20" y2="53" class="op-35"/>
          <circle cx="20" cy="18" r="2.8" fill="currentColor" class="op-90"/>
          <rect x="28" y="16.5" width="34" height="2.4" rx="0.6" fill="currentColor" class="op-80" stroke="none"/>
          <circle cx="20" cy="33" r="2.8" fill="var(--bg)" stroke="currentColor" stroke-width="1.4" class="op-75"/>
          <rect x="28" y="31.5" width="40" height="2.4" rx="0.6" fill="currentColor" class="op-55" stroke="none"/>
          <circle cx="20" cy="47" r="2.4" fill="currentColor" class="op-45"/>
          <rect x="28" y="45.5" width="26" height="2.4" rx="0.6" fill="currentColor" class="op-40" stroke="none"/>
        `);
      case "calendars":
        return `<div class="cat-mini-cal" aria-hidden="true">
          <div class="cat-mini-cal-head"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
          <div class="cat-mini-cal-grid">
            ${Array.from({ length: 35 }, (_, i) => `<span class="${i === 13 ? "is-today" : ""}">${i + 1}</span>`).join("")}
          </div>
        </div>`;
      case "profile":
        return frame(`
          <circle cx="24" cy="28" r="9" class="op-75"/>
          <circle cx="24" cy="25.5" r="3" fill="currentColor" class="op-75" stroke="none"/>
          <path d="M18 34c1.5-3 10.5-3 12 0" class="op-75"/>
          <rect x="39" y="22" width="26" height="3" rx="0.8" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="39" y="28" width="18" height="2" rx="0.6" fill="currentColor" class="op-45" stroke="none"/>
          <rect x="14" y="43" width="52" height="8" rx="2" class="op-35"/>
        `);
      case "toasts":
        return frame(`
          <rect x="18" y="15" width="44" height="12" rx="2.5" class="op-25"/>
          <rect x="13" y="22" width="54" height="14" rx="3" fill="var(--bg)" class="op-45"/>
          <rect x="9" y="30" width="62" height="18" rx="3.5" fill="var(--bg)" stroke="currentColor" class="op-85"/>
          <circle cx="17" cy="39" r="3" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="24" y="36.5" width="28" height="2.4" rx="0.6" fill="currentColor" class="op-85" stroke="none"/>
        `);
      case "pricing":
        return frame(`
          <rect x="6" y="16" width="20" height="36" rx="2" class="op-35"/>
          <rect x="30" y="11" width="20" height="43" rx="2.5" stroke-width="1.4" class="op-90"/>
          <rect x="34" y="17" width="12" height="3.5" rx="0.8" fill="currentColor" class="op-90" stroke="none"/>
          <rect x="34" y="43" width="12" height="5" rx="1" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="54" y="16" width="20" height="36" rx="2" class="op-35"/>
        `);
      case "tours":
        return frame(`
          <circle cx="22" cy="32" r="3.5" fill="currentColor" class="op-90" stroke="none"/>
          <circle cx="22" cy="32" r="8" class="op-45" stroke-dasharray="2 2"/>
          <rect x="38" y="17" width="32" height="28" rx="3" class="op-80"/>
          <rect x="43" y="23" width="20" height="2.5" rx="0.6" fill="currentColor" class="op-80" stroke="none"/>
          <rect x="54" y="36" width="11" height="4.5" rx="1" fill="currentColor" class="op-85" stroke="none"/>
        `);
      case "threads":
        return frame(`
          <circle cx="14" cy="18" r="3.5" fill="currentColor" class="op-75" stroke="none"/>
          <path d="M14 23v16a4 4 0 0 0 4 4h6" class="op-45"/>
          <rect x="21" y="13" width="46" height="13" rx="2.5" class="op-55"/>
          <rect x="26" y="18" width="30" height="2.4" rx="0.6" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="34" y="34" width="34" height="13" rx="2.5" class="op-80"/>
          <rect x="39" y="39" width="22" height="2.4" rx="0.6" fill="currentColor" class="op-80" stroke="none"/>
        `);
      case "ai-agents":
        return frame(`
          <circle cx="18" cy="22" r="4.5" stroke="currentColor" stroke-width="1.3" class="op-85"/>
          <circle cx="18" cy="22" r="1.8" fill="currentColor" class="op-90" stroke="none"/>
          <path d="M23 22 H36 M36 22 L44 15 M36 22 L44 29" class="op-55"/>
          <rect x="44" y="11" width="28" height="9" rx="2" class="op-75"/>
          <rect x="44" y="25" width="28" height="9" rx="2" class="op-75"/>
          <rect x="12" y="42" width="56" height="10" rx="3" class="op-45"/>
          <rect x="16" y="45.5" width="34" height="2.5" rx="0.8" fill="currentColor" class="op-80" stroke="none"/>
        `);
      case "shaders-canvas":
        return frame(`
          <circle cx="40" cy="33" r="16" stroke-dasharray="2 2" class="op-45"/>
          <circle cx="40" cy="33" r="9" class="op-85"/>
          <path d="M12 46 Q 28 18, 40 33 T 68 20" stroke-width="1.4" class="op-90"/>
          <circle cx="24" cy="24" r="1.5" fill="currentColor" class="op-60" stroke="none"/>
          <circle cx="56" cy="42" r="1.5" fill="currentColor" class="op-60" stroke="none"/>
        `);
      case "devtools":
        return frame(`
          <rect x="8" y="13" width="24" height="5" rx="1" fill="currentColor" class="op-75" stroke="none"/>
          <rect x="22" y="22" width="32" height="5" rx="1" fill="currentColor" class="op-55" stroke="none"/>
          <rect x="36" y="31" width="28" height="5" rx="1" fill="currentColor" class="op-85" stroke="none"/>
          <rect x="14" y="40" width="46" height="5" rx="1" fill="currentColor" class="op-40" stroke="none"/>
          <line x1="22" y1="10" x2="22" y2="54" stroke-dasharray="1.5 1.5" class="op-30"/>
          <line x1="50" y1="10" x2="50" y2="54" stroke-dasharray="1.5 1.5" class="op-30"/>
        `);
      case "command-menus":
        return frame(`
          <circle cx="40" cy="33" r="17" class="op-40"/>
          <circle cx="40" cy="33" r="6" class="op-85"/>
          <line x1="40" y1="16" x2="40" y2="27" class="op-45"/>
          <line x1="40" y1="39" x2="40" y2="50" class="op-45"/>
          <line x1="23" y1="33" x2="34" y2="33" class="op-45"/>
          <line x1="46" y1="33" x2="57" y2="33" class="op-45"/>
        `);
      case "media-audio":
        return frame(`
          <path d="M14 48 C 28 48, 26 16, 66 16" stroke-width="1.6" class="op-90"/>
          <line x1="14" y1="48" x2="28" y2="48" class="op-45"/>
          <line x1="66" y1="16" x2="26" y2="16" class="op-45"/>
          <circle cx="28" cy="48" r="2.8" fill="currentColor" stroke="none"/>
          <circle cx="26" cy="16" r="2.8" fill="currentColor" stroke="none"/>
        `);
      case "crypto-fintech":
        return frame(`
          <path d="M8 50 L22 38 L34 38 L38 48 L38 52 L8 52 Z" fill="currentColor" class="op-25" stroke="none"/>
          <polyline points="8,50 22,38 34,38 38,48" stroke-width="1.3" class="op-85"/>
          <path d="M72 22 L56 34 L44 34 L42 48 L72 52 Z" fill="currentColor" class="op-15" stroke="none"/>
          <polyline points="42,48 44,34 56,34 72,22" stroke-width="1.3" class="op-65"/>
        `);
      default:
        return "";
    }
  }

  // --------------------------------------------------------------------------
  // 2. 212 vistas previas en miniatura de tarjetas por slug (micro-interfaces SVG de 320x200)
  // --------------------------------------------------------------------------
  function generatePreviewSVG(catId, item, idx) {
    const slug = item.slug;
    const h = hashSlug(catId + ":" + slug);
    const accents = [
      "var(--accent-indigo)",
      "var(--accent-emerald)",
      "var(--accent-amber)",
      "var(--accent-sky)",
      "#ec4899",
      "#a855f7"
    ];
    const acc = item.categoryAccent || accents[h % accents.length];

    const windowChrome = (inner, opts = {}) => {
      return `<svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="card-preview-svg" data-slug="${slug}">
        <rect x="0" y="0" width="320" height="200" fill="var(--surface-preview)"/>
        <pattern id="dots-${catId}-${slug}" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.65" fill="currentColor" class="op-10"/>
        </pattern>
        <rect x="0" y="0" width="320" height="200" fill="url(#dots-${catId}-${slug})"/>
        <g class="chrome-bar">
          <line x1="0" y1="20" x2="320" y2="20" stroke="currentColor" class="op-12"/>
          <circle cx="11" cy="10" r="2.2" fill="currentColor" class="op-25"/>
          <circle cx="19" cy="10" r="2.2" fill="currentColor" class="op-20"/>
          <circle cx="27" cy="10" r="2.2" fill="currentColor" class="op-15"/>
          <rect x="96" y="5.5" width="128" height="9" rx="4.5" fill="currentColor" class="op-06"/>
          <text x="160" y="12" text-anchor="middle" font-size="5.5" font-family="ui-monospace, monospace" fill="currentColor" class="op-45">${catId}/${slug}</text>
          <circle cx="305" cy="10" r="2.8" fill="${acc}" class="op-85"/>
        </g>
        ${inner}
      </svg>`;
    };

    // ========================================================================
    // NUEVA CATEGORÍA A: IA Y AGENTES (10 composiciones a medida)
    // ========================================================================
    if (catId === "ai-agents") {
      if (slug === "agent-handoff-graph") {
        return windowChrome(`
          <rect x="28" y="76" width="64" height="36" rx="6" fill="${acc}" class="op-22" stroke="${acc}" stroke-width="1.5"/>
          <text x="60" y="97" text-anchor="middle" font-size="7" fill="currentColor" class="op-90">ORQUESTADOR</text>
          <path d="M92 94 C118 94, 118 54, 144 54 M92 94 C118 94, 118 94, 144 94 M92 94 C118 94, 118 134, 144 134" stroke="${acc}" stroke-width="1.5" stroke-dasharray="3 3" class="anim-draw"/>
          ${[38, 78, 118].map((y, i) => `
            <rect x="144" y="${y}" width="72" height="32" rx="5" fill="var(--bg)" stroke="currentColor" class="op-45 anim-slide-x"/>
            <circle cx="156" cy="${y + 16}" r="3.5" fill="${accents[(i + 1) % accents.length]}"/>
            <rect x="166" y="${y + 14}" width="38" height="4" rx="1.5" fill="currentColor" class="op-80"/>
          `).join("")}
          <rect x="236" y="76" width="56" height="36" rx="6" stroke="var(--accent-emerald)" stroke-width="1.5" class="op-85 anim-pulse"/>
        `);
      }
      if (slug === "token-budget-meter" || slug === "context-window-stack") {
        return windowChrome(`
          <rect x="24" y="34" width="272" height="148" rx="7" fill="var(--bg)" stroke="currentColor" class="op-28"/>
          <text x="38" y="54" font-size="7.5" font-weight="600" fill="currentColor" class="op-85">VENTANA DE CONTEXTO · 94.2k / 128k TOKENS</text>
          <rect x="38" y="64" width="244" height="14" rx="4" fill="currentColor" class="op-10"/>
          <rect x="38" y="64" width="96" height="14" rx="4" fill="${acc}" class="op-90"/>
          <rect x="136" y="64" width="64" height="14" fill="var(--accent-sky)" class="op-85"/>
          <rect x="202" y="64" width="38" height="14" fill="var(--accent-amber)" class="op-85"/>
          ${[96, 122, 148].map((y, i) => `
            <rect x="38" y="${y}" width="244" height="20" rx="4" fill="currentColor" class="op-05" stroke="currentColor" stroke-opacity="0.18"/>
            <circle cx="50" cy="${y + 10}" r="3.5" fill="${i === 0 ? acc : i === 1 ? "var(--accent-sky)" : "var(--accent-amber)"}"/>
            <rect x="60" y="${y + 8}" width="${90 + i * 24}" height="4" rx="1.5" fill="currentColor" class="op-75"/>
            <text x="268" y="${y + 12.5}" text-anchor="end" font-size="6.5" fill="currentColor" class="op-55">${38 - i * 11}k tok</text>
          `).join("")}
        `);
      }
      if (slug === "voice-waveform-hud") {
        return windowChrome(`
          <circle cx="160" cy="96" r="36" fill="${acc}" class="op-15 anim-pulse"/>
          <circle cx="160" cy="96" r="22" stroke="${acc}" stroke-width="1.8" class="op-90"/>
          ${Array.from({ length: 28 }, (_, i) => {
            const bh = 8 + Math.abs(Math.sin(i * 0.55)) * 36;
            return `<rect x="${48 + i * 8}" y="${160 - bh / 2}" width="4" height="${bh}" rx="2" fill="${i > 9 && i < 19 ? acc : "currentColor"}" class="${i > 9 && i < 19 ? "op-90 anim-bar" : "op-30"}"/>`;
          }).join("")}
        `);
      }
      if (slug === "diff-apply-review") {
        return windowChrome(`
          <rect x="20" y="32" width="280" height="150" rx="6" fill="var(--bg)" stroke="currentColor" class="op-30"/>
          <rect x="20" y="68" width="280" height="22" fill="#f43f5e" class="op-15"/>
          <text x="30" y="82" font-size="8" fill="#f43f5e">- const timeout = 12000;</text>
          <rect x="20" y="90" width="280" height="22" fill="var(--accent-emerald)" class="op-18"/>
          <text x="30" y="104" font-size="8" fill="var(--accent-emerald)">+ const timeout = config.adaptiveTimeout ?? 30000;</text>
          <rect x="176" y="152" width="52" height="18" rx="4" stroke="currentColor" class="op-35"/>
          <rect x="234" y="152" width="54" height="18" rx="4" fill="var(--accent-emerald)" class="op-90"/>
        `);
      }
      return windowChrome(`
        <rect x="24" y="30" width="272" height="96" rx="6" stroke="currentColor" class="op-22" fill="currentColor" fill-opacity="0.02"/>
        <circle cx="40" cy="46" r="5" fill="${acc}"/>
        <rect x="52" y="43" width="96" height="5" rx="1.8" fill="currentColor" class="op-85"/>
        <rect x="38" y="60" width="244" height="28" rx="4" fill="currentColor" class="op-06" stroke="${acc}" stroke-opacity="0.4"/>
        <text x="48" y="77" font-size="7" fill="${acc}">⚡ tool_call: execute({ query: "ast_nodes" }) · 42ms</text>
        <rect x="38" y="98" width="188" height="4" rx="1.5" fill="currentColor" class="op-65"/>
        <rect x="24" y="136" width="272" height="48" rx="7" fill="var(--bg)" stroke="currentColor" class="op-40 anim-float"/>
        <rect x="36" y="148" width="144" height="4.5" rx="1.5" fill="currentColor" class="op-55"/>
        <rect x="236" y="160" width="48" height="16" rx="4" fill="${acc}" class="op-90"/>
      `);
    }

    // ========================================================================
    // NUEVA CATEGORÍA B: SHADERS Y CANVAS (10 composiciones a medida)
    // ========================================================================
    if (catId === "shaders-canvas") {
      if (slug === "magnetic-cursor-grid" || slug === "ascii-matrix-field") {
        let vectors = "";
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 11; c++) {
            const x = 34 + c * 25;
            const y = 44 + r * 24;
            const dx = 160 - x;
            const dy = 105 - y;
            const ang = Math.atan2(dy, dx);
            const x2 = (x + Math.cos(ang) * 9).toFixed(1);
            const y2 = (y + Math.sin(ang) * 9).toFixed(1);
            vectors += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${Math.hypot(dx, dy) < 68 ? acc : "currentColor"}" stroke-width="1.5" class="${Math.hypot(dx, dy) < 68 ? "op-95" : "op-30"}"/>`;
          }
        }
        return windowChrome(`${vectors}<circle cx="160" cy="105" r="24" stroke="${acc}" stroke-dasharray="3 3" class="op-80 anim-pulse"/>`);
      }
      if (slug === "raymarched-sdf-orb" || slug === "dither-halftone-shader") {
        return windowChrome(`
          <circle cx="160" cy="110" r="54" fill="${acc}" class="op-15 anim-pulse"/>
          <circle cx="160" cy="110" r="38" stroke="${acc}" stroke-width="2" class="op-85"/>
          <ellipse cx="160" cy="110" rx="38" ry="14" stroke="currentColor" stroke-dasharray="3 3" class="op-45"/>
          <ellipse cx="160" cy="110" rx="14" ry="38" stroke="currentColor" stroke-dasharray="3 3" class="op-45"/>
          <circle cx="146" cy="96" r="6" fill="currentColor" class="op-90"/>
        `);
      }
      return windowChrome(`
        ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M 20 ${55 + i * 22} Q 95 ${25 + i * 26}, 160 ${65 + i * 18} T 300 ${45 + i * 24}" fill="none" stroke="${i % 2 === 0 ? acc : "currentColor"}" stroke-width="${i === 2 ? "2.2" : "1.2"}" class="${i % 2 === 0 ? "op-85 anim-draw" : "op-25"}"/>`).join("")}
        <circle cx="160" cy="102" r="7" fill="${acc}" class="anim-pulse"/>
      `);
    }

    // ========================================================================
    // NUEVA CATEGORÍA C: HERRAMIENTAS DE DESARROLLO Y LOGS (9 composiciones a medida)
    // ========================================================================
    if (catId === "devtools") {
      if (slug === "network-waterfall" || slug === "flamegraph-profiler") {
        const spans = [
          { x: 96, w: 42, c: "var(--accent-sky)", label: "GET /api/session · 200" },
          { x: 128, w: 76, c: acc, label: "POST /v2/compile · 200" },
          { x: 164, w: 64, c: "var(--accent-emerald)", label: "WSS /realtime · 101" },
          { x: 196, w: 88, c: "var(--accent-amber)", label: "GET /chunks/shader.wasm" },
          { x: 112, w: 142, c: "#ec4899", label: " Worker.evaluate() · 48ms" }
        ];
        return windowChrome(`
          <rect x="14" y="28" width="292" height="158" rx="5" stroke="currentColor" class="op-24"/>
          <line x1="90" y1="28" x2="90" y2="186" stroke="currentColor" class="op-20"/>
          ${spans.map((s, i) => `
            <text x="22" y="${52 + i * 27}" font-size="6" fill="currentColor" class="op-70">${s.label.slice(0, 14)}</text>
            <rect x="${s.x}" y="${43 + i * 27}" width="${s.w}" height="13" rx="3" fill="${s.c}" class="op-85 anim-slide-x"/>
          `).join("")}
        `);
      }
      return windowChrome(`
        <rect x="14" y="28" width="292" height="158" rx="5" fill="currentColor" class="op-04" stroke="currentColor" stroke-opacity="0.24"/>
        <text x="26" y="48" font-size="7.5" fill="${acc}">▼ { "workspace": "biblioteca", "nodes": 212,</text>
        <text x="38" y="66" font-size="7.5" fill="currentColor" class="op-80">  "shaderEngine": "webgl-fragment-fp16",</text>
        <text x="38" y="84" font-size="7.5" fill="var(--accent-emerald)">  "externalDependencies": 0,</text>
        <text x="38" y="102" font-size="7.5" fill="var(--accent-amber)">  "latencyMs": [1.2, 0.8, 1.4, 0.9],</text>
        <text x="26" y="120" font-size="7.5" fill="${acc}">}</text>
        <rect x="26" y="138" width="268" height="34" rx="4" stroke="currentColor" class="op-25"/>
        <rect x="34" y="151" width="144" height="6" rx="2" fill="${acc}" class="op-85"/>
      `);
    }

    // ========================================================================
    // NUEVA CATEGORÍA D: COMANDOS Y MENÚS (9 composiciones a medida)
    // ========================================================================
    if (catId === "command-menus") {
      if (slug === "radial-pie-menu") {
        return windowChrome(`
          <g class="anim-float">
            <circle cx="160" cy="108" r="58" fill="var(--bg)" stroke="currentColor" stroke-width="1.5" class="op-80"/>
            <circle cx="160" cy="108" r="20" fill="${acc}" class="op-90"/>
            <line x1="160" y1="50" x2="160" y2="88" stroke="currentColor" class="op-30"/>
            <line x1="160" y1="128" x2="160" y2="166" stroke="currentColor" class="op-30"/>
            <line x1="102" y1="108" x2="140" y2="108" stroke="currentColor" class="op-30"/>
            <line x1="180" y1="108" x2="218" y2="108" stroke="currentColor" class="op-30"/>
            <circle cx="188" cy="80" r="6" fill="${acc}" class="anim-pulse"/>
          </g>
        `);
      }
      return windowChrome(`
        <rect x="52" y="34" width="216" height="146" rx="8" fill="var(--bg)" stroke="currentColor" class="op-55 anim-float"/>
        <rect x="64" y="46" width="192" height="22" rx="4" fill="currentColor" class="op-08"/>
        <text x="74" y="60" font-size="8" fill="${acc}">/deploy production --canary</text>
        ${[80, 106, 132, 154].map((y, i) => `
          <rect x="64" y="${y - 4}" width="192" height="20" rx="4" fill="${i === 0 ? acc : "none"}" fill-opacity="${i === 0 ? "0.2" : "0"}"/>
          <rect x="74" y="${y + 4}" width="${84 + (i % 2) * 28}" height="4" rx="1.5" fill="currentColor" class="${i === 0 ? "op-95" : "op-60"}"/>
          <rect x="224" y="${y + 1}" width="22" height="10" rx="2.5" stroke="currentColor" class="op-35"/>
        `).join("")}
      `);
    }

    // ========================================================================
    // NUEVA CATEGORÍA E: MEDIOS Y HERRAMIENTAS CREATIVAS (8 composiciones a medida)
    // ========================================================================
    if (catId === "media-audio") {
      if (slug === "bezier-easing-editor") {
        return windowChrome(`
          <rect x="44" y="34" width="136" height="136" rx="6" stroke="currentColor" class="op-30"/>
          <line x1="44" y1="170" x2="108" y2="48" stroke="${acc}" stroke-width="1.4" stroke-dasharray="3 3"/>
          <line x1="180" y1="34" x2="116" y2="152" stroke="var(--accent-sky)" stroke-width="1.4" stroke-dasharray="3 3"/>
          <path d="M 44 170 C 108 48, 116 152, 180 34" fill="none" stroke="currentColor" stroke-width="2.5" class="anim-draw"/>
          <circle cx="108" cy="48" r="5.5" fill="${acc}" class="anim-pulse"/>
          <circle cx="116" cy="152" r="5.5" fill="var(--accent-sky)" class="anim-pulse"/>
          <rect x="196" y="48" width="84" height="24" rx="5" fill="currentColor" class="op-08"/>
          <text x="238" y="63" text-anchor="middle" font-size="6.5" fill="currentColor" class="op-85">(0.22, 1, 0.36, 1)</text>
        `);
      }
      return windowChrome(`
        <rect x="24" y="34" width="272" height="146" rx="7" fill="var(--bg)" stroke="currentColor" class="op-30"/>
        ${[0, 1, 2, 3].map((r) =>
          Array.from({ length: 8 }, (_, c) => {
            const on = (r + c) % 3 === 0 || (r === 1 && c === 4);
            return `<rect x="${40 + c * 30}" y="${50 + r * 28}" width="24" height="20" rx="3.5" fill="${on ? acc : "currentColor"}" class="${on ? "op-90 anim-pulse" : "op-10"}"/>`;
          }).join("")
        ).join("")}
      `);
    }

    // ========================================================================
    // NUEVA CATEGORÍA F: FINTECH Y TESORERÍA (8 composiciones a medida)
    // ========================================================================
    if (catId === "crypto-fintech") {
      if (slug === "orderbook-depth-wall") {
        return windowChrome(`
          <rect x="20" y="32" width="280" height="150" rx="6" stroke="currentColor" class="op-22"/>
          <path d="M 28 172 L 28 74 L 68 74 L 68 102 L 114 102 L 114 136 L 154 136 L 154 172 Z" fill="var(--accent-emerald)" class="op-25"/>
          <polyline points="28,74 68,74 68,102 114,102 114,136 154,136 154,172" fill="none" stroke="var(--accent-emerald)" stroke-width="2"/>
          <path d="M 166 172 L 166 132 L 204 132 L 204 96 L 248 96 L 248 64 L 292 64 L 292 172 Z" fill="#f43f5e" class="op-25"/>
          <polyline points="166,172 166,132 204,132 204,96 248,96 248,64 292,64" fill="none" stroke="#f43f5e" stroke-width="2"/>
        `);
      }
      return windowChrome(`
        <g class="anim-float">
          <rect x="52" y="36" width="216" height="138" rx="10" fill="var(--bg)" stroke="${acc}" stroke-width="1.6"/>
          <text x="72" y="60" font-size="8" font-weight="700" fill="${acc}">BÓVEDA DE TESORERÍA · MULTIFIRMA 3/5</text>
          <text x="72" y="92" font-size="18" font-weight="700" fill="currentColor">$2,840,910.00</text>
          <rect x="72" y="114" width="176" height="8" rx="4" fill="currentColor" class="op-12"/>
          <rect x="72" y="114" width="132" height="8" rx="4" fill="var(--accent-emerald)" class="op-90"/>
          <rect x="72" y="138" width="82" height="20" rx="4.5" fill="currentColor" class="op-90"/>
          <rect x="162" y="138" width="86" height="20" rx="4.5" stroke="currentColor" class="op-35"/>
        </g>
      `);
    }

    // ========================================================================
    // 1. LAYOUTS (12 composiciones distintas)
    // ========================================================================
    if (catId === "layouts") {
      switch (slug) {
        case "workspace-rail":
          return windowChrome(`
            <rect x="0" y="20" width="76" height="180" fill="currentColor" class="op-04"/>
            <line x1="76" y1="20" x2="76" y2="200" stroke="currentColor" class="op-16"/>
            <circle cx="15" cy="34" r="5" fill="${acc}" class="op-90"/>
            <rect x="24" y="31" width="38" height="4" rx="1.5" fill="currentColor" class="op-85"/>
            <rect x="8" y="46" width="60" height="12" rx="3" stroke="currentColor" class="op-20"/>
            ${[66, 80, 94, 108, 122].map((y, i) => `
              <g class="${i === 1 ? "anim-slide-x" : ""}">
                ${i === 1 ? `<rect x="6" y="${y - 3}" width="64" height="12" rx="3" fill="currentColor" class="op-10"/>` : ""}
                <rect x="11" y="${y}" width="6" height="6" rx="1.5" fill="${i === 1 ? acc : "currentColor"}" class="${i === 1 ? "op-95" : "op-40"}"/>
                <rect x="21" y="${y + 1.5}" width="${32 + (i % 3) * 6}" height="3" rx="1" fill="currentColor" class="${i === 1 ? "op-90" : "op-50"}"/>
              </g>`).join("")}
            <rect x="94" y="34" width="78" height="6" rx="2" fill="currentColor" class="op-80"/>
            <rect x="94" y="56" width="208" height="58" rx="5" stroke="currentColor" class="op-18" fill="currentColor" fill-opacity="0.02"/>
            <rect x="94" y="124" width="99" height="58" rx="5" stroke="currentColor" class="op-18"/>
            <rect x="203" y="124" width="99" height="58" rx="5" stroke="currentColor" class="op-18"/>
          `);
        case "mini-rail":
          return windowChrome(`
            <rect x="0" y="20" width="32" height="180" fill="currentColor" class="op-05"/>
            <line x1="32" y1="20" x2="32" y2="200" stroke="currentColor" class="op-16"/>
            ${[34, 54, 74, 94, 114, 174].map((y, i) => `<rect x="9" y="${y}" width="14" height="14" rx="4" fill="${i === 1 ? acc : "currentColor"}" class="${i === 1 ? "op-90 anim-pulse" : "op-25"}"/>`).join("")}
            <g class="anim-slide-x"><rect x="38" y="54" width="54" height="14" rx="3" fill="currentColor" class="op-90"/><rect x="44" y="59.5" width="40" height="3" rx="1" fill="var(--bg)"/></g>
            <rect x="52" y="36" width="250" height="148" rx="6" stroke="currentColor" class="op-18"/>
            <rect x="68" y="52" width="90" height="5" rx="2" fill="currentColor" class="op-75"/>
            <rect x="68" y="68" width="218" height="98" rx="4" fill="currentColor" class="op-04"/>
          `);
        case "docs-tree":
          return windowChrome(`
            <line x1="86" y1="20" x2="86" y2="200" stroke="currentColor" class="op-15"/>
            <line x1="252" y1="20" x2="252" y2="200" stroke="currentColor" class="op-12"/>
            <line x1="16" y1="42" x2="16" y2="155" stroke="currentColor" class="op-22"/>
            ${[46, 60, 74, 88, 102, 116, 130].map((y, i) => `<rect x="${i % 2 === 0 ? 22 : 28}" y="${y}" width="${44 - (i % 3) * 7}" height="3" rx="1" fill="${i === 2 ? acc : "currentColor"}" class="${i === 2 ? "op-95" : "op-45"}"/>`).join("")}
            <rect x="102" y="34" width="96" height="7" rx="2" fill="currentColor" class="op-85"/>
            <rect x="102" y="50" width="132" height="3.5" rx="1" fill="currentColor" class="op-40"/>
            <rect x="102" y="68" width="134" height="48" rx="4" fill="currentColor" class="op-06" stroke="currentColor" stroke-opacity="0.18"/>
            <rect x="110" y="78" width="68" height="3" rx="1" fill="${acc}" class="op-85"/>
            <rect x="262" y="36" width="38" height="3" rx="1" fill="currentColor" class="op-65"/>
            <rect x="262" y="48" width="42" height="2.5" rx="1" fill="${acc}" class="op-85"/>
          `);
        case "inbox-rail":
          return windowChrome(`
            <rect x="0" y="20" width="52" height="180" fill="currentColor" class="op-04"/>
            <line x1="52" y1="20" x2="52" y2="200" stroke="currentColor" class="op-15"/>
            <line x1="154" y1="20" x2="154" y2="200" stroke="currentColor" class="op-15"/>
            ${[32, 60, 88, 116, 144].map((y, i) => `
              <rect x="60" y="${y}" width="86" height="22" rx="3.5" fill="currentColor" class="${i === 0 ? "op-12" : "op-04"}"/>
              <circle cx="67" cy="${y + 8}" r="2.2" fill="${acc}" class="${i < 2 ? "op-90" : "op-0"}"/>
              <rect x="73" y="${y + 6}" width="50" height="3" rx="1" fill="currentColor" class="op-80"/>
              <rect x="73" y="${y + 13}" width="64" height="2.5" rx="1" fill="currentColor" class="op-35"/>`).join("")}
            <rect x="170" y="34" width="134" height="6" rx="2" fill="currentColor" class="op-85"/>
            <rect x="170" y="50" width="134" height="132" rx="5" fill="currentColor" class="op-04" stroke="currentColor" stroke-opacity="0.15"/>
          `);
        case "app-shell":
          return windowChrome(`
            <line x1="0" y1="42" x2="320" y2="42" stroke="currentColor" class="op-16"/>
            <rect x="14" y="28" width="54" height="4" rx="1.5" fill="currentColor" class="op-80"/>
            <rect x="82" y="28" width="32" height="4" rx="1.5" fill="${acc}" class="op-90"/>
            <rect x="124" y="28" width="32" height="4" rx="1.5" fill="currentColor" class="op-40"/>
            <rect x="20" y="56" width="280" height="36" rx="5" fill="currentColor" class="op-05" stroke="currentColor" stroke-opacity="0.18"/>
            <rect x="20" y="102" width="134" height="80" rx="5" stroke="currentColor" class="op-18"/>
            <rect x="166" y="102" width="134" height="80" rx="5" stroke="currentColor" class="op-18"/>
          `);
        case "two-pane":
          return windowChrome(`
            <rect x="12" y="28" width="112" height="160" rx="5" stroke="currentColor" class="op-20" fill="currentColor" fill-opacity="0.03"/>
            <rect x="132" y="28" width="176" height="160" rx="5" stroke="currentColor" class="op-20"/>
            <rect x="22" y="40" width="92" height="20" rx="3" fill="${acc}" class="op-20"/>
            <rect x="22" y="66" width="92" height="20" rx="3" fill="currentColor" class="op-06"/>
            <rect x="148" y="44" width="96" height="6" rx="2" fill="currentColor" class="op-85"/>
            <rect x="148" y="62" width="144" height="110" rx="4" fill="currentColor" class="op-04"/>
          `);
        case "three-pane":
          return windowChrome(`
            <rect x="10" y="28" width="68" height="160" rx="4.5" stroke="currentColor" class="op-20"/>
            <rect x="84" y="28" width="118" height="160" rx="4.5" stroke="currentColor" class="op-25"/>
            <rect x="208" y="28" width="102" height="160" rx="4.5" stroke="currentColor" class="op-20" fill="currentColor" fill-opacity="0.03"/>
            <rect x="96" y="42" width="94" height="6" rx="2" fill="${acc}" class="op-85"/>
            <rect x="96" y="58" width="94" height="114" rx="4" fill="currentColor" class="op-05"/>
          `);
        case "split-resizable":
          return windowChrome(`
            <rect x="12" y="28" width="296" height="160" rx="6" stroke="currentColor" class="op-22"/>
            <line x1="154" y1="28" x2="154" y2="188" stroke="${acc}" stroke-width="2" class="op-85"/>
            <rect x="151" y="94" width="6" height="28" rx="3" fill="${acc}" class="anim-pulse"/>
            <line x1="154" y1="112" x2="308" y2="112" stroke="currentColor" stroke-width="1.5" class="op-25"/>
            <rect x="218" y="109" width="28" height="6" rx="3" fill="currentColor" class="op-45"/>
          `);
        case "focus-mode":
          return windowChrome(`
            <rect x="76" y="38" width="168" height="142" rx="6" fill="var(--bg)" stroke="currentColor" class="op-22 anim-float"/>
            <rect x="96" y="56" width="88" height="7" rx="2" fill="currentColor" class="op-85"/>
            ${[74, 86, 98, 110, 122, 134].map((y, i) => `<rect x="96" y="${y}" width="${128 - (i % 3) * 18}" height="3.5" rx="1.2" fill="currentColor" class="${i === 2 ? "op-80" : "op-30"}"/>`).join("")}
            <rect x="96" y="156" width="44" height="10" rx="5" fill="${acc}" class="op-25"/>
          `);
        case "floating-toolbar":
          return windowChrome(`
            <rect x="24" y="32" width="272" height="118" rx="6" stroke="currentColor" class="op-16"/>
            <g class="anim-float">
              <rect x="74" y="158" width="172" height="26" rx="13" fill="var(--bg)" stroke="currentColor" stroke-width="1.4" class="op-85"/>
              ${[88, 114, 140, 166, 192, 218].map((x, i) => `<rect x="${x}" y="165" width="16" height="12" rx="4" fill="${i === 2 ? acc : "currentColor"}" class="${i === 2 ? "op-95" : "op-35"}"/>`).join("")}
            </g>
          `);
        case "canvas-tools":
          return windowChrome(`
            <circle cx="96" cy="88" r="24" stroke="${acc}" stroke-width="1.8" class="op-85 anim-pulse"/>
            <rect x="174" y="64" width="76" height="52" rx="6" stroke="currentColor" stroke-width="1.4" class="op-65"/>
            <path d="M120 88 C146 88, 148 90, 174 90" stroke="${acc}" stroke-width="1.8" stroke-dasharray="3 3"/>
            <circle cx="120" cy="88" r="3.5" fill="${acc}"/>
            <circle cx="174" cy="90" r="3.5" fill="${acc}"/>
          `);
        default: // navegación inferior
          return windowChrome(`
            <rect x="98" y="26" width="124" height="166" rx="12" stroke="currentColor" stroke-width="1.5" class="op-45"/>
            <rect x="110" y="42" width="100" height="52" rx="5" fill="currentColor" class="op-06"/>
            <rect x="110" y="102" width="100" height="48" rx="5" fill="currentColor" class="op-04"/>
            <rect x="108" y="164" width="104" height="18" rx="9" fill="currentColor" class="op-12"/>
            ${[118, 142, 166, 190].map((x, i) => `<circle cx="${x}" cy="173" r="4" fill="${i === 0 ? acc : "currentColor"}" class="${i === 0 ? "op-95" : "op-40"}"/>`).join("")}
          `);
      }
    }

    // ========================================================================
    // 2. FORMULARIOS (4 composiciones distintas)
    // ========================================================================
    if (catId === "forms") {
      if (slug === "invite-teammates") {
        return windowChrome(`
          <rect x="34" y="30" width="252" height="156" rx="7" fill="var(--bg)" stroke="currentColor" class="op-28"/>
          <rect x="50" y="44" width="96" height="5" rx="2" fill="currentColor" class="op-85"/>
          ${[66, 92, 118].map((y, i) => `
            <rect x="50" y="${y}" width="150" height="18" rx="3.5" stroke="currentColor" class="op-28"/>
            <rect x="58" y="${y + 7}" width="${68 + i * 16}" height="3" rx="1" fill="currentColor" class="op-65"/>
            <rect x="206" y="${y}" width="64" height="18" rx="3.5" fill="${i === 0 ? acc : "currentColor"}" class="${i === 0 ? "op-22" : "op-08"}"/>
            <rect x="216" y="${y + 7}" width="38" height="3" rx="1" fill="currentColor" class="op-75"/>`).join("")}
          <rect x="212" y="156" width="58" height="18" rx="4" fill="${acc}" class="op-90 anim-pulse"/>
        `);
      }
      if (slug === "notifications") {
        return windowChrome(`
          <rect x="34" y="30" width="252" height="156" rx="7" fill="var(--bg)" stroke="currentColor" class="op-28"/>
          <rect x="50" y="44" width="112" height="5" rx="2" fill="currentColor" class="op-85"/>
          ${[70, 102, 134].map((y, i) => `
            <rect x="50" y="${y}" width="92" height="4" rx="1.5" fill="currentColor" class="op-80"/>
            <rect x="50" y="${y + 8}" width="128" height="2.8" rx="1" fill="currentColor" class="op-35"/>
            <rect x="238" y="${y}" width="30" height="15" rx="7.5" fill="${i !== 1 ? acc : "currentColor"}" class="${i !== 1 ? "op-90" : "op-20"}"/>
            <circle cx="${i !== 1 ? 260 : 246}" cy="${y + 7.5}" r="5.2" fill="var(--bg)"/>`).join("")}
        `);
      }
      if (slug === "api-key") {
        return windowChrome(`
          <rect x="34" y="30" width="252" height="156" rx="7" fill="var(--bg)" stroke="currentColor" class="op-28"/>
          <rect x="50" y="44" width="84" height="5" rx="2" fill="currentColor" class="op-85"/>
          <rect x="50" y="62" width="220" height="22" rx="4" fill="currentColor" class="op-06" stroke="${acc}" stroke-width="1.3"/>
          <rect x="60" y="71" width="142" height="4" rx="1.5" fill="${acc}" class="op-90"/>
          ${[0, 1, 2].map((i) => `<rect x="${50 + i * 74}" y="98" width="68" height="22" rx="4" stroke="currentColor" class="${i === 0 ? "op-75" : "op-25"}"/>`).join("")}
          <rect x="196" y="152" width="74" height="18" rx="4" fill="currentColor" class="op-90"/>
        `);
      }
      return windowChrome(`
        <rect x="34" y="30" width="252" height="156" rx="7" fill="var(--bg)" stroke="currentColor" class="op-28"/>
        <circle cx="64" cy="56" r="14" fill="${acc}" class="op-25"/>
        <rect x="88" y="48" width="84" height="5" rx="2" fill="currentColor" class="op-85"/>
        <rect x="88" y="58" width="52" height="12" rx="3" stroke="currentColor" class="op-30"/>
        <rect x="50" y="84" width="220" height="20" rx="4" stroke="currentColor" class="op-30"/>
        <rect x="50" y="114" width="220" height="20" rx="4" stroke="currentColor" class="op-30"/>
        <rect x="214" y="154" width="56" height="18" rx="4" fill="currentColor" class="op-90"/>
      `);
    }

    // ========================================================================
    // 3. AUTENTICACIÓN E INICIO (14 composiciones distintas)
    // ========================================================================
    if (catId === "auth") {
      if (slug === "otp-verify" || slug === "two-factor") {
        return windowChrome(`
          <rect x="62" y="32" width="196" height="148" rx="8" fill="var(--bg)" stroke="currentColor" class="op-30"/>
          <rect x="116" y="52" width="88" height="5.5" rx="2" fill="currentColor" class="op-85"/>
          ${[0, 1, 2, 3, 4, 5].map((i) => `
            <rect x="${84 + i * 26}" y="86" width="22" height="30" rx="4.5" stroke="${i === 3 ? acc : "currentColor"}" stroke-width="${i === 3 ? "1.8" : "1"}" class="${i === 3 ? "op-95 anim-pulse" : "op-35"}"/>
            ${i < 3 ? `<circle cx="${95 + i * 26}" cy="101" r="3.2" fill="currentColor" class="op-85"/>` : ""}
          `).join("")}
          <rect x="84" y="136" width="152" height="20" rx="4.5" fill="${acc}" class="op-90"/>
        `);
      }
      if (slug === "left-signin" || slug === "right-signin" || slug === "inset-login") {
        const left = slug !== "right-signin";
        return windowChrome(`
          <rect x="${left ? 164 : 12}" y="26" width="144" height="164" rx="6" fill="${acc}" class="op-12"/>
          <circle cx="${left ? 236 : 84}" cy="108" r="36" stroke="${acc}" stroke-width="1.5" class="op-65 anim-pulse"/>
          <rect x="${left ? 26 : 176}" y="46" width="76" height="6" rx="2" fill="currentColor" class="op-85"/>
          <rect x="${left ? 26 : 176}" y="66" width="118" height="18" rx="3.5" stroke="currentColor" class="op-30"/>
          <rect x="${left ? 26 : 176}" y="92" width="118" height="18" rx="3.5" stroke="currentColor" class="op-30"/>
          <rect x="${left ? 26 : 176}" y="120" width="118" height="20" rx="4" fill="currentColor" class="op-90"/>
        `);
      }
      if (slug === "onboarding") {
        return windowChrome(`
          <rect x="52" y="32" width="216" height="148" rx="8" fill="var(--bg)" stroke="currentColor" class="op-28"/>
          ${[0, 1, 2, 3].map((i) => `<rect x="${72 + i * 46}" y="48" width="40" height="4" rx="2" fill="${i < 2 ? acc : "currentColor"}" class="${i < 2 ? "op-90" : "op-20"}"/>`).join("")}
          <rect x="72" y="68" width="110" height="6" rx="2" fill="currentColor" class="op-85"/>
          <rect x="72" y="86" width="176" height="24" rx="4" stroke="${acc}" class="op-75"/>
          <rect x="72" y="118" width="176" height="24" rx="4" stroke="currentColor" class="op-25"/>
          <rect x="184" y="152" width="64" height="18" rx="4" fill="currentColor" class="op-90"/>
        `);
      }
      if (slug === "waitlist") {
        return windowChrome(`
          <circle cx="160" cy="56" r="14" fill="${acc}" class="op-20"/>
          <rect x="92" y="80" width="136" height="10" rx="3" fill="currentColor" class="op-90"/>
          <rect x="70" y="112" width="124" height="22" rx="4.5" stroke="currentColor" class="op-35"/>
          <rect x="200" y="112" width="52" height="22" rx="4.5" fill="${acc}" class="op-90 anim-pulse"/>
          ${[136, 148, 160, 172].map((x) => `<circle cx="${x}" cy="154" r="7" fill="var(--bg)" stroke="currentColor" class="op-65"/>`).join("")}
        `);
      }
      if (slug === "check-email" || slug === "magic-link-sent") {
        return windowChrome(`
          <rect x="68" y="36" width="184" height="140" rx="8" fill="var(--bg)" stroke="currentColor" class="op-28"/>
          <g class="anim-float">
            <rect x="136" y="54" width="48" height="34" rx="6" stroke="${acc}" stroke-width="1.6"/>
            <path d="M140 60 L160 74 L180 60" stroke="${acc}" stroke-width="1.6"/>
          </g>
          <rect x="108" y="102" width="104" height="5.5" rx="2" fill="currentColor" class="op-85"/>
          <rect x="96" y="116" width="128" height="3.5" rx="1" fill="currentColor" class="op-40"/>
          <rect x="112" y="138" width="96" height="20" rx="4" fill="currentColor" class="op-90"/>
        `);
      }
      return windowChrome(`
        <rect x="72" y="28" width="176" height="158" rx="8" fill="var(--bg)" stroke="currentColor" class="op-30"/>
        <circle cx="160" cy="46" r="8" fill="${acc}" class="op-90"/>
        <rect x="116" y="62" width="88" height="5" rx="2" fill="currentColor" class="op-85"/>
        <rect x="90" y="78" width="66" height="16" rx="3.5" stroke="currentColor" class="op-28"/>
        <rect x="164" y="78" width="66" height="16" rx="3.5" stroke="currentColor" class="op-28"/>
        <rect x="90" y="106" width="140" height="18" rx="3.5" stroke="currentColor" class="op-30"/>
        <rect x="90" y="130" width="140" height="18" rx="3.5" stroke="currentColor" class="op-30"/>
        <rect x="90" y="154" width="140" height="20" rx="4" fill="${acc}" class="op-90"/>
      `);
    }

    // ========================================================================
    // 4. PANELES (9 composiciones distintas)
    // ========================================================================
    if (catId === "dashboards") {
      if (slug === "usage") {
        return windowChrome(`
          ${[36, 84, 132].map((y, i) => `
            <rect x="24" y="${y}" width="272" height="40" rx="5" stroke="currentColor" class="op-22"/>
            <rect x="36" y="${y + 10}" width="84" height="4" rx="1.5" fill="currentColor" class="op-80"/>
            <rect x="36" y="${y + 22}" width="248" height="7" rx="3.5" fill="currentColor" class="op-12"/>
            <rect x="36" y="${y + 22}" width="${190 - i * 42}" height="7" rx="3.5" fill="${i === 0 ? acc : "var(--accent-emerald)"}" class="op-90 anim-bar"/>
          `).join("")}
        `);
      }
      if (slug === "services") {
        return windowChrome(`
          ${[38, 86, 134].map((y) => `
            <rect x="20" y="${y}" width="280" height="40" rx="5" stroke="currentColor" class="op-22"/>
            <circle cx="32" cy="${y + 12}" r="3.5" fill="var(--accent-emerald)"/>
            <rect x="42" y="${y + 10}" width="68" height="4" rx="1.5" fill="currentColor" class="op-85"/>
            ${Array.from({ length: 24 }, (_, k) => `<rect x="${32 + k * 10.6}" y="${y + 22}" width="7" height="11" rx="1.5" fill="${k === 17 ? "var(--accent-amber)" : "var(--accent-emerald)"}" class="op-80"/>`).join("")}
          `).join("")}
        `);
      }
      if (slug === "market") {
        return windowChrome(`
          <rect x="18" y="30" width="196" height="154" rx="5" stroke="currentColor" class="op-22"/>
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const up = i % 2 === 0;
            const top = 55 + ((i * 17) % 60);
            return `<line x1="${38 + i * 19}" y1="${top - 12}" x2="${38 + i * 19}" y2="${top + 28}" stroke="${up ? "var(--accent-emerald)" : "#f43f5e"}" stroke-width="1.4"/>
                    <rect x="${33 + i * 19}" y="${top}" width="10" height="18" rx="1.5" fill="${up ? "var(--accent-emerald)" : "#f43f5e"}" class="op-85"/>`;
          }).join("")}
          <rect x="222" y="30" width="80" height="154" rx="5" stroke="currentColor" class="op-22"/>
        `);
      }
      const pts = Array.from({ length: 8 }, (_, i) => `${28 + i * 26},${154 - ((h >> i) % 45 + 18)}`).join(" ");
      return windowChrome(`
        ${[0, 1, 2, 3].map((i) => `
          <rect x="${14 + i * 74}" y="28" width="68" height="42" rx="4.5" stroke="currentColor" class="op-22"/>
          <rect x="${21 + i * 74}" y="36" width="32" height="3" rx="1" fill="currentColor" class="op-45"/>
          <rect x="${21 + i * 74}" y="46" width="42" height="6" rx="1.5" fill="currentColor" class="op-85"/>
          <rect x="${21 + i * 74}" y="57" width="22" height="4" rx="2" fill="${acc}" class="op-80"/>`).join("")}
        <rect x="14" y="78" width="202" height="108" rx="5" stroke="currentColor" class="op-22"/>
        <polyline points="${pts}" fill="none" stroke="${acc}" stroke-width="2.4" stroke-linecap="round" class="anim-draw"/>
        <rect x="224" y="78" width="82" height="108" rx="5" stroke="currentColor" class="op-22"/>
      `);
    }

    // ========================================================================
    // 5. TABLAS (9 composiciones distintas)
    // ========================================================================
    if (catId === "tables") {
      if (slug === "logs") {
        return windowChrome(`
          <rect x="14" y="28" width="292" height="158" rx="5" fill="currentColor" class="op-04" stroke="currentColor" stroke-opacity="0.24"/>
          ${[42, 64, 86, 108, 130, 152, 170].map((y, i) => `
            <rect x="22" y="${y}" width="24" height="8" rx="2" fill="${i === 2 ? "#f43f5e" : i === 4 ? "var(--accent-amber)" : "var(--accent-emerald)"}" class="op-80"/>
            <rect x="54" y="${y + 2}" width="42" height="3.5" rx="1" fill="currentColor" class="op-45"/>
            <rect x="104" y="${y + 2}" width="${110 + (i % 3) * 26}" height="3.5" rx="1" fill="currentColor" class="op-80"/>
            <rect x="268" y="${y + 2}" width="26" height="3.5" rx="1" fill="currentColor" class="op-40"/>
          `).join("")}
        `);
      }
      if (slug === "members") {
        return windowChrome(`
          <rect x="14" y="28" width="292" height="158" rx="5" stroke="currentColor" class="op-22"/>
          ${[44, 76, 108, 140].map((y, i) => `
            <circle cx="32" cy="${y + 8}" r="9" fill="${accents[(i + 1) % accents.length]}" class="op-65"/>
            <rect x="48" y="${y + 3}" width="${68 + (i % 2) * 22}" height="4" rx="1.5" fill="currentColor" class="op-85"/>
            <rect x="48" y="${y + 10}" width="54" height="3" rx="1" fill="currentColor" class="op-40"/>
            <rect x="168" y="${y + 4}" width="44" height="10" rx="5" stroke="currentColor" class="op-30"/>
            <circle cx="278" cy="${y + 8}" r="3.5" fill="var(--accent-emerald)"/>
          `).join("")}
        `);
      }
      if (slug === "api-keys") {
        return windowChrome(`
          <rect x="14" y="28" width="292" height="158" rx="5" stroke="currentColor" class="op-22"/>
          ${[46, 82, 118, 154].map((y, i) => `
            <rect x="26" y="${y}" width="56" height="4" rx="1.5" fill="currentColor" class="op-85"/>
            <rect x="96" y="${y - 4}" width="104" height="12" rx="3" fill="currentColor" class="op-08"/>
            <rect x="102" y="${y + 0.5}" width="78" height="3" rx="1" fill="${acc}" class="op-85"/>
            <rect x="248" y="${y - 3}" width="42" height="10" rx="3" stroke="currentColor" class="op-30"/>
          `).join("")}
        `);
      }
      if (slug === "issues") {
        return windowChrome(`
          <rect x="14" y="28" width="292" height="158" rx="5" stroke="currentColor" class="op-22"/>
          ${[42, 68, 94, 120, 146, 168].map((y, i) => `
            <circle cx="28" cy="${y + 3}" r="4.5" stroke="${i === 0 ? "#f43f5e" : acc}" stroke-width="1.5"/>
            <rect x="40" y="${y + 1}" width="28" height="3.5" rx="1" fill="currentColor" class="op-40"/>
            <rect x="76" y="${y + 1}" width="${96 + (i % 3) * 24}" height="4" rx="1.5" fill="currentColor" class="op-85"/>
            <rect x="228" y="${y - 1}" width="36" height="8" rx="4" fill="${acc}" class="op-25"/>
            <circle cx="284" cy="${y + 3}" r="5.5" fill="currentColor" class="op-30"/>
          `).join("")}
        `);
      }
      return windowChrome(`
        <rect x="14" y="28" width="110" height="14" rx="3.5" stroke="currentColor" class="op-25"/>
        <rect x="254" y="28" width="52" height="14" rx="3.5" fill="${acc}" class="op-85"/>
        <rect x="14" y="48" width="292" height="138" rx="5" stroke="currentColor" class="op-22"/>
        <line x1="14" y1="68" x2="306" y2="68" stroke="currentColor" class="op-25"/>
        ${[88, 110, 132, 154, 172].map((y, i) => `
          <g class="${i === idx % 4 ? "anim-slide-x" : ""}">
            ${i === idx % 4 ? `<rect x="15" y="${y - 16}" width="290" height="21" fill="currentColor" class="op-06"/>` : ""}
            <rect x="22" y="${y - 10}" width="8" height="8" rx="1.8" stroke="currentColor" class="op-45"/>
            <rect x="38" y="${y - 8}" width="${52 + ((i + idx) % 4) * 16}" height="3.5" rx="1" fill="currentColor" class="op-80"/>
            <rect x="142" y="${y - 9}" width="38" height="7" rx="3.5" fill="${i % 2 === 0 ? acc : "var(--accent-amber)"}" class="op-35"/>
            <rect x="262" y="${y - 8}" width="32" height="3.5" rx="1" fill="currentColor" class="op-70"/>
          </g>`).join("")}
      `);
    }

    // ========================================================================
    // 6. FILTROS (4 composiciones distintas)
    // ========================================================================
    if (catId === "filters") {
      if (slug === "toolbar") {
        return windowChrome(`
          <rect x="16" y="42" width="288" height="32" rx="6" fill="var(--bg)" stroke="currentColor" class="op-35"/>
          <circle cx="32" cy="58" r="5" stroke="currentColor" class="op-55"/>
          <rect x="44" y="56" width="84" height="4" rx="1.5" fill="currentColor" class="op-60"/>
          <rect x="176" y="49" width="54" height="18" rx="4" stroke="currentColor" class="op-30"/>
          <rect x="236" y="49" width="58" height="18" rx="4" fill="${acc}" class="op-85"/>
          <rect x="16" y="88" width="288" height="92" rx="6" stroke="currentColor" class="op-16"/>
        `);
      }
      if (slug === "chips") {
        return windowChrome(`
          <rect x="18" y="38" width="284" height="136" rx="6" stroke="currentColor" class="op-20"/>
          <g class="anim-slide-x">
            <rect x="30" y="52" width="96" height="22" rx="11" fill="${acc}" class="op-22" stroke="${acc}"/>
            <rect x="42" y="61" width="64" height="4" rx="1.5" fill="currentColor" class="op-90"/>
            <rect x="134" y="52" width="108" height="22" rx="11" fill="currentColor" class="op-08" stroke="currentColor" stroke-opacity="0.3"/>
            <rect x="146" y="61" width="76" height="4" rx="1.5" fill="currentColor" class="op-75"/>
          </g>
          <rect x="30" y="86" width="76" height="20" rx="10" stroke="currentColor" stroke-dasharray="3 3" class="op-40"/>
        `);
      }
      return windowChrome(`
        <rect x="18" y="30" width="284" height="22" rx="4.5" stroke="currentColor" class="op-25"/>
        <rect x="26" y="36" width="54" height="10" rx="5" fill="${acc}" class="op-28"/>
        <rect x="86" y="36" width="62" height="10" rx="5" fill="currentColor" class="op-12"/>
        <rect x="${slug === "sidebar" ? 18 : 112}" y="60" width="${slug === "sidebar" ? 96 : 144}" height="122" rx="6" fill="var(--bg)" stroke="currentColor" class="op-45 anim-float"/>
        ${[80, 102, 124, 146].map((y, i) => `
          <rect x="${slug === "sidebar" ? 28 : 124}" y="${y}" width="9" height="9" rx="2" fill="${i < 2 ? acc : "none"}" stroke="currentColor" class="${i < 2 ? "op-90" : "op-35"}"/>
          <rect x="${slug === "sidebar" ? 44 : 140}" y="${y + 3}" width="${46 + (i % 2) * 14}" height="3.2" rx="1" fill="currentColor" class="op-75"/>`).join("")}
      `);
    }

    // ========================================================================
    // 7. ESTADOS VACÍOS (10 composiciones distintas)
    // ========================================================================
    if (catId === "empty-states") {
      if (slug === "first-project") {
        return windowChrome(`
          <rect x="88" y="38" width="144" height="6" rx="2" fill="currentColor" class="op-85"/>
          ${[0, 1, 2].map((i) => `
            <rect x="${32 + i * 88}" y="64" width="80" height="72" rx="6" stroke="${i === 1 ? acc : "currentColor"}" class="${i === 1 ? "op-90 anim-float" : "op-25"}"/>
            <circle cx="${72 + i * 88}" cy="90" r="10" fill="${i === 1 ? acc : "currentColor"}" class="op-25"/>
            <rect x="${48 + i * 88}" y="112" width="48" height="4" rx="1.5" fill="currentColor" class="op-75"/>
          `).join("")}
          <rect x="116" y="152" width="88" height="20" rx="4.5" fill="${acc}" class="op-90"/>
        `);
      }
      if (slug === "no-files") {
        return windowChrome(`
          <rect x="44" y="42" width="232" height="132" rx="10" stroke="${acc}" stroke-width="1.5" stroke-dasharray="5 5" class="op-65 anim-pulse"/>
          <path d="M160 98 V72 M150 80 L160 70 L170 80" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
          <rect x="108" y="114" width="104" height="5" rx="2" fill="currentColor" class="op-80"/>
          <rect x="122" y="136" width="76" height="18" rx="4" fill="currentColor" class="op-90"/>
        `);
      }
      return windowChrome(`
        <rect x="28" y="32" width="264" height="150" rx="7" stroke="currentColor" stroke-dasharray="4 4" class="op-22"/>
        <g class="anim-float">
          <circle cx="160" cy="82" r="22" fill="currentColor" class="op-06" stroke="currentColor" stroke-opacity="0.28"/>
          ${slug === "404" ? `<text x="160" y="87" text-anchor="middle" font-size="14" font-weight="700" fill="${acc}">404</text>` : `<circle cx="160" cy="82" r="10" stroke="${acc}" stroke-width="1.8" class="op-90"/>`}
        </g>
        <rect x="${112 - (idx % 3) * 8}" y="118" width="${96 + (idx % 3) * 16}" height="5" rx="2" fill="currentColor" class="op-80"/>
        <rect x="92" y="129" width="136" height="3" rx="1" fill="currentColor" class="op-40"/>
        <rect x="124" y="144" width="72" height="18" rx="4" fill="${acc}" class="op-90"/>
      `);
    }

    // ========================================================================
    // 8. AJUSTES (12 composiciones distintas)
    // ========================================================================
    if (catId === "settings") {
      if (slug === "appearance") {
        return windowChrome(`
          ${[0, 1, 2].map((i) => `
            <rect x="${28 + i * 92}" y="42" width="80" height="58" rx="6" stroke="${i === 1 ? acc : "currentColor"}" stroke-width="${i === 1 ? "2" : "1"}" class="${i === 1 ? "op-95" : "op-28"}"/>
            <rect x="${36 + i * 92}" y="52" width="64" height="36" rx="3" fill="${i === 0 ? "#ffffff" : "#111113"}" stroke="currentColor" class="op-25"/>
          `).join("")}
          <rect x="28" y="120" width="264" height="52" rx="6" stroke="currentColor" class="op-22"/>
          ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${52 + i * 28}" cy="146" r="8" fill="${accents[i]}"/>`).join("")}
        `);
      }
      if (slug === "integrations") {
        return windowChrome(`
          ${[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 22 + (i % 3) * 94;
            const y = 36 + Math.floor(i / 3) * 74;
            return `<rect x="${x}" y="${y}" width="86" height="64" rx="6" stroke="currentColor" class="op-24"/>
                    <circle cx="${x + 18}" cy="${y + 18}" r="7" fill="${accents[i % accents.length]}" class="op-75"/>
                    <rect x="${x + 12}" y="${y + 34}" width="52" height="4" rx="1.5" fill="currentColor" class="op-85"/>
                    <rect x="${x + 56}" y="${y + 13}" width="18" height="10" rx="5" fill="${i % 2 === 0 ? acc : "currentColor"}" class="${i % 2 === 0 ? "op-85" : "op-20"}"/>`;
          }).join("")}
        `);
      }
      if (slug === "permissions") {
        return windowChrome(`
          <rect x="20" y="34" width="280" height="146" rx="6" stroke="currentColor" class="op-24"/>
          <line x1="20" y1="60" x2="300" y2="60" stroke="currentColor" class="op-25"/>
          ${[76, 104, 132, 160].map((y, r) => `
            <rect x="32" y="${y}" width="76" height="4" rx="1.5" fill="currentColor" class="op-80"/>
            ${[152, 206, 260].map((x, c) => `<rect x="${x}" y="${y - 3}" width="11" height="11" rx="2.5" fill="${(r + c) % 2 === 0 ? acc : "none"}" stroke="currentColor" class="${(r + c) % 2 === 0 ? "op-90" : "op-35"}"/>`).join("")}
          `).join("")}
        `);
      }
      return windowChrome(`
        <rect x="16" y="32" width="64" height="152" rx="4" fill="currentColor" class="op-04"/>
        ${[40, 56, 72, 88, 104, 120].map((y, i) => `
          <rect x="22" y="${y}" width="52" height="10" rx="2.5" fill="${i === idx % 5 ? acc : "currentColor"}" class="${i === idx % 5 ? "op-22" : "op-0"}"/>
          <rect x="27" y="${y + 3.5}" width="${34 + (i % 2) * 8}" height="3" rx="1" fill="currentColor" class="${i === idx % 5 ? "op-90" : "op-45"}"/>`).join("")}
        <rect x="94" y="34" width="208" height="68" rx="5" stroke="currentColor" class="op-22"/>
        <rect x="106" y="46" width="84" height="4.5" rx="1.5" fill="currentColor" class="op-80"/>
        <rect x="106" y="70" width="184" height="18" rx="3.5" stroke="currentColor" class="op-25"/>
        <rect x="94" y="112" width="208" height="70" rx="5" stroke="currentColor" class="op-22"/>
        <rect x="256" y="124" width="32" height="16" rx="8" fill="${acc}" class="op-90"/>
        <circle cx="280" cy="132" r="5.5" fill="var(--bg)"/>
      `);
    }

    // ========================================================================
    // 9. TARJETAS (10 composiciones distintas)
    // ========================================================================
    if (catId === "cards") {
      if (slug === "payment-method") {
        return windowChrome(`
          <g class="anim-float">
            <rect x="54" y="40" width="212" height="128" rx="10" fill="var(--bg)" stroke="${acc}" stroke-width="1.5"/>
            <rect x="74" y="60" width="28" height="20" rx="4" fill="var(--accent-amber)" class="op-80"/>
            <rect x="74" y="102" width="144" height="6" rx="2" fill="currentColor" class="op-85"/>
            <rect x="74" y="136" width="68" height="4" rx="1.5" fill="currentColor" class="op-55"/>
            <circle cx="226" cy="138" r="10" fill="#f43f5e" class="op-75"/>
            <circle cx="238" cy="138" r="10" fill="var(--accent-amber)" class="op-75"/>
          </g>
        `);
      }
      if (slug === "task") {
        return windowChrome(`
          <g class="anim-float">
            <rect x="56" y="36" width="208" height="140" rx="8" fill="var(--bg)" stroke="currentColor" class="op-35"/>
            <rect x="72" y="50" width="44" height="12" rx="6" fill="${acc}" class="op-25"/>
            <rect x="72" y="72" width="152" height="6" rx="2" fill="currentColor" class="op-90"/>
            <rect x="72" y="102" width="176" height="6" rx="3" fill="currentColor" class="op-12"/>
            <rect x="72" y="102" width="124" height="6" rx="3" fill="var(--accent-emerald)" class="op-85"/>
            <circle cx="224" cy="146" r="9" fill="${acc}" class="op-80"/>
            <circle cx="238" cy="146" r="9" fill="currentColor" class="op-35"/>
          </g>
        `);
      }
      return windowChrome(`
        <g class="anim-float">
          <rect x="52" y="36" width="216" height="140" rx="8" fill="var(--bg)" stroke="currentColor" class="op-32"/>
          <circle cx="78" cy="62" r="12" fill="${acc}" class="op-28"/>
          <rect x="98" y="54" width="${76 + (idx % 4) * 12}" height="5" rx="2" fill="currentColor" class="op-85"/>
          <rect x="98" y="64" width="56" height="3" rx="1" fill="currentColor" class="op-45"/>
          <rect x="218" y="52" width="34" height="14" rx="7" fill="${acc}" class="op-25"/>
          <line x1="66" y1="86" x2="254" y2="86" stroke="currentColor" class="op-14"/>
          <rect x="66" y="98" width="164" height="4" rx="1.5" fill="currentColor" class="op-60"/>
          <rect x="66" y="138" width="76" height="20" rx="4" fill="${acc}" class="op-90"/>
          <rect x="150" y="138" width="60" height="20" rx="4" stroke="currentColor" class="op-25"/>
        </g>
      `);
    }

    // ========================================================================
    // 10. MODALES (10 composiciones distintas)
    // ========================================================================
    if (catId === "modals") {
      if (slug === "shortcuts") {
        return windowChrome(`
          <rect x="44" y="32" width="232" height="150" rx="8" fill="var(--bg)" stroke="currentColor" class="op-45"/>
          ${[52, 82, 112, 142].map((y) => `
            <rect x="60" y="${y}" width="68" height="4" rx="1.5" fill="currentColor" class="op-75"/>
            <rect x="214" y="${y - 4}" width="18" height="14" rx="3" stroke="currentColor" class="op-45"/>
            <rect x="236" y="${y - 4}" width="18" height="14" rx="3" stroke="${acc}" class="op-85"/>
          `).join("")}
        `);
      }
      return windowChrome(`
        <rect x="0" y="20" width="320" height="180" fill="currentColor" class="op-06"/>
        <g class="anim-float">
          <rect x="56" y="36" width="208" height="140" rx="8" fill="var(--bg)" stroke="currentColor" class="op-45"/>
          <rect x="72" y="52" width="${92 + (idx % 3) * 16}" height="5.5" rx="2" fill="currentColor" class="op-85"/>
          <rect x="72" y="65" width="168" height="3.5" rx="1" fill="currentColor" class="op-45"/>
          <rect x="72" y="82" width="176" height="42" rx="5" fill="currentColor" class="op-05" stroke="currentColor" stroke-dasharray="3 3" stroke-opacity="0.25"/>
          <rect x="132" y="142" width="52" height="18" rx="4" stroke="currentColor" class="op-28"/>
          <rect x="192" y="142" width="56" height="18" rx="4" fill="${slug === "confirm-delete" ? "#f43f5e" : acc}" class="op-90"/>
        </g>
      `);
    }

    // ========================================================================
    // 11. GRÁFICOS (9 composiciones distintas)
    // ========================================================================
    if (catId === "charts") {
      if (slug === "cohort-heatmap") {
        let cells = "";
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 8 - r; c++) {
            const op = (0.92 - c * 0.1 - r * 0.04).toFixed(2);
            cells += `<rect x="${42 + c * 30}" y="${52 + r * 24}" width="26" height="20" rx="3" fill="${acc}" style="opacity:${op}" class="anim-pulse"/>`;
          }
        }
        return windowChrome(`<rect x="24" y="34" width="272" height="150" rx="6" stroke="currentColor" class="op-20"/>${cells}`);
      }
      if (slug === "gauges" || slug === "donut") {
        return windowChrome(`
          <rect x="24" y="34" width="272" height="150" rx="6" stroke="currentColor" class="op-20"/>
          <circle cx="115" cy="110" r="44" stroke="currentColor" stroke-width="10" class="op-12"/>
          <circle cx="115" cy="110" r="44" stroke="${acc}" stroke-width="10" stroke-dasharray="190 300" stroke-linecap="round" transform="rotate(-90 115 110)" class="anim-draw"/>
          <circle cx="115" cy="110" r="44" stroke="var(--accent-emerald)" stroke-width="10" stroke-dasharray="65 300" stroke-dashoffset="-198" stroke-linecap="round" transform="rotate(-90 115 110)"/>
          <rect x="188" y="76" width="76" height="6" rx="2" fill="currentColor" class="op-80"/>
          <rect x="188" y="94" width="60" height="4" rx="1.5" fill="${acc}" class="op-75"/>
          <rect x="188" y="110" width="68" height="4" rx="1.5" fill="var(--accent-emerald)" class="op-75"/>
        `);
      }
      if (slug === "funnel") {
        const widths = [220, 176, 134, 96, 64];
        return windowChrome(`
          <rect x="24" y="34" width="272" height="150" rx="6" stroke="currentColor" class="op-20"/>
          ${widths.map((w, i) => `<rect x="${160 - w / 2}" y="${48 + i * 25}" width="${w}" height="19" rx="4" fill="${acc}" style="opacity:${0.92 - i * 0.14}" class="anim-bar"/>`).join("")}
        `);
      }
      if (slug === "scatter") {
        return windowChrome(`
          <rect x="24" y="34" width="272" height="150" rx="6" stroke="currentColor" class="op-20"/>
          <line x1="48" y1="158" x2="270" y2="58" stroke="currentColor" stroke-dasharray="3 3" class="op-35"/>
          ${Array.from({ length: 18 }, (_, i) => `<circle cx="${52 + i * 12}" cy="${156 - i * 5.2 + ((i % 3) - 1) * 14}" r="${3.5 + (i % 3)}" fill="${i % 2 === 0 ? acc : "var(--accent-sky)"}" class="op-80 anim-pulse"/>`).join("")}
        `);
      }
      if (slug === "bar-grouped" || slug === "waterfall") {
        const bars = [68, 96, 52, 112, 84, 124, 92];
        return windowChrome(`
          <rect x="24" y="34" width="272" height="150" rx="6" stroke="currentColor" class="op-20"/>
          ${bars.map((bh, i) => `
            <rect x="${44 + i * 34}" y="${168 - bh}" width="12" height="${bh}" rx="2.5" fill="${acc}" class="op-85 anim-bar"/>
            <rect x="${58 + i * 34}" y="${168 - Math.floor(bh * 0.68)}" width="12" height="${Math.floor(bh * 0.68)}" rx="2.5" fill="currentColor" class="op-25 anim-bar"/>`).join("")}
        `);
      }
      return windowChrome(`
        <rect x="24" y="34" width="272" height="150" rx="6" stroke="currentColor" class="op-20"/>
        <path d="M40 155 Q 85 120, 125 132 T 205 88 T 280 62 L 280 168 L 40 168 Z" fill="${acc}" class="op-16"/>
        <path d="M40 155 Q 85 120, 125 132 T 205 88 T 280 62" fill="none" stroke="${acc}" stroke-width="2.4" class="anim-draw"/>
        <path d="M40 162 Q 95 145, 140 148 T 220 118 T 280 102" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3" class="op-45"/>
      `);
    }

    // ========================================================================
    // 12. LÍNEAS DE TIEMPO (12 composiciones distintas)
    // ========================================================================
    if (catId === "timelines") {
      if (slug === "status-page" || slug === "pr-ops-console") {
        return windowChrome(`
          <rect x="24" y="34" width="272" height="148" rx="6" stroke="currentColor" class="op-22"/>
          ${[54, 98, 142].map((y) => `
            <rect x="38" y="${y}" width="84" height="4" rx="1.5" fill="currentColor" class="op-85"/>
            ${Array.from({ length: 22 }, (_, k) => `<rect x="${38 + k * 11}" y="${y + 10}" width="7" height="14" rx="1.5" fill="${k === 14 ? "var(--accent-amber)" : "var(--accent-emerald)"}" class="op-85"/>`).join("")}
          `).join("")}
        `);
      }
      return windowChrome(`
        <line x1="64" y1="34" x2="64" y2="186" stroke="currentColor" class="op-22"/>
        ${[46, 84, 122, 160].map((y, i) => `
          <g class="${i === idx % 3 ? "anim-slide-x" : ""}">
            <circle cx="64" cy="${y}" r="5" fill="${i === idx % 3 ? acc : "var(--bg)"}" stroke="currentColor" stroke-width="1.5" class="${i === idx % 3 ? "op-95" : "op-55"}"/>
            <rect x="82" y="${y - 10}" width="204" height="26" rx="4.5" stroke="currentColor" class="op-20" fill="currentColor" fill-opacity="0.02"/>
            <rect x="92" y="${y - 3}" width="${78 + ((i + idx) % 4) * 22}" height="4" rx="1.5" fill="currentColor" class="op-80"/>
            <rect x="242" y="${y - 4}" width="32" height="6" rx="3" fill="${i === idx % 3 ? acc : "currentColor"}" class="op-25"/>
          </g>`).join("")}
      `);
    }

    // ========================================================================
    // 13. CALENDARIOS (9 composiciones distintas)
    // ========================================================================
    if (catId === "calendars") {
      if (slug === "year-heatmap") {
        let squares = "";
        for (let c = 0; c < 22; c++) {
          for (let r = 0; r < 7; r++) {
            const on = (c * 7 + r + h) % 3 === 0;
            squares += `<rect x="${26 + c * 12}" y="${58 + r * 14}" width="9" height="9" rx="2" fill="${on ? acc : "currentColor"}" class="${on ? "op-80" : "op-10"}"/>`;
          }
        }
        return windowChrome(`<rect x="26" y="36" width="96" height="6" rx="2" fill="currentColor" class="op-80"/>${squares}`);
      }
      if (slug === "week" || slug === "timezone") {
        return windowChrome(`
          ${[0, 1, 2, 3, 4].map((i) => `
            <line x1="${52 + i * 52}" y1="32" x2="${52 + i * 52}" y2="186" stroke="currentColor" class="op-16"/>
            <rect x="${58 + i * 52}" y="${52 + (i % 3) * 28}" width="40" height="34" rx="4" fill="${acc}" class="op-30" stroke="${acc}"/>
          `).join("")}
          <line x1="20" y1="98" x2="300" y2="98" stroke="#f43f5e" stroke-width="1.5"/>
          <circle cx="20" cy="98" r="3.5" fill="#f43f5e"/>
        `);
      }
      let grid = "";
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 7; c++) {
          const isEvent = (r === idx % 3 && c === 2) || (r === 2 && c === (idx % 5) + 1);
          grid += `<rect x="${30 + c * 37}" y="${58 + r * 30}" width="33" height="26" rx="3" stroke="currentColor" class="op-16" fill="${isEvent ? acc : "none"}" fill-opacity="${isEvent ? "0.22" : "0"}"/>`;
          if (isEvent) {
            grid += `<rect x="${34 + c * 37}" y="${74 + r * 30}" width="24" height="4" rx="1.5" fill="${acc}" class="op-90 anim-pulse"/>`;
          }
        }
      }
      return windowChrome(`<rect x="30" y="34" width="84" height="6" rx="2" fill="currentColor" class="op-80"/>${grid}`);
    }

    // ========================================================================
    // 14. PERFIL (10 composiciones distintas)
    // ========================================================================
    if (catId === "profile") {
      if (slug === "org-chart") {
        return windowChrome(`
          <rect x="128" y="36" width="64" height="28" rx="5" fill="${acc}" class="op-25" stroke="${acc}" stroke-width="1.5"/>
          <path d="M160 64 V88 M72 88 H248 M72 88 V108 M160 88 V108 M248 88 V108" stroke="currentColor" class="op-35"/>
          ${[40, 128, 216].map((x) => `<rect x="${x}" y="108" width="64" height="32" rx="5" stroke="currentColor" class="op-40" fill="var(--bg)"/>`).join("")}
        `);
      }
      if (slug === "team-grid") {
        return windowChrome(`
          ${[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 26 + (i % 3) * 92;
            const y = 36 + Math.floor(i / 3) * 74;
            return `<rect x="${x}" y="${y}" width="84" height="64" rx="6" stroke="currentColor" class="op-24"/>
                    <circle cx="${x + 42}" cy="${y + 24}" r="11" fill="${accents[i % accents.length]}" class="op-55"/>
                    <rect x="${x + 20}" y="${y + 44}" width="44" height="4" rx="1.5" fill="currentColor" class="op-80"/>`;
          }).join("")}
        `);
      }
      return windowChrome(`
        <rect x="28" y="30" width="264" height="44" rx="6" fill="${acc}" class="op-18"/>
        <circle cx="68" cy="74" r="18" fill="var(--bg)" stroke="currentColor" stroke-width="1.6" class="op-85"/>
        <circle cx="68" cy="74" r="12" fill="${acc}" class="op-45"/>
        <rect x="218" y="82" width="60" height="16" rx="4" fill="currentColor" class="op-90"/>
        <rect x="50" y="102" width="96" height="5.5" rx="2" fill="currentColor" class="op-85"/>
        <rect x="50" y="132" width="68" height="38" rx="4.5" stroke="currentColor" class="op-20"/>
        <rect x="126" y="132" width="68" height="38" rx="4.5" stroke="currentColor" class="op-20"/>
        <rect x="202" y="132" width="68" height="38" rx="4.5" stroke="currentColor" class="op-20"/>
      `);
    }

    // ========================================================================
    // 15. TOASTS Y BANNERS (6 composiciones distintas)
    // ========================================================================
    if (catId === "toasts") {
      if (slug === "info-banner") {
        return windowChrome(`
          <rect x="12" y="28" width="296" height="28" rx="6" fill="${acc}" class="op-20" stroke="${acc}"/>
          <circle cx="28" cy="42" r="4.5" fill="${acc}"/>
          <rect x="42" y="40" width="164" height="4" rx="1.5" fill="currentColor" class="op-90"/>
          <rect x="246" y="35" width="48" height="14" rx="4" fill="currentColor" class="op-90"/>
          <rect x="24" y="72" width="272" height="108" rx="6" stroke="currentColor" class="op-15"/>
        `);
      }
      return windowChrome(`
        <rect x="64" y="64" width="192" height="36" rx="6" stroke="currentColor" class="op-18"/>
        <rect x="52" y="82" width="216" height="42" rx="7" fill="var(--bg)" stroke="currentColor" class="op-35"/>
        <g class="anim-float">
          <rect x="38" y="104" width="244" height="54" rx="8" fill="var(--bg)" stroke="currentColor" stroke-width="1.4" class="op-85"/>
          <circle cx="60" cy="131" r="8" fill="${slug === "error-retry" ? "#f43f5e" : acc}" class="op-85"/>
          <rect x="78" y="122" width="108" height="5" rx="1.8" fill="currentColor" class="op-85"/>
          <rect x="78" y="133" width="136" height="3.5" rx="1" fill="currentColor" class="op-45"/>
          <rect x="230" y="122" width="38" height="18" rx="4" fill="${acc}" class="op-22"/>
        </g>
      `);
    }

    // ========================================================================
    // 16. PRECIOS (6 composiciones distintas)
    // ========================================================================
    if (catId === "pricing") {
      if (slug === "slider-seats") {
        return windowChrome(`
          <rect x="44" y="40" width="232" height="136" rx="8" fill="var(--bg)" stroke="currentColor" class="op-30"/>
          <rect x="64" y="60" width="96" height="6" rx="2" fill="currentColor" class="op-85"/>
          <rect x="64" y="96" width="192" height="8" rx="4" fill="currentColor" class="op-15"/>
          <rect x="64" y="96" width="118" height="8" rx="4" fill="${acc}" class="op-90"/>
          <circle cx="182" cy="100" r="8" fill="var(--bg)" stroke="${acc}" stroke-width="3" class="anim-pulse"/>
          <rect x="64" y="134" width="192" height="24" rx="5" fill="currentColor" class="op-90"/>
        `);
      }
      return windowChrome(`
        <rect x="20" y="42" width="84" height="136" rx="6" stroke="currentColor" class="op-22"/>
        <g class="anim-float">
          <rect x="114" y="30" width="92" height="154" rx="7" fill="var(--bg)" stroke="${acc}" stroke-width="1.6" class="op-90"/>
          <rect x="126" y="44" width="44" height="4.5" rx="1.5" fill="${acc}" class="op-90"/>
          <rect x="126" y="56" width="56" height="10" rx="2" fill="currentColor" class="op-90"/>
          <rect x="126" y="152" width="68" height="18" rx="4" fill="${acc}" class="op-90"/>
        </g>
        <rect x="216" y="42" width="84" height="136" rx="6" stroke="currentColor" class="op-22"/>
      `);
    }

    // ========================================================================
    // 17. TOURS Y GUÍAS (6 composiciones distintas)
    // ========================================================================
    if (catId === "tours") {
      if (slug === "checklist") {
        return windowChrome(`
          <rect x="58" y="34" width="204" height="148" rx="8" fill="var(--bg)" stroke="currentColor" class="op-35"/>
          <circle cx="82" cy="56" r="10" stroke="${acc}" stroke-width="2.5" stroke-dasharray="45 60"/>
          <rect x="102" y="53" width="96" height="5" rx="2" fill="currentColor" class="op-85"/>
          ${[82, 108, 134, 156].map((y, i) => `
            <circle cx="80" cy="${y}" r="5.5" fill="${i < 3 ? acc : "none"}" stroke="currentColor" class="${i < 3 ? "op-90" : "op-35"}"/>
            <rect x="94" y="${y - 2}" width="${110 - i * 12}" height="4" rx="1.5" fill="currentColor" class="${i < 3 ? "op-45" : "op-85"}"/>
          `).join("")}
        `);
      }
      return windowChrome(`
        <rect x="28" y="42" width="96" height="32" rx="5" stroke="${acc}" stroke-width="1.6" class="op-90"/>
        <circle cx="124" cy="42" r="6" fill="${acc}" class="anim-pulse"/>
        <g class="anim-float">
          <rect x="112" y="86" width="172" height="86" rx="7" fill="var(--bg)" stroke="currentColor" stroke-width="1.4" class="op-85"/>
          <rect x="126" y="100" width="96" height="5" rx="1.8" fill="currentColor" class="op-85"/>
          <rect x="126" y="112" width="140" height="3.5" rx="1" fill="currentColor" class="op-45"/>
          <rect x="224" y="144" width="46" height="16" rx="4" fill="${acc}" class="op-90"/>
        </g>
      `);
    }

    // ========================================================================
    // 18. HILOS Y COMENTARIOS (6 composiciones distintas)
    // ========================================================================
    if (slug === "mention-popover") {
      return windowChrome(`
        <rect x="34" y="112" width="252" height="58" rx="7" stroke="currentColor" class="op-30"/>
        <rect x="48" y="126" width="84" height="5" rx="1.5" fill="${acc}" class="op-90"/>
        <g class="anim-float">
          <rect x="64" y="34" width="152" height="84" rx="7" fill="var(--bg)" stroke="currentColor" class="op-85"/>
          ${[48, 72, 96].map((y, i) => `
            <circle cx="80" cy="${y + 4}" r="6" fill="${accents[i]}" class="op-80"/>
            <rect x="94" y="${y + 2}" width="84" height="4" rx="1.5" fill="currentColor" class="${i === 0 ? "op-95" : "op-55"}"/>
          `).join("")}
        </g>
      `);
    }
    return windowChrome(`
      <circle cx="38" cy="48" r="8" fill="${acc}" class="op-75"/>
      <path d="M38 60 L38 128 Q38 138 48 138 L64 138" stroke="currentColor" stroke-width="1.3" class="op-28"/>
      <rect x="54" y="36" width="234" height="44" rx="6" stroke="currentColor" class="op-24"/>
      <rect x="66" y="46" width="76" height="4" rx="1.5" fill="currentColor" class="op-80"/>
      <rect x="66" y="56" width="184" height="3.5" rx="1" fill="currentColor" class="op-45"/>
      <circle cx="76" cy="138" r="7" fill="var(--accent-emerald)" class="op-75"/>
      <g class="anim-slide-x">
        <rect x="92" y="118" width="196" height="48" rx="6" fill="var(--bg)" stroke="currentColor" class="op-40"/>
        <rect x="104" y="128" width="68" height="4" rx="1.5" fill="currentColor" class="op-85"/>
        <rect x="104" y="138" width="152" height="3.5" rx="1" fill="currentColor" class="op-45"/>
        <rect x="104" y="150" width="28" height="10" rx="5" fill="${acc}" class="op-22"/>
      </g>
    `);
  }

  window.TESELA_PREVIEWS = {
    getCategoryIcon,
    generatePreviewSVG
  };
})();
