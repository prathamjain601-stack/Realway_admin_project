import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class ErrorLog extends Model {
  declare id: number;
  declare level: 'error' | 'warn' | 'critical';
  declare message: string;
  declare stack: string | null;
  declare endpoint: string | null;
  declare method: string | null;
  declare statusCode: number | null;
  declare userId: number | null;
  declare readonly createdAt: Date;
}

ErrorLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    level: { type: DataTypes.ENUM('error', 'warn', 'critical'), defaultValue: 'error' },
    message: { type: DataTypes.TEXT, allowNull: false },
    stack: { type: DataTypes.TEXT, allowNull: true },
    endpoint: { type: DataTypes.STRING, allowNull: true },
    method: { type: DataTypes.STRING(10), allowNull: true },
    statusCode: { type: DataTypes.INTEGER, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: 'error_logs',
    updatedAt: false,
  }
);
