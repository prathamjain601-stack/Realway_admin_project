import sequelize from '../config/database';
import { User } from './User';
import { Post } from './Post';
import { Category } from './Category';
import { AuditLog } from './AuditLog';
import { SystemMetric } from './SystemMetric';
import { Notification } from './Notification';
import { Session } from './Session';
import { ApiKey } from './ApiKey';
import { SystemSetting } from './SystemSetting';
import { PostVersion } from './PostVersion';
import { ChatMessage } from './ChatMessage';
import { ErrorLog } from './ErrorLog';

// Define relationships
User.hasMany(Post, { foreignKey: 'authorId' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Category.hasMany(Post, { foreignKey: 'categoryId' });
Post.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ApiKey, { foreignKey: 'userId' });
ApiKey.belongsTo(User, { foreignKey: 'userId' });

// Post versioning relationships
Post.hasMany(PostVersion, { foreignKey: 'postId', as: 'versions' });
PostVersion.belongsTo(Post, { foreignKey: 'postId' });
PostVersion.belongsTo(User, { foreignKey: 'editedById', as: 'editor' });

// Chat relationships
User.hasMany(ChatMessage, { foreignKey: 'senderId' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

export {
  sequelize,
  User,
  Post,
  Category,
  AuditLog,
  SystemMetric,
  Notification,
  Session,
  ApiKey,
  SystemSetting,
  PostVersion,
  ChatMessage,
  ErrorLog,
};

