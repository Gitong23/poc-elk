const express = require('express');
const winston = require('winston');
const app = express();
const port = 3000;

// Configure Winston logger for JSON output
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Middleware to parse JSON bodies
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  logger.info({
    service: 'express-app',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    message: `${req.method} ${req.url}`
  });
  next();
});

// Sample routes
app.get('/', (req, res) => {
  logger.info({
    service: 'express-app',
    route: '/',
    action: 'home_page_accessed',
    message: 'Home page accessed'
  });
  res.json({ message: 'Welcome to Express Logger App', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
  logger.info({
    service: 'express-app',
    route: '/api/users',
    action: 'fetch_users',
    message: 'Fetching users list'
  });
  res.json({ users: ['John', 'Jane', 'Bob'], timestamp: new Date().toISOString() });
});

app.post('/api/users', (req, res) => {
  const { name } = req.body;
  logger.info({
    service: 'express-app',
    route: '/api/users',
    action: 'create_user',
    userData: { name },
    message: `Creating new user: ${name}`
  });
  res.json({ success: true, user: { name, id: Math.random() }, timestamp: new Date().toISOString() });
});

app.get('/api/error', (req, res) => {
  logger.error({
    service: 'express-app',
    route: '/api/error',
    action: 'simulate_error',
    message: 'Simulated error occurred'
  });
  res.status(500).json({ error: 'This is a simulated error', timestamp: new Date().toISOString() });
});

// Generate periodic logs (optional)
setInterval(() => {
  logger.info({
    service: 'express-app',
    type: 'periodic',
    message: 'Periodic health check log',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
}, 2000); // Every 2 seconds

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    service: 'express-app',
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    message: 'Unhandled error occurred'
  });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info({
    service: 'express-app',
    action: 'server_start',
    port: port,
    message: `Express app listening on port ${port}`
  });
});

module.exports = app;