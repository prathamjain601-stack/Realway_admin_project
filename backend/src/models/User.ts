import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class User extends Model {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare role: 'Admin' | 'Manager' | 'User';
  declare isVerified: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Manager', 'User'), defaultValue: 'User' },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, tableName: 'users' }
);
