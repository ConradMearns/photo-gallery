"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexImages = void 0;
var fs = require("fs");
var path = require("path");
var crypto_1 = require("crypto");
// recursively collect image files
function collectImageFiles(directory) {
    return __awaiter(this, void 0, void 0, function () {
        var files, items, _i, items_1, item, itemPath, stat, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    files = [];
                    items = fs.readdirSync(directory);
                    _i = 0, items_1 = items;
                    _b.label = 1;
                case 1:
                    if (!(_i < items_1.length)) return [3 /*break*/, 5];
                    item = items_1[_i];
                    itemPath = path.join(directory, item);
                    stat = fs.statSync(itemPath);
                    if (!stat.isDirectory()) return [3 /*break*/, 3];
                    _a = [__spreadArray([], files, true)];
                    return [4 /*yield*/, collectImageFiles(itemPath)];
                case 2:
                    // recursively collect image files in subdirectories
                    files = __spreadArray.apply(void 0, _a.concat([(_b.sent()), true]));
                    return [3 /*break*/, 4];
                case 3:
                    if (isImage(itemPath)) {
                        // add image file to list of files
                        files.push(itemPath);
                    }
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, files];
            }
        });
    });
}
// check if a file is an image file
function isImage(file) {
    var imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
    var ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
}
// calculate SHA256 hash of a file
function getFileHash(file) {
    return new Promise(function (resolve, reject) {
        var hash = crypto_1.default.createHash("sha256");
        var stream = fs.createReadStream(file);
        stream.on("error", reject);
        stream.on("data", function (chunk) { return hash.update(chunk); });
        stream.on("end", function () { return resolve(hash.digest("hex")); });
    });
}
function indexImages(directory) {
    return __awaiter(this, void 0, void 0, function () {
        var files, imageMetadata, metadataDict, _i, imageMetadata_1, _a, hash, rest;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, collectImageFiles(directory)];
                case 1:
                    files = _b.sent();
                    return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var hash, fileStat, createdAt;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, getFileHash(file)];
                                    case 1:
                                        hash = _a.sent();
                                        fileStat = fs.statSync(file);
                                        createdAt = fileStat.birthtime;
                                        return [2 /*return*/, {
                                                path: file,
                                                size: fileStat.size,
                                                createdAt: createdAt,
                                                hash: hash,
                                            }];
                                }
                            });
                        }); }))];
                case 2:
                    imageMetadata = _b.sent();
                    metadataDict = JSON.parse(fs.readFileSync("image-metadata.json").toString());
                    for (_i = 0, imageMetadata_1 = imageMetadata; _i < imageMetadata_1.length; _i++) {
                        _a = imageMetadata_1[_i];
                        hash = _a.hash, rest = __rest(_a, ["hash"]);
                        metadataDict[hash] = rest;
                    }
                    fs.writeFileSync("image-metadata.json", JSON.stringify(metadataDict));
                    return [2 /*return*/];
            }
        });
    });
}
exports.indexImages = indexImages;
