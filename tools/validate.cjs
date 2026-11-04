const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");

// DSH resolves `!!js <expr>` itself; keep the expression as a string here so
// validation does not warn about an unresolved tag.
const jsTag = { tag: "tag:yaml.org,2002:js", resolve: (value) => String(value) };

const file = path.join(__dirname, "..", "cordis.patch.yml");
const doc = YAML.parse(fs.readFileSync(file, "utf8"), { customTags: [jsTag] });
const rows = doc[0].insert;
console.log("rows:", rows.length);
for (const r of rows) {
  const p = r.config.plugins;
  console.log(
    r.config.id.padEnd(12),
    "order",
    r.config.order,
    "plugins",
    String(p.length).padStart(2),
    "->",
    p.map((x) => x.id + (x.group ? "(group)" : "")).join(","),
  );
}
const cho = rows[0].config.plugins.find((x) => x.id === "persona");
console.log("choreographer prefix chars:", cho.config.prefix.length);
const sub = rows[0].config.plugins
  .find((x) => x.id === "delegation")
  .config.find((x) => x.id === "tool-subagent").config;
console.log("subagent:", JSON.stringify(sub));
const shells = rows.flatMap((r) =>
  r.config.plugins
    .filter((x) => x.id === "tool-bash" || x.id === "tool-pwsh")
    .map((x) => `${r.config.id}:${x.id}:${x.disabled ?? "always"}`),
);
console.log("shell rows:", shells.join(" "));
