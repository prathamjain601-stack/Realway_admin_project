import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Category extends Model {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare description: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: true, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: 'categories',
    hooks: {
      beforeCreate: (cat: Category) => {
        if (!cat.slug && cat.name) {
          cat.slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
      },
    },
  }
);
