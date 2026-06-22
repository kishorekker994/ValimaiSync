const fs = require('fs');
const Tesseract = require('tesseract.js');

async function test(filename) {
  const { data: { text } } = await Tesseract.recognize(filename, 'eng', {
    tessedit_char_whitelist: '0123456789 CalbpmsceActivityEveningMorningNightFreeWorkoutDurationHeartRateMETsNormalWarmupFatBurningAerobicAnaerobicExtreme%.:',
  });
  console.log('--- OCR for ' + filename + ' ---');
  console.log(text.substring(0, 300));
}

test('./1000170214.jpg');
