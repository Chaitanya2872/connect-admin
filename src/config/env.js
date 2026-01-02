"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
var dotenv = require("dotenv");
dotenv.config();
exports.ENV = {
    PORT: process.env.PORT || 4000,
    DB: process.env.DATABASE_URL,
    IOT_ENDPOINT: process.env.AWS_IOT_ENDPOINT
};
