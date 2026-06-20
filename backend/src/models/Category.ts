import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Category extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'categories' }
);
