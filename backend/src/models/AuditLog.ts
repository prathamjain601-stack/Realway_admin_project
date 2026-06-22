import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class AuditLog extends Model {
  declare id: number;
  declare userId: number | null;
  declare action: string;
  declare entityType: string;
  declare entityId: number | null;
  declare changes: any;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare readonly createdAt: Date;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    entityType: { type: DataTypes.STRING, allowNull: false },
    entityId: { type: DataTypes.INTEGER, allowNull: true },
    changes: { type: DataTypes.JSONB, allowNull: true },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
    userAgent: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'audit_logs', updatedAt: false }
);
