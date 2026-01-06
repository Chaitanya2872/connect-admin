"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_service_1 = require("../services/analytics.service");
const router = (0, express_1.Router)();
router.get('/energy/:deviceId', async (req, res) => {
    const data = await (0, analytics_service_1.getDailyEnergy)(req.params.deviceId);
    res.json(data);
});
exports.default = router;
