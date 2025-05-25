import dbConfig from '@config/db.config.js';
import { Sequelize } from 'sequelize';
import User from '@models/User.js';
import Simulacao from '@models/Simulacao.js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectModule: pg,
        dialectOptions: process.env.DATABASE_URL.includes('neon.tech') ? { // Habilita SSL apenas para Neon
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}, // conexões locais
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle,
            evict: dbConfig.pool.evict
        },
        logging: console.log // Habilita logs para depuração
    })
    : new Sequelize(
        dbConfig.database,
        dbConfig.user,
        dbConfig.password,
        {
            host: dbConfig.host,
            dialect: dbConfig.dialect,
            port: dbConfig.port,
            dialectModule: pg,
            pool: {
                max: dbConfig.pool.max,
                min: dbConfig.pool.min,
                acquire: dbConfig.pool.acquire,
                idle: dbConfig.pool.idle,
                evict: dbConfig.pool.evict
            },
            logging: console.log
        }
    );

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = User(sequelize, Sequelize);
db.simulacao = Simulacao(sequelize, Sequelize);

db.users.hasMany(db.simulacao, { foreignKey: 'userId' });
db.simulacao.belongsTo(db.users, { foreignKey: 'userId' });

export default db;