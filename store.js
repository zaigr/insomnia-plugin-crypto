const enableDecryptionKey = 'enableDecryption';

const enableResponseDecryption = async (store, itemId, enable) => {
  const key = `${enableDecryptionKey}:${itemId}`;
  await store.setItem(key, enable);
};

const isResponseDecryptionEnabled = async (store, itemId) => {
  const key = `${enableDecryptionKey}:${itemId}`;
  const storeValue = await store.getItem(key);

  return storeValue === 'true' ? true : false;
};

module.exports = {
  enableResponseDecryption,
  isResponseDecryptionEnabled,
};
