const express = require('express');
const bodyParser = require('body-parser');
const { encrypt, decrypt, ALGORITHM, KEY } = require('./crypto-utils');

const app = express();
const port = 3000;

app.use(bodyParser.text({ type: '*/*' }));
app.use(bodyParser.json({ type: 'application/json' }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/api/plaintext', (req, res) => {
  const data = {
    message: 'This is a plaintext response',
    timestamp: new Date().toISOString()
  };
  res.json(data);
});

app.get('/api/encrypted', (req, res) => {
  const data = {
    message: 'This message is encrypted',
    timestamp: new Date().toISOString(),
    secret: 'top secret information'
  };

  const encryptedData = encrypt(JSON.stringify(data), true);

  res.setHeader('Content-Type', 'text/plain');
  res.send(encryptedData);
});

app.post('/api/decrypt', (req, res) => {
  try {
    const decryptedData = decrypt(req.body, true);

    let parsed;
    try {
      parsed = JSON.parse(decryptedData);
    } catch {
      parsed = { rawText: decryptedData };
    }

    res.json({
      success: true,
      decrypted: parsed,
      message: 'Successfully decrypted the request'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/encrypt', (req, res) => {
  try {
    let dataToEncrypt = req.body;

    if (typeof dataToEncrypt !== 'string') {
      dataToEncrypt = JSON.stringify(dataToEncrypt);
    }

    const encryptedData = encrypt(dataToEncrypt, true);

    res.setHeader('Content-Type', 'text/plain');
    res.send(encryptedData);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/echo-encrypted', (req, res) => {
  try {
    const decryptedData = decrypt(req.body, true);

    const processedData = JSON.stringify({
      original: decryptedData,
      processed: true,
      timestamp: new Date().toISOString()
    });

    const encryptedResponse = encrypt(processedData, true);

    res.setHeader('Content-Type', 'text/plain');
    res.send(encryptedResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Crypto Test API server running at http://localhost:${port}`);
  console.log(`Using algorithm: ${ALGORITHM}`);
  console.log(`Using key: ${KEY}`);

  console.log(`"crypto-alg": "${ALGORITHM}",`);
  console.log(`"crypto-key": "${KEY}"`);
});
