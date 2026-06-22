import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Notification extends Model {
  declare id: number;
  declare userId: number;
  declare title: string;
  declare message: string;
  declare type: 'info' | 'warning' | 'success' | 'error';
  declare isRead: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.ENUM('info', 'warning', 'success', 'error'), defaultValue: 'info' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, tableName: 'notifications' }
);
