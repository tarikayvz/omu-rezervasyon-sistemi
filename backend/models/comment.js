'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // ÖNEMLİ: Yorum -> Etkinlik bağlantısı
      Comment.belongsTo(models.Event, { foreignKey: 'eventId', onDelete: 'CASCADE' });
    }
  }
  Comment.init({
    username: DataTypes.STRING,
    text: DataTypes.TEXT,
    rating: DataTypes.INTEGER,
    eventId: DataTypes.INTEGER,
    reply: DataTypes.TEXT // --- YENİ EKLENEN SÜTUN (Admin Cevabı) ---
  }, {
    sequelize,
    modelName: 'Comment', // İsmin 'Comment' olduğundan emin ol
  });
  return Comment;
};