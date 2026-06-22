const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const Tesseract = require('tesseract.js');

async function test(filename) {
  const image = await loadImage(filename);
  const canvas = createCanvas(image.width * 2, image.height * 2);
  const ctx = canvas.getContext('2d');
  
  // Disable smoothing for crisp edges when scaling
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  // Grayscale and threshold
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i+1];
    const b = d[i+2];
    const v = (0.2126*r + 0.7152*g + 0.0722*b >= 128) ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = v;
  }
  ctx.putImageData(imgData, 0, 0);

  const buffer = canvas.toBuffer('image/png');
  const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
  console.log('--- OCR for ' + filename + ' ---');
  console.log(text.substring(0, 300));
}

test('./1000170214.jpg');
test('./1000170326.jpg');
