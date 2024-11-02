// indicar que quiero usar sequelize
const { Sequelize } = require("sequelize");

// Propiedades 
const database = process.env.MYSQL_DATABASE;
const username = process.env.MYSQL_USER; //  esta variable está definida en mi .env
const password = process.env.MYSQL_PASSWORD; //  esta variable está definida en mi .env
const host = process.env.MYSQL_HOST; // esta variable está definida en mi .env

const sequelize = new Sequelize(
    database,
    username, // Cambié  a 'username'
    password,
    {
        host,
        dialect: "mysql"
    }
);

const dbConnectMysql = async () => {
    try {
        await sequelize.authenticate();
        console.log('MYSQL conexión correcta');
    } catch (e) {
        console.log('MYSQL error de conexión', e);
    }
};

module.exports = { sequelize, dbConnectMysql };
