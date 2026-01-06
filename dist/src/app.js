"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const device_routes_1 = __importDefault(require("./routes/device.routes"));
const ota_routes_1 = __importDefault(require("./routes/ota.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/reports', report_routes_1.default);
app.use('/api/device', device_routes_1.default);
app.use('/api/ota', ota_routes_1.default);
exports.default = app;
