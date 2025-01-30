const enableDecryptionKey = 'enableDecryption';
const enableEncryptionKey = 'enableEncryption';

const enableResponseDecryption = async (store, itemId, enable) => {
  const key = `${enableDecryptionKey}:${itemId}`;
  await store.setItem(key, enable);
};

const isResponseDecryptionEnabled = async (store, itemId) => {
  const key = `${enableDecryptionKey}:${itemId}`;
  const storeValue = await store.getItem(key);

  return storeValue === 'true' ? true : false;
};

const enableRequestEncryption = async (store, itemId, enable) => {
  const key = `${enableEncryptionKey}:${itemId}`;
  await store.setItem(key, enable);
};

const isRequestEncryptionEnabled = async (store, itemId) => {
  const key = `${enableEncryptionKey}:${itemId}`;
  const storeValue = await store.getItem(key);

  return storeValue === 'true' ? true : false;
};

module.exports = {
  enableResponseDecryption,
  isResponseDecryptionEnabled,
  enableRequestEncryption,
  isRequestEncryptionEnabled,
};
