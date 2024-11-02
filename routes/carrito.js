const express = require('express');
const router = express.Router();
const db = require('../config/mysql');

// Obtener el carrito con detalles de productos
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.cantidad, 
                   p.id AS producto_id, p.nombre, p.precio, 
                   (p.precio * c.cantidad) AS subtotal
            FROM carrito c
            JOIN productos p ON c.producto_id = p.id
        `;
        const [items] = await db.query(query);

        // Calcular total del carrito
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);

        res.status(200).json({ 
            items,
            total,
            cantidad_items: items.length
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error.message);
        res.status(500).json({ message: 'Error al obtener los productos del carrito' });
    }
});

// Agregar producto al carrito
router.post('/', async (req, res) => {
    const { producto_id, cantidad } = req.body;

    try {
        // Verificar si el producto existe y tiene stock suficiente
        const [producto] = await db.query('SELECT id, stock FROM productos WHERE id = ?', [producto_id]);

        if (!producto.length) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        if (producto[0].stock < cantidad) {
            return res.status(400).json({ message: 'Stock insuficiente' });
        }

        // Verificar si el producto ya está en el carrito
        const [existente] = await db.query('SELECT id FROM carrito WHERE producto_id = ?', [producto_id]);

        if (existente.length) {
            // Actualizar cantidad si ya existe
            await db.query('UPDATE carrito SET cantidad = cantidad + ? WHERE producto_id = ?', [cantidad, producto_id]);
        } else {
            // Insertar nuevo item si no existe
            await db.query('INSERT INTO carrito (producto_id, cantidad) VALUES (?, ?)', [producto_id, cantidad]);
        }

        // Actualizar stock del producto
        await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, producto_id]);

        res.status(200).json({ message: 'Producto agregado al carrito exitosamente', producto_id, cantidad });
    } catch (error) {
        console.error('Error al agregar al carrito:', error.message);
        res.status(500).json({ message: 'Error al agregar el producto al carrito' });
    }
});

// Actualizar cantidad de un producto en el carrito
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { cantidad } = req.body;

    if (cantidad < 1) {
        return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    try {
        // Obtener la cantidad actual para calcular la diferencia
        const [itemActual] = await db.query('SELECT cantidad, producto_id FROM carrito WHERE id = ?', [id]);

        if (!itemActual.length) {
            return res.status(404).json({ message: 'Item no encontrado en el carrito' });
        }

        const diferencia = cantidad - itemActual[0].cantidad;

        // Verificar stock suficiente si se aumenta la cantidad
        if (diferencia > 0) {
            const [producto] = await db.query('SELECT stock FROM productos WHERE id = ?', [itemActual[0].producto_id]);

            if (producto[0].stock < diferencia) {
                return res.status(400).json({ message: 'Stock insuficiente' });
            }
        }

        // Actualizar cantidad en carrito
        await db.query('UPDATE carrito SET cantidad = ? WHERE id = ?', [cantidad, id]);

        // Actualizar stock del producto
        if (diferencia !== 0) {
            await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [diferencia, itemActual[0].producto_id]);
        }

        res.status(200).json({ message: 'Cantidad actualizada exitosamente', id, cantidad });
    } catch (error) {
        console.error('Error al actualizar cantidad:', error.message);
        res.status(500).json({ message: 'Error al actualizar la cantidad' });
    }
});

// Eliminar producto del carrito
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [item] = await db.query('SELECT producto_id, cantidad FROM carrito WHERE id = ?', [id]);

        if (!item.length) {
            return res.status(404).json({ message: 'Item no encontrado en el carrito' });
        }

        // Eliminar del carrito
        await db.query('DELETE FROM carrito WHERE id = ?', [id]);

        // Devolver el stock al producto
        await db.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [item[0].cantidad, item[0].producto_id]);

        res.status(200).json({ message: 'Producto eliminado del carrito exitosamente', id });
    } catch (error) {
        console.error('Error al eliminar del carrito:', error.message);
        res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
    }
});

// Vaciar carrito
router.delete('/', async (req, res) => {
    try {
        // Obtener todos los items del carrito
        const [items] = await db.query('SELECT producto_id, cantidad FROM carrito');

        // Devolver stock a productos
        for (const item of items) {
            await db.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [item.cantidad, item.producto_id]);
        }

        // Vaciar carrito
        await db.query('DELETE FROM carrito');

        res.status(200).json({ message: 'Carrito vaciado exitosamente' });
    } catch (error) {
        console.error('Error al vaciar carrito:', error.message);
        res.status(500).json({ message: 'Error al vaciar el carrito' });
    }
});

module.exports = router;
