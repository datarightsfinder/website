'use strict';

let fs = require('fs');
let path = require('path');
let Sequelize = require('sequelize');
let basename = path.basename(__filename);
let env = process.env.NODE_ENV || 'development';
let config = require(__dirname + '/../config/config.js')[env];
let db = {};
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  if (process.env.NODE_ENV === 'test') {
    sequelize = new Sequelize(config.url, {
      dialect: config.dialect,
      dialectOptions: config.dialectOptions,
      logging: false,
    });
  } else {
    sequelize = new Sequelize(config.url, {
      dialect: config.dialect,
      dialectOptions: config.dialectOptions,
    });
  }
}

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename)
      && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
