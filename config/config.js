var isSSLEnabled = false;

if (process.env.NODE_ENV === "production") {
  isSSLEnabled = true;
}

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: isSSLEnabled
    }
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: isSSLEnabled
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: {
      ssl: isSSLEnabled
    }
  }
};
