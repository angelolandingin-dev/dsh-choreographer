// Guard the shell rows per platform, mirroring the shipped standard preset:
// Windows -> tool-pwsh, macOS/Linux -> tool-bash.
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "cordis.patch.yml");
const before = fs.readFileSync(file, "utf8");

const PW = "          - id: tool-pwsh\n            name: '@deepseek-ai/dsh-tool-pwsh'\n";
const BOTH =
  "          - id: tool-bash\n" +
  "            name: '@deepseek-ai/dsh-tool-bash'\n" +
  "            disabled: !!js process.platform === 'win32'\n" +
  "          - id: tool-pwsh\n" +
  "            name: '@deepseek-ai/dsh-tool-pwsh'\n" +
  "            disabled: !!js process.platform !== 'win32'\n";

const count = before.split(PW).length - 1;
if (count !== 5) {
  console.error(`expected 5 tool-pwsh rows, found ${count}`);
  process.exit(1);
}
const after = before.split(PW).join(BOTH);
fs.writeFileSync(file, after, "utf8");
console.log(`guarded ${count} worker shell rows`);
