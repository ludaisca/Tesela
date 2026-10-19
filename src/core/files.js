// Utilidades de archivos compartidas por <tsl-prompt-input> y <tsl-upload>

export const formatBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1).replace(/\.0$/, "").replace(".", ",")} MB`;
};

// "10MB", "500 KB", "2048" → bytes
export const parseSize = (s) => {
  const m = /^\s*([\d.]+)\s*(b|kb|mb|gb)?\s*$/i.exec(s || "");
  if (!m) return 0;
  const mult = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 }[(m[2] || "b").toLowerCase()];
  return Math.round(parseFloat(m[1]) * mult);
};

// Misma regla que el atributo `accept` nativo: ".pdf", "image/*" o "text/plain"
export const accepts = (accept, file) => {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean).some((a) => {
    if (a.startsWith(".")) return name.endsWith(a);
    if (a.endsWith("/*")) return type.startsWith(a.slice(0, -1));
    return type === a;
  });
};

export const iconFor = (file) => {
  const t = file.type || "";
  if (t.startsWith("image/")) return "🖼";
  if (t.startsWith("audio/")) return "♪";
  if (t.startsWith("video/")) return "▶";
  if (t === "application/pdf" || /\.pdf$/i.test(file.name)) return "📄";
  return "📎";
};

// "image/*,.pdf" → "Imágenes, PDF" (para textos de ayuda)
const FAMILIES = { image: "Imágenes", audio: "Audio", video: "Vídeo", text: "Texto" };
export const describeAccept = (accept) =>
  String(accept || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)
    .map((a) => {
      const family = /^([a-z]+)\/\*$/i.exec(a);
      if (family) return FAMILIES[family[1].toLowerCase()] || family[1];
      return a.replace(/^\./, "").replace(/^[a-z]+\//i, "").toUpperCase();
    })
    .join(", ");
