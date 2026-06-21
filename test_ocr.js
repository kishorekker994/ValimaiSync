import Tesseract from 'tesseract.js';

Tesseract.recognize(
  './1000170214.jpg',
  'eng',
  { logger: m => console.log(m) }
).then(({ data: { text } }) => {
  console.log("EXTRACTED TEXT:\n", text);
});
