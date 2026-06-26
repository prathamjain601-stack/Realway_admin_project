import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class ChatMessage extends Model {
  declare id: number;
  declare senderId: number;
  declare message: string;
  declare readonly createdAt: Date;
}

ChatMessage.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: 'chat_messages',
    updatedAt: false,
  }
);
