import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
type: 'postgres',
host: process.env.DB_HOST || 'localhost',
port: parseInt(process.env.DB_PORT || '5432'),
username: process.env.DB_USER || 'postgres',
password: process.env.DB_PASS || 'postgres',
database: process.env.DB_NAME || 'auth_db',
entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
synchronize: false,
});