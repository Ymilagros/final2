const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/mysql'); // Asegúrate de importar la conexión a la base de datos
const Producto = require('../models/producto'); // Asegúrate de importar el modelo Producto

// Ruta para obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.findAll(); // Usa findAll para obtener todos los productos
        res.status(200).json({ productos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// Ruta para obtener un producto por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findByPk(id); // Usa findByPk para buscar por ID
        
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.status(200).json({ producto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
});

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
    const { nombre, precio, stock = 0 } = req.body;
    try {
        // Validaciones
        if (!nombre || !precio) {
            return res.status(400).json({ message: 'El nombre y precio son obligatorios' });
        }

        const nuevoProducto = await Producto.create({ nombre, precio, stock }); // Usa el método create de Sequelize
        res.status(201).json({
            id: nuevoProducto.id,
            nombre,
            precio,
            stock,
            message: 'Producto creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
});

// Ruta para actualizar un producto por su ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;
    try {
        const producto = await Producto.findByPk(id); // Busca el producto

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Actualiza el producto
        await producto.update({ nombre, precio });
        
        res.status(200).json({ id, nombre, precio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
});

// Ruta para eliminar un producto por su ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findByPk(id); // Busca el producto

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await producto.destroy(); // Elimina el producto
        res.status(204).send(); // Respuesta sin contenido
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
});

module.exports = router;
