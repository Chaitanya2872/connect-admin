"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var pdfkit_1 = require("pdfkit");
var router = (0, express_1.Router)();
router.get('/device/:id/pdf', function (req, res) {
    var doc = new pdfkit_1.default();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('CCMS Device Report');
    doc.text("Device ID: ".concat(req.params.id));
    doc.end();
});
exports.default = router;
