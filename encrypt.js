const crypto = require('crypto');
const { Buffer } = require('buffer');

const SUPPORTED_ALGORITHMS = ['aes-256-cbc', 'aes-192-cbc', 'aes-128-cbc'];

const validateAlgorithmAndKey = (algorithm, key) => {
  if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
    throw new Error(`Unsupported algorithm: ${algorithm}. Supported algorithms are: ${SUPPORTED_ALGORITHMS.join(', ')}`);
  }

  const keyBytes = Buffer.from(key, 'hex');
  const requiredKeyLength = parseInt(algorithm.split('-')[1], 10) / 8;

  if (keyBytes.length !== requiredKeyLength) {
    throw new Error(`Invalid key length for ${algorithm}. Expected ${requiredKeyLength} bytes, got ${keyBytes.length} bytes.`);
  }
};

const decryptResponse = (response, algorithm, key) => {
  try {
    validateAlgorithmAndKey(algorithm, key);

    const keyBuffer = Buffer.from(key, 'hex');
    const iv = response.slice(0, 16);
    const encryptedData = response.slice(16);

    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw error;
  }
};

module.exports = {
  decryptResponse
};
