'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env]; // config.js kullanıyoruz
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// --- DEĞİŞİKLİK BURADA: MODELLERİ ELLE ÇAĞIRIYORUZ ---
// Bu sayede "dosyayı bulamadım, okuyamadım" derdi bitiyor.
const modelDefiners = [
    require('./event'),       // event.js dosyanın adı
    require('./comment'),     // comment.js dosyanın adı
    require('./announcement') // announcement.js dosyanın adı
];

// Modelleri başlat
for (const modelDefiner of modelDefiners) {
    const model = modelDefiner(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
}

// İlişkileri kur (Associate)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// -----------------------------------------------------

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;