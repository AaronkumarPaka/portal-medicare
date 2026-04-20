try {
  require("ts-node/register/transpile-only");
  require("./src/index.ts");
} catch (error) {
  console.error("Failed to bootstrap backend from src/index.ts");
  console.error(error);
  process.exit(1);
}
