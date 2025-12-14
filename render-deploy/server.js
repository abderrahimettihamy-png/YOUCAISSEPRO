const express = require('express');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

// Log de l'environnement pour debug
console.log('=== Configuration Render ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL définie:', !!process.env.DATABASE_URL);

const { initDatabase } = require('./backend/dist/config/database');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialiser la base de données
initDatabase()
  .then(() => {
    console.log('✓ Base de données initialisée avec succès');
  })
  .catch((err) => {
    console.error('❌ Erreur initialisation base de données:', err);
  });

// API Routes (utiliser les fichiers compilés dans dist/)
const authRouter = require('./backend/dist/routes/auth').default;
const usersRouter = require('./backend/dist/routes/users').default;
const ordersRouter = require('./backend/dist/routes/orders').default;
const categoriesRouter = require('./backend/dist/routes/categories').default;
const productsRouter = require('./backend/dist/routes/products').default;

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);

// Servir le frontend
const frontendPath = path.join(__dirname, 'frontend');
console.log('Frontend path:', frontendPath);

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ YOU CAISSE PRO démarré sur le port ${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api`);
  console.log(`✓ Frontend: http://localhost:${PORT}`);
});
