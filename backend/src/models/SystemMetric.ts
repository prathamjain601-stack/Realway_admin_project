import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export class SystemMetric extends Model {
  public id!: number;
  public metricName!: string;
  public metricValue!: number;
  public timestamp!: Date;
}

SystemMetric.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    metricName: { type: DataTypes.STRING, allowNull: false },
    metricValue: { type: DataTypes.FLOAT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'system_metrics', timestamps: false }
);
