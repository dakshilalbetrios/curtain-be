const fs = require("fs").promises;
require("child_process");

// Get the module name from command line arguments
const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Please provide a module name");
  process.exit(1);
}

// Convert module name to different cases
const kebabCase = moduleName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const pascalCase = kebabCase
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join("");
const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);

// Define paths to delete
const filesToDelete = [
  // Model files
  `src/models/${kebabCase}/${kebabCase}.model.js`,
  // Service files
  `src/services/${kebabCase}/${kebabCase}.service.js`,
  // Controller files
  `src/api/controllers/${kebabCase}.controller.js`,
  // Route files
  `src/api/routes/${kebabCase}.routes.js`,
  // Validator files
  `src/api/validators/${kebabCase}.validator.js`,
];

async function deleteFile(filePath) {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    console.log(`✅ Deleted: ${filePath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`⚠️  File not found: ${filePath}`);
    } else {
      console.error(`❌ Error deleting ${filePath}:`, error);
    }
  }
}

async function deleteEmptyDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    if (files.length === 0) {
      await fs.rmdir(dirPath);
      console.log(`✅ Deleted empty directory: ${dirPath}`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`❌ Error checking/deleting directory ${dirPath}:`, error);
    }
  }
}

async function removeFromIndexFile(directory, exportName, type = "controller") {
  const indexPath = `${directory}/index.js`;
  try {
    const content = await fs.readFile(indexPath, "utf8");
    let newContent = content;

    switch (type) {
      case "validator":
        // Remove const declaration
        const constPattern = new RegExp(
          `\\bconst\\s+${camelCase}Validator\\s*=\\s*require\\([^)]+\\);?\\n?`,
          "g"
        );
        newContent = newContent.replace(constPattern, "");

        // Remove from module.exports
        const validatorExportPattern = new RegExp(
          `\\s*${camelCase}Validator,?\\n?`,
          "g"
        );
        newContent = newContent.replace(validatorExportPattern, "");
        break;

      case "controller":
      case "service":
        // Remove exports.X pattern
        const exportPattern = new RegExp(
          `\\nexports\\.${exportName}\\s*=\\s*require\\([^)]+\\);?\\n?`,
          "g"
        );
        newContent = newContent.replace(exportPattern, "\n");
        break;

      case "model":
        // Remove exports.X pattern before module.exports
        const modelExportPattern = new RegExp(
          `\\nexports\\.${exportName}\\s*=\\s*require\\([^)]+\\);?\\n?`,
          "g"
        );
        newContent = newContent.replace(modelExportPattern, "\n");
        break;
    }

    // Clean up formatting
    newContent = newContent
      // Remove empty lines at the start of file
      .replace(/^\s*\n/, "")
      // Remove multiple empty lines between content
      .replace(/\n{3,}/g, "\n\n")
      // Remove trailing commas in objects followed by newline
      .replace(/,(\s*\n\s*})/g, "$1")
      // Remove empty exports
      .replace(/module\.exports\s*=\s*{\s*};?\s*\n?/g, "module.exports = {};\n")
      // Remove trailing whitespace on each line
      .replace(/[ \t]+$/gm, "")
      // Remove trailing newlines at end of file
      .replace(/\n+$/, "\n");

    // If file is not empty, ensure it ends with exactly one newline
    if (newContent.trim()) {
      newContent = newContent.replace(/\n*$/, "\n");
    }

    await fs.writeFile(indexPath, newContent);
    console.log(`✅ Removed ${exportName} from ${indexPath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log(`⚠️  Index file not found: ${indexPath}`);
    } else {
      console.error(`❌ Error updating ${indexPath}:`, error);
    }
  }
}

async function main() {
  console.log(`🚀 Deleting module: ${moduleName}`);

  // Remove exports from index files
  const modelsDir = "src/models";
  const servicesDir = "src/services";
  const apiDir = "src/api/controllers";
  const validatorsDir = "src/api/validators";

  await removeFromIndexFile(modelsDir, `${pascalCase}Model`, "model");
  await removeFromIndexFile(servicesDir, `${pascalCase}Service`, "service");
  await removeFromIndexFile(apiDir, `${pascalCase}Controller`, "controller");
  await removeFromIndexFile(
    validatorsDir,
    `${pascalCase}Validator`,
    "validator"
  );

  // Delete all files
  for (const file of filesToDelete) {
    await deleteFile(file);
  }

  // Try to delete empty directories
  const directories = [`src/models/${kebabCase}`, `src/services/${kebabCase}`];

  for (const dir of directories) {
    await deleteEmptyDirectory(dir);
  }

  console.log("✨ Module deletion completed!");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
