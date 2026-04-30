import { readFileSync } from 'fs';
import { DataSource } from 'typeorm';

const envText = readFileSync('.env', 'utf8');
for (const rawLine of envText.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith('#')) {
    continue;
  }

  const separatorIndex = line.indexOf('=');
  if (separatorIndex === -1) {
    continue;
  }

  const key = line.slice(0, separatorIndex).trim();
  const value = line.slice(separatorIndex + 1).trim();
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

export default new DataSource({
  type: (process.env.DB_TYPE as 'postgres') ?? 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
