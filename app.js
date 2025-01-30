const {
  enableResponseDecryption,
  isResponseDecryptionEnabled,
  enableRequestEncryption,
  isRequestEncryptionEnabled
} = require('./store');

const {
  encrypt,
  decrypt,
} = require('./encrypt');

module.exports.responseHooks = [
  async (context) => {
    const enabled = await isResponseDecryptionEnabled(context.store, context.request.getId());
    if (enabled) {
      const algorithm = context.request.getEnvironmentVariable('crypto-alg');
      const key = context.request.getEnvironmentVariable('crypto-key');

      if (!algorithm || !key) {
        console.error('Decryption failed: Missing algorithm or key in environment');
        return;
      }

      try {
        const decryptedBody = decrypt(context.response.getBody(), algorithm, key);
        context.response.setBody(decryptedBody);
      } catch (error) {
        console.error('Decryption failed:', error.message);
        context.response.setBody(`Decryption failed: ${error.message}`);
      }
    }
  }
];

module.exports.requestHooks = [
  async (context) => {
    const enabled = await isRequestEncryptionEnabled(context.store, context.request.getId());
    if (enabled) {
      const algorithm = context.request.getEnvironmentVariable('crypto-alg');
      const key = context.request.getEnvironmentVariable('crypto-key');

      if (!algorithm || !key) {
        console.error('Encryption failed: Missing algorithm or key in environment');
        return;
      }

      try {
        const encryptedBody = encrypt(context.request.getBody().text, algorithm, key);
        context.request.setBodyText(encryptedBody);
      } catch (error) {
        console.error('Encryption failed:', error.message);
        throw error;
      }
    }
  }
];

module.exports.requestActions = [
  {
    label: 'Toggle Response Decryption',
    action: async (context, data) => {
      const { store } = context;
      const { request } = data;

      const currentState = await isResponseDecryptionEnabled(store, request._id);

      const newState = !currentState;
      await enableResponseDecryption(store, request._id, newState);

      context.app.alert('Crypto', `Response decryption ${newState ? 'enabled' : 'disabled'} for this request`);
    }
  },
  {
    label: 'Toggle Request Encryption',
    action: async (context, data) => {
      const { store } = context;
      const { request } = data;

      const currentState = await isRequestEncryptionEnabled(store, request._id);

      const newState = !currentState;
      await enableRequestEncryption(store, request._id, newState);

      context.app.alert('Crypto', `Request encryption ${newState ? 'enabled' : 'disabled'} for this request`);
    }
  }
];
