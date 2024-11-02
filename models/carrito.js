const { sequelize } = require('../config/mysql'); 
const { DataTypes } = require('sequelize');
const Product = require('./Producto'); // Importa el modelo de Producto

// Define el modelo del Carrito
const Cart = sequelize.define('Carrito', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
});

// Relación entre Carrito y Producto
Cart.belongsToMany(Product, { through: 'CarritoProductos' }); // Crea una tabla intermedia para la relación
Product.belongsToMany(Cart, { through: 'CarritoProductos' });

module.exports = Cart;
