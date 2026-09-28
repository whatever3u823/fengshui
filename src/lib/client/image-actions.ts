/**
 * Browser-side helpers for downloading and sharing results. Images are data
 * URLs today; these also work with same-origin URLs once storage exists.
 */

export async function srcToBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new Error("Could not read image");
  return res.blob();
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/** Side-by-side before/after card with labels, for sharing. */
export async function composeBeforeAfter(beforeSrc: string, afterSrc: string): Promise<Blob> {
  const [before, after] = await Promise.all([loadImage(beforeSrc), loadImage(afterSrc)]);
  const panelW = 1200;
  const panelH = Math.round((panelW * before.naturalHeight) / before.naturalWidth);
  const gap = 16;
  const pad = 40;
  const header = 84;
  const canvas = document.createElement("canvas");
  canvas.width = panelW * 2 + gap + pad * 2;
  canvas.height = panelH + pad * 2 + header;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#f6f4ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1b1a17";
  ctx.font = "400 40px Georgia, 'Times New Roman', serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Feng Shui AI", pad, pad + 36);
  ctx.fillStyle = "#6b675f";
  ctx.font = "500 22px system-ui, sans-serif";
  const tag = "Before / After";
  ctx.fillText(tag, canvas.width - pad - ctx.measureText(tag).width, pad + 32);

  const top = pad + header;
  ctx.drawImage(before, pad, top, panelW, panelH);
  ctx.drawImage(after, pad + panelW + gap, top, panelW, panelH);

  const label = (text: string, x: number) => {
    ctx.font = "500 22px system-ui, sans-serif";
    const w = ctx.measureText(text).width + 28;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x + 20, top + 20, w, 40);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x + 34, top + 48);
  };
  label("Original", pad);
  label("Feng Shui Optimized", pad + panelW + gap);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))), "image/jpeg", 0.9),
  );
}
