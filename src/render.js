const { Liquid } = require("liquidjs");
const fs = require("fs");
const path = require("path");

const engine = new Liquid({
  extname: ".liquid",
});

const templateData = {
  user: "Max Mustermann",
  date: new Date().toLocaleDateString(),
  items: ["Apple", "Banana", "Pineapple"],
};

async function renderLiquid(inputPath, outputDir = "./output") {
  try {
    fs.mkdirSync(outputDir, { recursive: true });

    const stats = fs.statSync(inputPath);

    if (stats.isFile()) {
      await renderFile(inputPath, outputDir);
    } else if (stats.isDirectory()) {
      const files = fs
        .readdirSync(inputPath)
        .filter((file) => file.endsWith(".liquid"))
        .map((file) => path.join(inputPath, file));

      for (const file of files) {
        await renderFile(file, outputDir);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function renderFile(inputFile, outputDir) {
  try {
    const templateContent = fs.readFileSync(inputFile, "utf-8");
    const output = await engine.parseAndRender(templateContent, templateData);

    const outputFile = path.join(
      outputDir,
      path.basename(inputFile).replace(/\.liquid$/, ".html"),
    );

    fs.writeFileSync(outputFile, output);
    console.log(
      `✓ Rendered: ${path.basename(inputFile)} -> ${path.relative(process.cwd(), outputFile)}`,
    );
  } catch (err) {
    console.error(
      `✗ Failed to render ${path.basename(inputFile)}:`,
      err.message,
    );
  }
}

const args = process.argv.slice(2);
if (!args.length) {
  console.log("Usage: node render.js <input> [output-dir]");
  console.log("Examples:");
  console.log("  node render.js ./templates/example.liquid");
  console.log("  node render.js ./templates ./dist");
  console.log("  node render.js ../external-templates/");
  process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputDir = args[1] ? path.resolve(args[1]) : "./output";

renderLiquid(inputPath, outputDir);
