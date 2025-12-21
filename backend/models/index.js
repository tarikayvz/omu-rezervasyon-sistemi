'use strict';

const Sequelize = require('sequelize');
const process = require('process');
// Ortam değişkenini al (production veya development)
const env = process.env.NODE_ENV || 'development';
// Config dosyasını yükle
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;

// --- DÜZELTİLEN KISIM ---
// Eğer Render'daysak (DATABASE_URL varsa) direkt onu kullan
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} 
// Değilse Config dosyasından oku (Yerel çalışma)
else if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
// ------------------------

// Modelleri Elle Tanımlıyoruz (Daha önce yapmıştık)
const modelDefiners = [
    require('./event'),
    require('./comment'),
    require('./announcement')
];

for (const modelDefiner of modelDefiners) {
    const model = modelDefiner(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;