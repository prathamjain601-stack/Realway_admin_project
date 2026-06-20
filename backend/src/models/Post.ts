import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Post extends Model {
  public id!: number;
  public title!: string;
  public content!: string;
  public isFeatured!: boolean;
  public publishedAt!: Date;
  public authorId!: number;
  public categoryId!: number;
}

Post.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, tableName: 'posts' }
);
