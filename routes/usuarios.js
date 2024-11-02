// routes/usuarios.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const usuario = await Usuario.create({
      email,
      password: passwordHash,
      nombre
    });

    res.status(201).json({ 
      message: "Usuario creado exitosamente",
      userId: usuario.id 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { userId: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;