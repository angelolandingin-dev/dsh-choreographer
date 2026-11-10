const fs = require("node:fs");
const path = require("node:path");
const file = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
pkg.version = process.argv[2] ?? pkg.version;
fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log(pkg.version);
