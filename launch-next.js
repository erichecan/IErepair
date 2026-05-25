const { spawnSync } = require("child_process");
const path = require("path");

process.chdir(path.join(__dirname, "ierepair"));

const result = spawnSync(
  process.execPath,
  [path.join(__dirname, "ierepair", "node_modules", ".bin", "next"), "dev", "--port", "3001"],
  { stdio: "inherit", cwd: path.join(__dirname, "ierepair") }
);
process.exit(result.status ?? 0);
