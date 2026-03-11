"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var analytics_routes_1 = require("./routes/analytics.routes");
var report_routes_1 = require("./routes/report.routes");
var device_routes_1 = require("./routes/device.routes");
var devices_routes_1 = require("./routes/devices.routes");
var ota_routes_1 = require("./routes/ota.routes");
var dongle_routes_1 = require("./routes/dongle.routes");
var smartmeterroutes_1 = require("./routes/smartmeterroutes");
var iot_routes_1 = require("./routes/iot.routes");
var app = express();
// Middleware
app.use(express.json());
app.use(cors());
// Routes
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/device', device_routes_1.default); // Device control endpoints
app.use('/api/devices', devices_routes_1.default); // Device CRUD endpoints
app.use('/api/ota', ota_routes_1.default);
app.use('/api/dongle', dongle_routes_1.default);
app.use('/api/smartmeter', smartmeterroutes_1.default);
app.use('/api/iot', iot_routes_1.default);
// Health check endpoint
app.get('/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 handler
app.use(function (req, res) {
    res.status(404).json({ error: 'Route not found' });
});
// Error handler
app.use(function (err, req, res, next) {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
exports.default = app;
