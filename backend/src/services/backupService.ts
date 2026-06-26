import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const BACKUP_DIR = path.resolve(__dirname, '../../backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const getDbConfig = () => ({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '5432',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin_password',
  database: process.env.DB_NAME || 'realway_db',
});

/**
 * Create a database backup using pg_dump.
 * Returns the filename of the created backup.
 */
export const createBackup = async (): Promise<{ filename: string; size: number }> => {
  const config = getDbConfig();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  const command = `docker exec -e PGPASSWORD=${config.password} realway_postgres pg_dump -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database} -F p > "${filepath}"`;

  try {
    await execAsync(command);

    const stats = fs.statSync(filepath);
    return { filename, size: stats.size };
  } catch (error: any) {
    throw new Error(`Backup failed: ${error.message}`);
  }
};

/**
 * Restore a database from a backup file.
 */
export const restoreBackup = async (filename: string): Promise<void> => {
  const config = getDbConfig();
  const filepath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found');
  }

  // Validate filename to prevent path traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename');
  }

  // Depending on platform, use the correct shell pipe syntax
  const command = process.platform === 'win32'
    ? `type "${filepath}" | docker exec -i -e PGPASSWORD=${config.password} realway_postgres psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database}`
    : `cat "${filepath}" | docker exec -i -e PGPASSWORD=${config.password} realway_postgres psql -h ${config.host} -p ${config.port} -U ${config.user} -d ${config.database}`;

  try {
    await execAsync(command);
  } catch (error: any) {
    throw new Error(`Restore failed: ${error.message}`);
  }
};

/**
 * List all available backup files.
 */
export const listBackups = (): { filename: string; size: number; createdAt: string }[] => {
  if (!fs.existsSync(BACKUP_DIR)) return [];

  const files = fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.sql'))
    .map((filename) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, filename));
      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return files;
};

/**
 * Delete a backup file.
 */
export const deleteBackupFile = (filename: string): void => {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename');
  }

  const filepath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found');
  }

  fs.unlinkSync(filepath);
};

/**
 * Get full path to a backup file for download.
 */
export const getBackupPath = (filename: string): string => {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename');
  }

  const filepath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error('Backup file not found');
  }

  return filepath;
};
