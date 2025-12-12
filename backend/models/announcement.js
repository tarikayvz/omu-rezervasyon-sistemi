'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Announcement extends Model {
    static associate(models) {
      // İlişkiler buraya (şu an gerek yok)
    }
  }
  Announcement.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING, // Resmin dosya yolu burada tutulacak
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Announcement',
  });
  return Announcement;
};