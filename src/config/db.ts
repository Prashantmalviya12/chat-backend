import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const nodeEnvironment = process.env.NODE_ENV;

export const squelizer = new Sequelize(
    
  dbName as string,
  dbUsername as string,
  dbPassword as string,
  {
    host: dbHost,
    port: Number(dbPort || 5432),
    dialect: "postgres",
    logging: nodeEnvironment === "development" ? console.log : false,
    define: {
      underscored: true,
      timestamps: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
);
