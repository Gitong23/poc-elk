const express = require('express');
const winston = require('winston');
const TCP = require('winston-tcp');
const app = express();
const port = 3000;

// Configure Winston logger for JSON output with debugging
const tcpTransport = new TCP({
  host: 'localhost',
  port: 5000,
  reconnectInterval: 1000,
  bufferLength: 10000
});

// Add connection debugging
tcpTransport.on('connect', () => {
  console.log('✅ Connected to Logstash TCP on localhost:5000');
});

tcpTransport.on('error', (err) => {
  console.error('❌ TCP transport error:', err.message);
});

tcpTransport.on('disconnect', () => {
  console.log('⚠️  Disconnected from Logstash TCP');
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    tcpTransport
  ]
});

// Middleware to parse JSON bodies
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  logger.info({
    service: 'express-app',
    level: 'info',
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    message: `${req.method} ${req.url}`,
    logType: 'request'
  });
  next();
});

// Sample routes
app.get('/', (req, res) => {
  logger.info({
    service: 'express-app',
    level: 'info',
    route: '/',
    action: 'home_page_accessed',
    message: 'Home page accessed',
    logType: 'route'
  });
  res.json({ message: 'Welcome to Express Logger App', timestamp: new Date().toISOString() });
});

app.get('/api/users', (req, res) => {
  logger.info({
    service: 'express-app',
    level: 'info',
    route: '/api/users',
    action: 'fetch_users',
    message: 'Fetching users list',
    logType: 'api'
  });
  res.json({ users: ['John', 'Jane', 'Bob'], timestamp: new Date().toISOString() });
});

app.post('/api/users', (req, res) => {
  const { name } = req.body;
  logger.info({
    service: 'express-app',
    level: 'info',
    route: '/api/users',
    action: 'create_user',
    userData: { name },
    message: `Creating new user: ${name}`,
    logType: 'api'
  });
  res.json({ success: true, user: { name, id: Math.random() }, timestamp: new Date().toISOString() });
});

app.get('/api/error', (req, res) => {
  logger.error({
    service: 'express-app',
    level: 'error',
    route: '/api/error',
    action: 'simulate_error',
    message: 'Simulated error occurred',
    logType: 'error'
  });
  res.status(500).json({ error: 'This is a simulated error', timestamp: new Date().toISOString() });
});

// Generate periodic logs - FIXED to align with Logstash config
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  logger.info({
    service: 'express-app',
    level: 'info',
    type: 'periodic',
    message: 'Periodic health check log',
    logType: 'health',
    uptime: uptime,
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers
    },
    // Additional fields that will be processed by Logstash
    hostname: require('os').hostname(),
    processId: process.pid,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
}, 2000); // Every 2 seconds for testing

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    service: 'express-app',
    level: 'error',
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    message: 'Unhandled error occurred',
    logType: 'error'
  });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info({
    service: 'express-app',
    level: 'info',
    action: 'server_start',
    port: port,
    message: `Express app listening on port ${port}`,
    logType: 'system'
  });
});

module.exports = app;