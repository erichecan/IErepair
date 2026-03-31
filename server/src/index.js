import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Webhook route needs raw body for Stripe signature verification
// Mount BEFORE the JSON body parser
// ---------------------------------------------------------------------------
import webhookRoutes from './routes/webhooks.js';
app.use('/api/v1/webhooks', webhookRoutes);

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Route groups
// ---------------------------------------------------------------------------

// Client routes
import clientAuthRoutes from './routes/client/auth.routes.js';
import clientBrowseRoutes from './routes/client/browse.routes.js';
import clientShopRoutes from './routes/client/shop.routes.js';
import clientBookingRoutes from './routes/client/booking.routes.js';
import clientWarrantyRoutes from './routes/client/warranty.routes.js';

app.use('/api/v1/client/auth', clientAuthRoutes);
app.use('/api/v1/client/browse', clientBrowseRoutes);
app.use('/api/v1/client/shop', clientShopRoutes);
app.use('/api/v1/client/booking', clientBookingRoutes);
app.use('/api/v1/client/warranty', clientWarrantyRoutes);

// Merchant routes
import merchantAuthRoutes from './routes/merchant/auth.routes.js';
import merchantDashboardRoutes from './routes/merchant/dashboard.routes.js';
import merchantCatalogRoutes from './routes/merchant/catalog.routes.js';
import merchantBookingRoutes from './routes/merchant/booking.routes.js';
import merchantWarrantyRoutes from './routes/merchant/warranty.routes.js';
import merchantSettingsRoutes from './routes/merchant/settings.routes.js';

app.use('/api/v1/merchant/auth', merchantAuthRoutes);
app.use('/api/v1/merchant/dashboard', merchantDashboardRoutes);
app.use('/api/v1/merchant/catalog', merchantCatalogRoutes);
app.use('/api/v1/merchant/booking', merchantBookingRoutes);
app.use('/api/v1/merchant/warranty', merchantWarrantyRoutes);
app.use('/api/v1/merchant/settings', merchantSettingsRoutes);

// HQ routes
import hqAuthRoutes from './routes/hq/auth.routes.js';
import hqCatalogRoutes from './routes/hq/catalog.routes.js';
import hqMerchantRoutes from './routes/hq/merchant.routes.js';
import hqCommissionRoutes from './routes/hq/commission.routes.js';
import hqFinanceRoutes from './routes/hq/finance.routes.js';

app.use('/api/v1/hq/auth', hqAuthRoutes);
app.use('/api/v1/hq/catalog', hqCatalogRoutes);
app.use('/api/v1/hq/merchant', hqMerchantRoutes);
app.use('/api/v1/hq/commission', hqCommissionRoutes);
app.use('/api/v1/hq/finance', hqFinanceRoutes);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export default app;
