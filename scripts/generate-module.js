const fs = require("fs");
const path = require("path");
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

// Define directories
const modelsDir = path.join("src", "models");
const servicesDir = path.join("src", "services");
const controllersDir = path.join("src", "api", "controllers");
const validatorsDir = path.join("src", "api", "validators");
const routesDir = path.join("src", "api", "routes");

// Create directories if they don't exist
const createDirIfNotExists = (dir) => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
};

// Ensure module directories exist
createDirIfNotExists(path.join(modelsDir, kebabCase));
createDirIfNotExists(path.join(servicesDir, kebabCase));

// Update index.js files to export new modules
const updateIndexFile = async (directory, exportName, type = "controller") => {
  const indexPath = path.join(directory, "index.js");
  try {
    let content = "";
    if (fs.existsSync(indexPath)) {
      content = fs.readFileSync(indexPath, "utf8");
    }

    let newContent = content;

    switch (type) {
      case "validator":
        // Add require statement if not exists
        const requireLine = `const ${camelCase}Validator = require("./${kebabCase}.validator");\n`;
        if (!content.includes(requireLine)) {
          // Find the last require statement
          const lastRequireIndex = content.lastIndexOf("require");
          if (lastRequireIndex !== -1) {
            const insertPoint = content.indexOf("\n", lastRequireIndex) + 1;
            newContent =
              content.slice(0, insertPoint) +
              requireLine +
              content.slice(insertPoint);
          } else {
            newContent = requireLine + content;
          }
        }

        // Add to module.exports if not exists
        if (!content.includes(`${camelCase}Validator`)) {
          const exportStart = newContent.indexOf("module.exports");
          if (exportStart !== -1) {
            const lastBrace = newContent.lastIndexOf("}");
            if (lastBrace !== -1) {
              newContent =
                newContent.slice(0, lastBrace) +
                (newContent[lastBrace - 1] === "," ? "" : ",\n  ") +
                `${camelCase}Validator` +
                newContent.slice(lastBrace);
            }
          } else {
            newContent += `\nmodule.exports = {\n  ${camelCase}Validator,\n};\n`;
          }
        }
        break;

      case "controller":
      case "service":
        const importPath =
          type === "controller"
            ? `./${kebabCase}.controller`
            : `./${kebabCase}/${kebabCase}.service`;
        const exportLine = `exports.${exportName} = require("${importPath}");\n`;

        if (!content.includes(exportLine)) {
          newContent += exportLine;
        }
        break;

      case "model":
        const modelExportLine = `exports.${exportName} = require("./${kebabCase}/${kebabCase}.model");\n`;

        if (!content.includes(modelExportLine)) {
          // Find position before module.exports if it exists
          const moduleExportsIndex = content.lastIndexOf("module.exports");
          if (moduleExportsIndex !== -1) {
            const insertPoint = content.lastIndexOf("\n", moduleExportsIndex);
            newContent =
              content.slice(0, insertPoint) +
              "\n" +
              modelExportLine +
              content.slice(insertPoint);
          } else {
            newContent += modelExportLine;
          }
        }
        break;
    }

    fs.writeFileSync(indexPath, newContent);
    console.log(`✅ Updated ${indexPath} with ${exportName}`);
  } catch (error) {
    console.error(`❌ Error updating ${indexPath}:`, error);
  }
};

// Generate model file
const modelTemplate = `const BaseModel = require("../base/base.model");

class ${pascalCase}Model extends BaseModel {
  constructor(schema) {
    super(schema, "${kebabCase}s");
  }

  transform${pascalCase}Result(${camelCase}) {
    if (!${camelCase}) return null;

    return {
      id: ${camelCase}.id,
      // Add your transformation fields here
      created_at: ${camelCase}.created_at,
      created_by: ${camelCase}.created_by,
      created_by_name: ${camelCase}.created_by
        ? \`\${${camelCase}.creator_first_name || ""} \${${camelCase}.creator_last_name || ""}\`.trim()
        : null,
      updated_at: ${camelCase}.updated_at,
      updated_by: ${camelCase}.updated_by,
      updated_by_name: ${camelCase}.updated_by
        ? \`\${${camelCase}.updater_first_name || ""} \${${camelCase}.updater_last_name || ""}\`.trim()
        : null,
    };
  }

  async search${pascalCase}s({
    searchQuery = "",
    params = {},
    pagination = {},
    trx,
  }) {
    const query = this.getQueryWithSchema(trx);
    let qb = query;

    // Build base query with joins
    qb = qb
      .leftJoin(
        "users as creator",
        "${kebabCase}s.created_by",
        "creator.common_user_id"
      )
      .leftJoin(
        "users as updater",
        "${kebabCase}s.updated_by",
        "updater.common_user_id"
      );

    // Apply search conditions if searchQuery is provided
    if (searchQuery) {
      qb = qb.where((builder) => {
        builder
          .orWhere("${kebabCase}s.name", "LIKE", \`%\${searchQuery}%\`);
          // Add more search conditions here
      });
    }

    // Apply filters
    if (params.status) {
      qb = qb.where("${kebabCase}s.status", params.status);
    }

    // Get total count
    const countResult = await qb.clone().count("${kebabCase}s.id as count").first();
    const totalCount = parseInt(countResult?.count || 0);
    if (totalCount === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          pages: 0,
        },
      };
    }

    // Select all fields including related details
    qb = qb.select([
      "${kebabCase}s.*",
      "creator.first_name as creator_first_name",
      "creator.last_name as creator_last_name",
      "updater.first_name as updater_first_name",
      "updater.last_name as updater_last_name",
    ]);

    // Apply sorting
    if (params.orderBy?.length > 0) {
      params.orderBy.forEach(({ column, direction }) => {
        const validDirection = ["asc", "desc"].includes(direction.toLowerCase())
          ? direction.toLowerCase()
          : "asc";
        const columnName = [
          "created_at",
          "updated_at",
          // Add your sortable columns here
        ].includes(column)
          ? \`${kebabCase}s.\${column}\`
          : \`${kebabCase}s.created_at\`;
        qb = qb.orderBy(columnName, validDirection);
      });
    } else {
      qb = qb.orderBy("${kebabCase}s.created_at", "desc");
    }

    // Apply pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const offset = (page - 1) * limit;
    qb = qb.limit(limit).offset(offset);

    const results = await qb;

    return {
      data: Array.isArray(results)
        ? results.map(this.transform${pascalCase}Result)
        : [this.transform${pascalCase}Result(results)],
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }
}

module.exports = ${pascalCase}Model;
`;

// Generate service file
const serviceTemplate = `const { ${pascalCase}Model } = require("../../models");

class ${pascalCase}Service {
  constructor(context) {
    try {
      this.context = context;
      this.${camelCase}Model = new ${pascalCase}Model(context.schema);
    } catch (error) {
      throw error;
    }
  }

  async create${pascalCase}({ ${camelCase}Data, trx }) {
    try {
      const ${camelCase}WithAudit = {
        ...${camelCase}Data,
        created_by: this.context.user.id,
      };

      return await this.${camelCase}Model.create({
        data: ${camelCase}WithAudit,
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async update${pascalCase}({ ${camelCase}Id, ${camelCase}Data, trx }) {
    try {
      const ${camelCase}WithAudit = {
        ...${camelCase}Data,
        updated_by: this.context.user.id,
      };

      return await this.${camelCase}Model.update({
        id: ${camelCase}Id,
        data: ${camelCase}WithAudit,
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async delete${pascalCase}({ ${camelCase}Id, trx }) {
    try {
      return await this.${camelCase}Model.delete({
        id: ${camelCase}Id,
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async getOne${pascalCase}({ ${camelCase}Id, trx }) {
    try {
      return await this.${camelCase}Model.findById({
        id: ${camelCase}Id,
        trx,
      });
    } catch (error) {
      throw error;
    }
  }

  async search${pascalCase}s({ searchQuery = "", params = {}, pagination = {}, trx }) {
    try {
      return await this.${camelCase}Model.search${pascalCase}s({
        searchQuery,
        params,
        pagination,
        trx,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ${pascalCase}Service;
`;

// Generate controller file
const controllerTemplate = `const { ${pascalCase}Service } = require("../../services");
const { errorMessages } = require("../constants/error-messages.constant");

class ${pascalCase}Controller {
  async create${pascalCase}(req, res, next) {
    try {
      const ${camelCase}Service = new ${pascalCase}Service(req.context);
      const ${camelCase}Data = req.body;

      const created${pascalCase} = await ${camelCase}Service.create${pascalCase}({
        ${camelCase}Data,
      });

      res.status(201).json({ data: created${pascalCase} });
    } catch (error) {
      next(error);
    }
  }

  async update${pascalCase}(req, res, next) {
    try {
      const ${camelCase}Service = new ${pascalCase}Service(req.context);
      const { id } = req.params;
      const ${camelCase}Data = req.body;

      const updated${pascalCase} = await ${camelCase}Service.update${pascalCase}({
        ${camelCase}Id: id,
        ${camelCase}Data,
      });

      if (!updated${pascalCase}) {
        return res.status(404).json({ error: errorMessages.${pascalCase.toUpperCase()}_NOT_FOUND });
      }

      res.json({ data: updated${pascalCase} });
    } catch (error) {
      next(error);
    }
  }

  async delete${pascalCase}(req, res, next) {
    try {
      const ${camelCase}Service = new ${pascalCase}Service(req.context);
      const { id } = req.params;

      const deleted${pascalCase} = await ${camelCase}Service.delete${pascalCase}({
        ${camelCase}Id: id,
      });

      if (!deleted${pascalCase}) {
        return res.status(404).json({ error: errorMessages.${pascalCase.toUpperCase()}_NOT_FOUND });
      }

      res.json({ data: deleted${pascalCase} });
    } catch (error) {
      next(error);
    }
  }

  async getOne${pascalCase}(req, res, next) {
    try {
      const ${camelCase}Service = new ${pascalCase}Service(req.context);
      const { id } = req.params;

      const ${camelCase} = await ${camelCase}Service.getOne${pascalCase}({
        ${camelCase}Id: id,
      });

      if (!${camelCase}) {
        return res.status(404).json({ error: errorMessages.${pascalCase.toUpperCase()}_NOT_FOUND });
      }

      res.json({ data: ${camelCase} });
    } catch (error) {
      next(error);
    }
  }

  async search${pascalCase}s(req, res, next) {
    try {
      const ${camelCase}Service = new ${pascalCase}Service(req.context);
      const { searchQuery, ...params } = req.query;
      const { page, limit } = req.query;

      const ${camelCase}s = await ${camelCase}Service.search${pascalCase}s({
        searchQuery,
        params,
        pagination: { page, limit },
      });

      res.json(${camelCase}s);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ${pascalCase}Controller;
`;

// Generate validator file
const validatorTemplate = `const Joi = require("joi");

const create${pascalCase}Schema = Joi.object({
  // Add your validation schema here
  name: Joi.string().required(),
});

const update${pascalCase}Schema = Joi.object({
  // Add your validation schema here
  name: Joi.string(),
});

module.exports = {
  create${pascalCase}Schema,
  update${pascalCase}Schema,
};
`;

// Generate routes file
const routesTemplate = `const ${camelCase}Routes = [
  {
    method: "GET",
    path: "/${kebabCase}s/search",
    handler: "${pascalCase}Controller.search${pascalCase}s",
    authenticate: true,
  },
  {
    method: "POST",
    path: "/${kebabCase}s",
    handler: "${pascalCase}Controller.create${pascalCase}",
    authenticate: true,
  },
  {
    method: "GET",
    path: "/${kebabCase}s/:id",
    handler: "${pascalCase}Controller.getOne${pascalCase}",
    authenticate: true,
  },
  {
    method: "PUT",
    path: "/${kebabCase}s/:id",
    handler: "${pascalCase}Controller.update${pascalCase}",
    authenticate: true,
  },
  {
    method: "DELETE",
    path: "/${kebabCase}s/:id",
    handler: "${pascalCase}Controller.delete${pascalCase}",
    authenticate: true,
  },
];

module.exports = ${camelCase}Routes;
`;

// Write files
const writeFile = (filePath, content) => {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${filePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${filePath}:`, error);
  }
};

// Update the main function
async function main() {
  // Create all files
  writeFile(
    path.join(modelsDir, kebabCase, `${kebabCase}.model.js`),
    modelTemplate
  );
  writeFile(
    path.join(servicesDir, kebabCase, `${kebabCase}.service.js`),
    serviceTemplate
  );
  writeFile(
    path.join(controllersDir, `${kebabCase}.controller.js`),
    controllerTemplate
  );
  writeFile(
    path.join(validatorsDir, `${kebabCase}.validator.js`),
    validatorTemplate
  );
  writeFile(path.join(routesDir, `${kebabCase}.routes.js`), routesTemplate);

  // Update index files
  await updateIndexFile(modelsDir, `${pascalCase}Model`, "model");
  await updateIndexFile(servicesDir, `${pascalCase}Service`, "service");
  await updateIndexFile(
    controllersDir,
    `${pascalCase}Controller`,
    "controller"
  );
  await updateIndexFile(validatorsDir, `${pascalCase}Validator`, "validator");

  console.log(`✨ Successfully generated ${pascalCase} module files!`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
