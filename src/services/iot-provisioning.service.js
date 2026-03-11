"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.provisionThingAndStoreCertificates = provisionThingAndStoreCertificates;
var client_iot_1 = require("@aws-sdk/client-iot");
var client_s3_1 = require("@aws-sdk/client-s3");
var env_1 = require("../config/env");
function getProvisioningConfig() {
    var config = env_1.ENV.AWS_PROVISIONING;
    var missing = [];
    if (!config.region) {
        missing.push('AWS_IOT_RG_ONE_REGION_NAME (or AWS_REGION)');
    }
    if (!config.accessKeyId) {
        missing.push('AWS_IOT_RG_ONE_ACCESS_KEY (or AWS_ACCESS_KEY_ID)');
    }
    if (!config.secretAccessKey) {
        missing.push('AWS_IOT_RG_ONE_SECRET_ACCESS_KEY (or AWS_SECRET_ACCESS_KEY)');
    }
    if (!config.certBucketName) {
        missing.push('AWS_IOT_RG_ONE_BUCKET_NAME');
    }
    if (missing.length > 0) {
        throw new Error("Missing provisioning environment variables: ".concat(missing.join(', ')));
    }
    return {
        region: config.region,
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        certBucketName: config.certBucketName,
        defaultPolicyName: config.defaultPolicyName
    };
}
function ensureThing(client, thingName, attributes) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, client.send(new client_iot_1.DescribeThingCommand({ thingName: thingName }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    error_1 = _a.sent();
                    if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.name) !== 'ResourceNotFoundException') {
                        throw error_1;
                    }
                    return [3 /*break*/, 3];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, client.send(new client_iot_1.CreateThingCommand(__assign({ thingName: thingName }, (attributes && Object.keys(attributes).length > 0
                            ? { attributePayload: { attributes: attributes } }
                            : {}))))];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    if ((error_2 === null || error_2 === void 0 ? void 0 : error_2.name) !== 'ResourceAlreadyExistsException') {
                        throw error_2;
                    }
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function normalizePrefix(prefix) {
    if (!prefix) {
        return '';
    }
    return prefix.replace(/^\/+|\/+$/g, '');
}
function provisionThingAndStoreCertificates(input) {
    return __awaiter(this, void 0, void 0, function () {
        var thingName, config, credentials, iot, s3, certificateResult, certificateArn, certificateId, certificatePem, privateKey, publicKey, policyName, basePrefix, baseKey, certificateKey, privateKeyKey, publicKeyKey, metadataKey;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    thingName = (_a = input.thingName) === null || _a === void 0 ? void 0 : _a.trim();
                    if (!thingName) {
                        throw new Error('thingName is required');
                    }
                    config = getProvisioningConfig();
                    credentials = {
                        accessKeyId: config.accessKeyId,
                        secretAccessKey: config.secretAccessKey
                    };
                    iot = new client_iot_1.IoTClient({
                        region: config.region,
                        credentials: credentials
                    });
                    s3 = new client_s3_1.S3Client({
                        region: config.region,
                        credentials: credentials
                    });
                    return [4 /*yield*/, ensureThing(iot, thingName, input.attributes)];
                case 1:
                    _e.sent();
                    return [4 /*yield*/, iot.send(new client_iot_1.CreateKeysAndCertificateCommand({
                            setAsActive: true
                        }))];
                case 2:
                    certificateResult = _e.sent();
                    certificateArn = certificateResult.certificateArn;
                    certificateId = certificateResult.certificateId;
                    certificatePem = certificateResult.certificatePem;
                    privateKey = (_b = certificateResult.keyPair) === null || _b === void 0 ? void 0 : _b.PrivateKey;
                    publicKey = (_c = certificateResult.keyPair) === null || _c === void 0 ? void 0 : _c.PublicKey;
                    if (!certificateArn || !certificateId || !certificatePem || !privateKey || !publicKey) {
                        throw new Error('AWS IoT did not return complete certificate material');
                    }
                    return [4 /*yield*/, iot.send(new client_iot_1.AttachThingPrincipalCommand({
                            thingName: thingName,
                            principal: certificateArn
                        }))];
                case 3:
                    _e.sent();
                    policyName = ((_d = input.policyName) === null || _d === void 0 ? void 0 : _d.trim()) || config.defaultPolicyName;
                    if (!policyName) return [3 /*break*/, 5];
                    return [4 /*yield*/, iot.send(new client_iot_1.AttachPolicyCommand({
                            policyName: policyName,
                            target: certificateArn
                        }))];
                case 4:
                    _e.sent();
                    _e.label = 5;
                case 5:
                    basePrefix = normalizePrefix(input.s3Prefix);
                    baseKey = [basePrefix, thingName, certificateId].filter(Boolean).join('/');
                    certificateKey = "".concat(baseKey, "/certificate.pem.crt");
                    privateKeyKey = "".concat(baseKey, "/private.pem.key");
                    publicKeyKey = "".concat(baseKey, "/public.pem.key");
                    metadataKey = "".concat(baseKey, "/metadata.json");
                    return [4 /*yield*/, Promise.all([
                            s3.send(new client_s3_1.PutObjectCommand({
                                Bucket: config.certBucketName,
                                Key: certificateKey,
                                Body: certificatePem,
                                ContentType: 'application/x-pem-file'
                            })),
                            s3.send(new client_s3_1.PutObjectCommand({
                                Bucket: config.certBucketName,
                                Key: privateKeyKey,
                                Body: privateKey,
                                ContentType: 'application/x-pem-file'
                            })),
                            s3.send(new client_s3_1.PutObjectCommand({
                                Bucket: config.certBucketName,
                                Key: publicKeyKey,
                                Body: publicKey,
                                ContentType: 'application/x-pem-file'
                            })),
                            s3.send(new client_s3_1.PutObjectCommand({
                                Bucket: config.certBucketName,
                                Key: metadataKey,
                                Body: JSON.stringify({
                                    thingName: thingName,
                                    certificateArn: certificateArn,
                                    certificateId: certificateId,
                                    policyName: policyName || null,
                                    generatedAt: new Date().toISOString()
                                }, null, 2),
                                ContentType: 'application/json'
                            }))
                        ])];
                case 6:
                    _e.sent();
                    return [2 /*return*/, {
                            thingName: thingName,
                            certificateId: certificateId,
                            certificateArn: certificateArn,
                            region: config.region,
                            bucket: config.certBucketName,
                            policyAttached: policyName || null,
                            s3Keys: {
                                certificate: certificateKey,
                                privateKey: privateKeyKey,
                                publicKey: publicKeyKey,
                                metadata: metadataKey
                            }
                        }];
            }
        });
    });
}
