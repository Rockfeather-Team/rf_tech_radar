#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@notionhq/client");
var dotenv_1 = __importDefault(require("dotenv"));
var fs_1 = require("fs");
var fs_2 = __importDefault(require("fs"));
var jsdom_1 = require("jsdom");
var path_1 = __importDefault(require("path"));
var xml_sitemap_1 = __importDefault(require("xml-sitemap"));
var config_1 = require("../src/config");
var radar_1 = require("./generateJson/radar");
dotenv_1.default.config();
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", function (err) {
    throw err;
});
var createStaticFiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var items, radar, rawConf, config, sitemap, sitemapOptions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchData()];
            case 1:
                items = _a.sent();
                return [4 /*yield*/, generateMarkdownFiles(items, "radar")];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, radar_1.createRadar)()];
            case 3:
                radar = _a.sent();
                (0, fs_1.copyFileSync)("build/index.html", "build/overview.html");
                (0, fs_1.copyFileSync)("build/index.html", "build/help-and-about-tech-radar.html");
                rawConf = (0, fs_1.readFileSync)("build/config.json", "utf-8");
                config = JSON.parse(rawConf);
                Object.keys(config.quadrants).forEach(function (quadrant) {
                    var destFolder = "build/".concat(quadrant);
                    (0, fs_1.copyFileSync)("build/index.html", "".concat(destFolder, ".html"));
                    if (!(0, fs_1.existsSync)(destFolder)) {
                        (0, fs_1.mkdirSync)(destFolder);
                    }
                });
                sitemap = new xml_sitemap_1.default();
                sitemapOptions = {
                    lastmod: "now",
                    changefreq: "weekly",
                };
                sitemap.add("".concat(config_1.publicUrl, "index.html"), sitemapOptions);
                radar.items.forEach(function (item) {
                    var targetPath = "build/".concat(item.quadrant, "/").concat(item.name, ".html");
                    (0, fs_1.copyFileSync)("build/index.html", targetPath);
                    jsdom_1.JSDOM.fromFile(targetPath).then(function (dom) {
                        var document = dom.window.document;
                        var rootEl = document.getElementById("root");
                        (0, config_1.setTitle)(document, item.title);
                        if (rootEl) {
                            var textNode = document.createElement("div");
                            var bodyFragment = jsdom_1.JSDOM.fragment(item.body);
                            textNode.appendChild(bodyFragment);
                            var headlineNode = document.createElement("h1");
                            var titleText = document.createTextNode(item.title);
                            headlineNode.appendChild(titleText);
                            rootEl.appendChild(headlineNode);
                            rootEl.appendChild(textNode);
                            // remove the <noscript> element as page has already been hydrated with static content
                            var noscriptEl = document.getElementsByTagName("noscript");
                            if (noscriptEl[0]) {
                                noscriptEl[0].remove();
                            }
                        }
                        else {
                            console.warn('Element with ID "root" not found. Static site content will be empty.');
                        }
                        (0, fs_1.writeFileSync)(targetPath, dom.serialize());
                    });
                    sitemap.add("".concat(config_1.publicUrl).concat(item.quadrant, "/").concat(item.name, ".html"), sitemapOptions);
                });
                (0, fs_1.writeFileSync)("build/sitemap.xml", sitemap.xml);
                return [2 /*return*/];
        }
    });
}); };
var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
    var notion, items, database, _i, _a, techRadarElement, isLeft, isRight, name_1, link, stage, quadrant, team, revision;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (process.env.NOTION_API_KEY === undefined ||
                    process.env.DATABASE_ID === undefined)
                    throw new Error("The environment file hasnt been set properly");
                notion = new client_1.Client({ auth: process.env.NOTION_API_KEY });
                items = [];
                return [4 /*yield*/, notion.databases.query({
                        database_id: process.env.DATABASE_ID,
                    })];
            case 1:
                database = _b.sent();
                for (_i = 0, _a = database.results; _i < _a.length; _i++) {
                    techRadarElement = _a[_i];
                    isLeft = techRadarElement.properties.Name.title.length === 0;
                    isRight = techRadarElement.properties.type.select === null ||
                        techRadarElement.properties.type.select.length === 0;
                    if (isLeft || isRight)
                        continue;
                    name_1 = techRadarElement.properties.Name.title.at(0).text.content;
                    link = techRadarElement.properties.Name.title.at(0).text.link;
                    stage = techRadarElement.properties.Stage.status.name.toLowerCase();
                    quadrant = techRadarElement.properties.type.select.name.replace(/ /g, "-");
                    console.log(quadrant);
                    team = techRadarElement.properties.team.multi_select.map(function (x) { return x.name; });
                    revision = { name: name_1, link: link, ring: stage, quadrant: quadrant, team: team };
                    items.push(revision);
                }
                return [2 /*return*/, items];
        }
    });
}); };
var generateMarkdownFiles = function (items, outputDirectory) { return __awaiter(void 0, void 0, void 0, function () {
    var _i, items_1, item, markdownContent, filename, outputPath;
    return __generator(this, function (_a) {
        if (!fs_2.default.existsSync(outputDirectory)) {
            fs_2.default.mkdirSync(outputDirectory);
        }
        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
            item = items_1[_i];
            markdownContent = "---\ntitle: ".concat(item.name, "\nring: ").concat(item.ring, "\nquadrant: ").concat(item.quadrant, "\ntags: [").concat(item.team, "]\n---\n    \nText goes here. You can use **markdown** here.");
            filename = "".concat(item.name, ".md");
            outputPath = path_1.default.join(outputDirectory, filename);
            // Write the Markdown content to the file
            fs_2.default.writeFileSync(outputPath, markdownContent);
            console.log("Saved ".concat(filename, " to ").concat(outputPath));
        }
        console.log("Markdown files saved successfully.");
        return [2 /*return*/];
    });
}); };
createStaticFiles()
    .then(function () {
    console.log("created static files.");
})
    .catch(function (err) {
    if (err && err.message) {
        console.error(err.message);
    }
    process.exit(1);
});
