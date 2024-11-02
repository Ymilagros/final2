require("dotenv").config();
console.log('Iniciando el servidor...');
const express = require("express");
const cors = require("cors");
const path = require("path"); // Para gestionar rutas de archivos
const { dbConnectMysql } = require("./config/mysql");
const carritoRoutes = require('./routes/carrito');
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const port = process.env.PORT || 3000; // Usa el puerto del archivo .env o 3000 como valor predeterminado

// Middleware para habilitar CORS
app.use(cors());

app.use(express.json()); // Añadido para procesar JSON

app.use(express.urlencoded({ extended: true })); // Añadido para procesar datos de formularios


// Middleware para servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public'))); // Asegúrate de que los archivos estáticos estén en /public
app.use(express.static(path.join(__dirname, 'views'))); // Añadido para servir archivos de views

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Otras rutas para servir otros archivos HTML
app.get('/productos', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'productos.html'));
});

app.get('/nosotros', (req, res) => {
    console.log('Ruta /nosotros accedida'); // Verifica que esta ruta se accede
    res.sendFile(path.join(__dirname, 'views', 'nosotros.html'));
});

app.get('/contacto', (req, res) => {
    res.sendFile(__dirname + '/views/contacto.html');
});

app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'carrito.html'));
});

// Rutas de API
app.use('/api/carrito', carritoRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Middleware de manejo de errores 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});



 //Iniciar la conexión a la base de datos MySQL
dbConnectMysql(); // Llama directamente a la función de conexión a MySQL

const Product = require('./models/producto'); // Importa el modelo después de la conexión


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
