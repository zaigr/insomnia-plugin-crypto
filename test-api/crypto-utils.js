const crypto = require('crypto');
const { Buffer } = require('buffer');

const ALGORITHM = 'aes-256-cbc';
const KEY = '4314e401-3876-4e34-8fa6-9a3b88c2';

/**
 * Encrypts text with aes-256-cbc algorithm
 * @param {string} text - Plain text to encrypt
 * @param {boolean} useBase64 - Whether to return result as base64 string
 * @returns {string|Buffer} - Encrypted data
 */
function encrypt(text, useBase64 = true) {
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(KEY, 'utf8');
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(text, 'utf-8', 'binary');
  encrypted += cipher.final('binary');

  const result = Buffer.concat([iv, Buffer.from(encrypted, 'binary')]);

  return useBase64 ? result.toString('base64') : result;
}

/**
 * Decrypts data with aes-256-cbc algorithm
 * @param {Buffer|string} data - Encrypted data (with IV prepended)
 * @param {boolean} isBase64 - Whether input is base64 encoded
 * @returns {string} - Decrypted text
 */
function decrypt(data, isBase64 = true) {
  // Convert data to buffer if it's base64 string
  const dataBuffer = isBase64 ? Buffer.from(data, 'base64') : data;

  // Extract IV and encrypted data
  const iv = dataBuffer.slice(0, 16);
  const encryptedData = dataBuffer.slice(16);

  const keyBuffer = Buffer.from(KEY, 'utf8');
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);

  let decrypted = decipher.update(encryptedData, 'binary', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  ALGORITHM,
  KEY,
  encrypt,
  decrypt
};
