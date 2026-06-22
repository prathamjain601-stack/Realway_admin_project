import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class SystemSetting extends Model {
  declare id: number;
  declare key: string;
  declare value: string;
  declare description: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

SystemSetting.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'system_settings' }
);
