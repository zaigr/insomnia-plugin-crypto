const crypto = require('crypto');
const { Buffer } = require('buffer');

const SUPPORTED_ALGORITHMS = ['aes-256-cbc', 'aes-192-cbc', 'aes-128-cbc'];

const validateAlgorithmAndKey = (algorithm, key) => {
  if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
    throw new Error(`Unsupported algorithm: ${algorithm}. Supported algorithms are: ${SUPPORTED_ALGORITHMS.join(', ')}`);
  }

  const keyBytes = Buffer.from(key, 'utf8');
  const requiredKeyLength = parseInt(algorithm.split('-')[1], 10) / 8;

  if (keyBytes.length !== requiredKeyLength) {
    throw new Error(`Invalid key length for ${algorithm}. Expected ${requiredKeyLength} bytes, got ${keyBytes.length} bytes.`);
  }
};

const decrypt = (response, algorithm, key) => {
  try {
    validateAlgorithmAndKey(algorithm, key);

    // TODO: make base64 optional
    const base64String = response.toString('utf-8');
    const encryptedBuffer  = Buffer.from(base64String, 'base64');

    // TODO: make iv as optional param
    const iv = encryptedBuffer.slice(0, 16);
    const encryptedData = encryptedBuffer.slice(16);

    const keyBuffer = Buffer.from(key, 'utf8');
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);

    let decrypted = decipher.update(encryptedData, 'binary', 'utf8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw error;
  }
};

module.exports = {
  decrypt
};
