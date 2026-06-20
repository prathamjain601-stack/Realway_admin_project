import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Session extends Model {
  public id!: number;
  public userId!: number;
  public token!: string;
  public expiresAt!: Date;
  public ipAddress!: string;
}

Session.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false, unique: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'sessions' }
);
