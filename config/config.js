let isSSLEnabled = false;

if (process.env.NODE_ENV === 'production') {
  isSSLEnabled = true;
}

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: isSSLEnabled,
    },
  },
  test: {
    dialect: 'sqlite',
    storage: 'test/test.db',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: isSSLEnabled,
    },
  },
};
