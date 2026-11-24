const palettes = {
  Nadia: { skin: '#b96e50', hair: '#211d27', shirt: '#d78652', accent: '#f4bd77' },
  Mira: { skin: '#d28b69', hair: '#27212a', shirt: '#557f79', accent: '#e9bd87' },
  Raka: { skin: '#b87556', hair: '#25232a', shirt: '#60768d', accent: '#e5b878' },
};

export function createPortrait(name, size = 96) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const colors = palettes[name] ?? palettes.Nadia;

  context.fillStyle = '#35444a';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#e6a278';
  context.beginPath();
  context.arc(size * 0.72, size * 0.22, size * 0.18, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#31484b';
  context.fillRect(0, size * 0.58, size, size * 0.42);
  context.fillStyle = colors.shirt;
  context.beginPath();
  context.moveTo(size * 0.12, size);
  context.lineTo(size * 0.24, size * 0.69);
  context.lineTo(size * 0.5, size * 0.62);
  context.lineTo(size * 0.79, size * 0.69);
  context.lineTo(size * 0.96, size);
  context.fill();
  context.fillStyle = colors.skin;
  context.beginPath();
  context.ellipse(size * 0.51, size * 0.43, size * 0.23, size * 0.29, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = colors.hair;
  context.beginPath();
  context.moveTo(size * 0.27, size * 0.46);
  context.quadraticCurveTo(size * 0.2, size * 0.1, size * 0.55, size * 0.13);
  context.quadraticCurveTo(size * 0.83, size * 0.15, size * 0.75, size * 0.5);
  context.lineTo(size * 0.68, size * 0.34);
  context.quadraticCurveTo(size * 0.46, size * 0.44, size * 0.27, size * 0.46);
  context.fill();
  context.fillStyle = '#282733';
  context.fillRect(size * 0.38, size * 0.43, size * 0.045, size * 0.025);
  context.fillRect(size * 0.59, size * 0.43, size * 0.045, size * 0.025);
  context.strokeStyle = colors.accent;
  context.lineWidth = Math.max(1, size * 0.018);
  context.beginPath();
  context.moveTo(size * 0.44, size * 0.55);
  context.quadraticCurveTo(size * 0.51, size * 0.59, size * 0.58, size * 0.55);
  context.stroke();
  return canvas;
}

export function drawPortrait(context, name, x, y, size = 96) {
  context.drawImage(createPortrait(name, size), x, y, size, size);
}
