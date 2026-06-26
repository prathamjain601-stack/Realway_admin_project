import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class PostVersion extends Model {
  declare id: number;
  declare postId: number;
  declare version: number;
  declare title: string;
  declare content: string;
  declare status: string;
  declare editedById: number;
  declare changeNote: string | null;
  declare readonly createdAt: Date;
}

PostVersion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    editedById: { type: DataTypes.INTEGER, allowNull: false },
    changeNote: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: 'post_versions',
    updatedAt: false,
  }
);
