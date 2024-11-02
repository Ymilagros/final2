// models/Producto.js
const { sequelize } = require('../config/mysql'); 
const { DataTypes } = require('sequelize');

const Product = sequelize.define('Producto', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    precio: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = Product;
