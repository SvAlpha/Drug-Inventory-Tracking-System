
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// ============= SECURITY MIDDLEWARE =============
app.use(helmet()); // Set security HTTP headers

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ============= STANDARD MIDDLEWARE =============
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression()); // gzip compression
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined')); // logging

// ============= SWAGGER DOCUMENTATION =============
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drug Inventory & Supply Chain API',
      version: '1.0.0',
      description: 'API for managing pharmaceutical drug inventory and supply chain tracking'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============= ROUTES =============
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/stock',         require('./routes/stockRoutes'));
app.use('/api/consume',       require('./routes/consumeRoutes'));
app.use('/api/orders',        require('./routes/orderRoutes'));
app.use('/api/shipment',      require('./routes/shipmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/audit',         require('./routes/auditRoutes'));

// ============= HEALTH CHECK =============
app.get('/', (req, res) => {
  res.json({
    message: 'Drug Inventory API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============= 404 HANDLER =============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============= ERROR HANDLER (MUST BE LAST) =============
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});