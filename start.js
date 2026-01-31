// CommonJS wrapper to load the bundled server
const Module = require("module");
const path = require("path");

// Create a custom require for the bundled code
const bundlePath = path.join(__dirname, "dist", "index.js");

// Load the bundle (which uses __require shim)
require(bundlePath);
