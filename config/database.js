import dotenv from "dotenv";
import sql from "mssql";

dotenv.config();

console.log("\n***** Database configuration: *****");
console.log("DB_HOST: ", process.env.DB_HOST);
console.log("DB_USER: ", process.env.DB_USER);
console.log("DB_PASSWORD: ", process.env.DB_PASSWORD);
console.log("DB_DATABASE: ", process.env.DB_DATABASE);
console.log("************************************");

const config = {
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 1433,
    options: {
        encrypt: true // Enable encryption for Azure SQL Database
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("Connected to MSSQL");
        return pool;
    })
    .catch(err => console.log("Database Connection Failed! Bad Config: ", err));

export { poolPromise, sql };
