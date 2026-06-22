import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class Post extends Model {
  declare id: number;
  declare title: string;
  declare slug: string;
  declare content: string;
  declare status: 'draft' | 'published' | 'archived';
  declare isFeatured: boolean;
  declare tags: string[];
  declare publishedAt: Date | null;
  declare authorId: number;
  declare categoryId: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Post.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: true, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    tags: { type: DataTypes.JSONB, defaultValue: [] },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    sequelize,
    tableName: 'posts',
    hooks: {
      beforeCreate: (post: Post) => {
        if (!post.slug && post.title) {
          post.slug = post.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
      beforeUpdate: (post: Post) => {
        if (post.changed('title') && post.title) {
          post.slug = post.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
    },
  }
);
