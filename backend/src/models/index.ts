import sequelize from '../config/database';
import { User } from './User';
import { Post } from './Post';
import { Category } from './Category';
import { AuditLog } from './AuditLog';
import { SystemMetric } from './SystemMetric';
import { Notification } from './Notification';
import { Session } from './Session';
import { ApiKey } from './ApiKey';

// Define relationships
User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { foreignKey: 'authorId' });

Category.hasMany(Post, { foreignKey: 'categoryId' });
Post.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ApiKey, { foreignKey: 'userId' });
ApiKey.belongsTo(User, { foreignKey: 'userId' });

export {
  sequelize,
  User,
  Post,
  Category,
  AuditLog,
  SystemMetric,
  Notification,
  Session,
  ApiKey
};
