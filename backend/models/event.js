'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      // ÖNEMLİ: Etkinlik -> Yorumlar bağlantısı
      Event.hasMany(models.Comment, { foreignKey: 'eventId', onDelete: 'CASCADE' });
    }
  }
  Event.init({
    title: DataTypes.STRING,
    hall: DataTypes.STRING,
    description: DataTypes.TEXT,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    organizer: DataTypes.STRING,
    department: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    isApproved: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Event', // İsmin 'Event' olduğundan emin ol (Büyük harfle)
  });
  return Event;
};