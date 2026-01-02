"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseClimate = exports.parseEnergy = void 0;
var parseEnergy = function (v) {
    var _a = v.split('/').map(Number), voltage = _a[0], current = _a[1], power = _a[2], unit = _a[3];
    return { voltage: voltage, current: current, power: power, unit: unit };
};
exports.parseEnergy = parseEnergy;
var parseClimate = function (v) {
    var _a = v.split('/').map(Number), temperature = _a[0], humidity = _a[1], sunlight = _a[2];
    return { temperature: temperature, humidity: humidity, sunlight: sunlight };
};
exports.parseClimate = parseClimate;
