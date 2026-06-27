// Kàá — share-card generator. Renders a number and its Yorùbá name onto a
// square canvas styled like the app (Adire Indigo, adire lattice, terracotta
// accent) and triggers a PNG download. Pure browser APIs, no dependencies.

export function downloadShareCard(numeral: string, yoruba: string): void {
  const size = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#25307A";
  ctx.fillRect(0, 0, size, size);

  // Adire diamond lattice, echoing the app background pattern.
  ctx.strokeStyle = "rgba(255, 247, 238, 0.07)";
  ctx.lineWidth = 4;
  const step = 270;
  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      ctx.beginPath();
      ctx.moveTo(x + step / 2, y);
      ctx.lineTo(x + step, y + step / 2);
      ctx.lineTo(x + step / 2, y + step);
      ctx.lineTo(x, y + step / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }

  const serif = "Georgia, 'Times New Roman', serif";

  ctx.fillStyle = "#FFF7EE";
  ctx.font = `bold 72px ${serif}`;
  ctx.textAlign = "left";
  ctx.fillText("Kàá", 80, 130);
  ctx.fillStyle = "#BC5429";
  ctx.beginPath();
  ctx.arc(238, 76, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#BC5429";
  ctx.textAlign = "center";
  // Shrink the numeral to fit long values.
  let numeralSize = 220;
  ctx.font = `bold ${numeralSize}px ${serif}`;
  while (ctx.measureText(numeral).width > size - 160 && numeralSize > 60) {
    numeralSize -= 10;
    ctx.font = `bold ${numeralSize}px ${serif}`;
  }
  ctx.fillText(numeral, size / 2, 420);

  // Word-wrap the Yorùbá phrase.
  ctx.fillStyle = "#FFF7EE";
  let phraseSize = yoruba.length <= 16 ? 110 : yoruba.length <= 40 ? 80 : 58;
  ctx.font = `bold ${phraseSize}px ${serif}`;
  const words = yoruba.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > size - 160 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const lineHeight = phraseSize * 1.25;
  const startY = 620;
  lines.slice(0, 5).forEach((l, i) => {
    ctx.fillText(l, size / 2, startY + i * lineHeight);
  });

  ctx.fillStyle = "rgba(255, 247, 238, 0.6)";
  ctx.font = `40px ${serif}`;
  ctx.fillText("Ònkà Yorùbá — the Yorùbá number calculator", size / 2, size - 70);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kaa-${numeral.replace(/[^\d.-]/g, "") || "number"}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
