const fs = require("node:fs");
const path = require("node:path");
const file = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
const arg = process.argv[2] ?? "patch";
if (!/^(major|minor|patch|\d+\.\d+\.\d+)$/.test(arg)) throw new Error(`not a bump: ${arg}`);
if (/^\d/.test(arg)) pkg.version = arg;
else {
  const [major, minor, patch] = pkg.version.split(".").map(Number);
  pkg.version =
    arg === "major"
      ? `${major + 1}.0.0`
      : arg === "minor"
        ? `${major}.${minor + 1}.0`
        : `${major}.${minor}.${patch + 1}`;
}
fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
console.log(pkg.version);
