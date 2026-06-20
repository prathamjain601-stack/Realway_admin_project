import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class AuditLog extends Model {
  public id!: number;
  public userId!: number;
  public action!: string;
  public resource!: string;
  public details!: any;
}

AuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    resource: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.JSONB, allowNull: true },
  },
  { sequelize, tableName: 'audit_logs' }
);
