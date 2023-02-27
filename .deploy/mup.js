module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      "host": "vps224885.ovh.net",
      "username": "root",
      // "pem": "~/.ssh/id_edr25519",
      // pem: './path/to/pem'
      // password: 'server-password'
      // or neither for authenticate from ssh-agent
    }
  },

  app: {
    // TODO: change app name and path
    name: 'webdo',
    path: '../',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: true,
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      ROOT_URL: 'https://webdo.ploki.io/',
      MONGO_URL: 'mongodb://mongodb/webdo',
      MONGO_OPLOG_URL: 'mongodb://mongodb/local',
    },

    docker: {
      image: 'zodern/meteor:root',
      // bind: '127.0.0.1',
    },

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  mongo: {
    // version: '6.0.4',
    version: '5.0.14',
    // version: '4.4.12',
    // version: '4.2.23',
    // version: '4.0.28',
    // version: '3.6.23',
    // version: '3.4.24',
    servers: {
      one: {}
    }
  },

  // (Optional)
  // Use the proxy to setup ssl or to route requests to the correct
  // app when there are several apps

  // proxy: {
  //   domains: 'mywebsite.com,www.mywebsite.com',

  //   ssl: {
  //     // Enable Let's Encrypt
  //     letsEncryptEmail: 'email@domain.com'
  //   }
  // }
};
