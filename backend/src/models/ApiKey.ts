import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class ApiKey extends Model {
  public id!: number;
  public userId!: number;
  public key!: string;
  public name!: string;
  public isRevoked!: boolean;
}

ApiKey.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    isRevoked: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, tableName: 'api_keys' }
);
