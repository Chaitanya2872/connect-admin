"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors"); // Add BEFORE app.use(express.json())
var analytics_routes_1 = require("./routes/analytics.routes");
var report_routes_1 = require("./routes/report.routes");
var device_routes_1 = require("./routes/device.routes");
var ota_routes_1 = require("./routes/ota.routes");
var app = express();
app.use(express.json());
app.use(cors());
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/device', device_routes_1.default);
app.use('/api/ota', ota_routes_1.default);
exports.default = app;
