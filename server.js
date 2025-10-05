
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Adicione a sua chave de API aqui
const API_KEY = 'AIzaSyAclXKYZyVYCT1ilYjCzo6DNEibZCnjDHM';
const genAI = new GoogleGenerativeAI(API_KEY);

app.use(express.static(__dirname));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/solve', (req, res) => {
  const { expression } = req.body;
  try {
    const result = eval(expression);
    res.send({ result });
  } catch (error) {
    res.status(400).send({ error: 'Invalid expression' });
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No image uploaded.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const prompt = 'Solve the math problem in the image.';
    const image = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([prompt, image]);
    const response = await result.response;
    const text = response.text();
    res.send({ result: text });
  } catch (error) {
    console.error('Error with Google Generative AI API:', error);
    res.status(500).send({ error: 'Failed to process image.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
