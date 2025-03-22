const {
  setFeature,
  isFeatureEnabled,
  enableRequestEncryption,
  enableResponseDecryption
} = require('./store');

const {
  encrypt,
  decrypt,
} = require('./encrypt');

const ALGORITHM_ENV = 'crypto-alg';
const KEY_ENV = 'crypto-key';

const alertOnMissingEnvConfig = (title, context) => {
  console.error(`${title}: Missing algorithm or key in environment`);
  context.app.alert(title, 'Missing algorithm or key in environment variables. '
    + `Please set the following environment variables: '${ALGORITHM_ENV}' '${KEY_ENV}'`);
};

module.exports.responseHooks = [
  async (context) => {
    const enabled = await isFeatureEnabled(context.store, context.request.getId(), enableResponseDecryption);
    if (enabled) {
      const algorithm = context.request.getEnvironmentVariable(ALGORITHM_ENV);
      const key = context.request.getEnvironmentVariable(KEY_ENV);

      if (!algorithm || !key) {
        alertOnMissingEnvConfig('Response Decryption Failed', context);
        return;
      }

      try {
        const body = await context.response.getBody();
        const decryptedBody = decrypt(body, algorithm, key);
        context.response.setBody(decryptedBody);
      } catch (error) {
        context.app.alert('Decryption failed:', error.message);
      }
    }
  }
];

module.exports.requestHooks = [
  async (context) => {
    const enabled = await isFeatureEnabled(context.store, context.request.getId(), enableRequestEncryption);
    if (enabled) {
      const algorithm = context.request.getEnvironmentVariable(ALGORITHM_ENV);
      const key = context.request.getEnvironmentVariable(KEY_ENV);

      if (!algorithm || !key) {
        alertOnMissingEnvConfig('Request Encryption Failed', context);
        return;
      }

      try {
        const encryptedBody = encrypt(context.request.getBody().text, algorithm, key);
        context.request.setBodyText(encryptedBody);
      } catch (error) {
        context.app.alert('Encryption failed:', error.message);
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

      const currentState = await setFeature(store, request._id);

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
