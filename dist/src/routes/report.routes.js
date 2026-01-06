"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdfkit_1 = __importDefault(require("pdfkit"));
const router = (0, express_1.Router)();
router.get('/device/:id/pdf', (req, res) => {
    const doc = new pdfkit_1.default();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('CCMS Device Report');
    doc.text(`Device ID: ${req.params.id}`);
    doc.end();
});
exports.default = router;
