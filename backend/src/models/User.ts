import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

export class User extends Model {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare firstName: string;
  declare lastName: string;
  declare role: 'Admin' | 'Manager' | 'User';
  declare status: 'active' | 'inactive' | 'banned';
  declare isVerified: boolean;
  declare verificationToken: string | null;
  declare lastLogin: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    lastName: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    role: { type: DataTypes.ENUM('Admin', 'Manager', 'User'), defaultValue: 'User' },
    status: { type: DataTypes.ENUM('active', 'inactive', 'banned'), defaultValue: 'active' },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationToken: { type: DataTypes.STRING, allowNull: true },
    lastLogin: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.passwordHash && !user.passwordHash.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('passwordHash') && user.passwordHash && !user.passwordHash.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
    },
  }
);
