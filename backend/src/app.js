require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product.routes');
const deliveryRoutes = require('./routes/delivery.routes');

const { errorHandler } = require('./middlewares/error.middleware');
const { notFound } = require('./middlewares/notFound.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/deliveries', deliveryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;
