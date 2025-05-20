import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    pool: {
        max: 2,
        min: 0,
        acquire: 3000,
        idle: 0,
        evict: 8000
    }
};

console.log("Database Config:", {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
});

export default dbConfig;