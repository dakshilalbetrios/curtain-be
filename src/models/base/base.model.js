const knex = require("../../loaders/knex");

class BaseModel {
  constructor(
    tableName,
    fieldMappings = [],
    tableColumns = [],
    setColumns = [],
    searchConfig = {}
  ) {
    this.tableName = tableName;
    this.fieldMappings = fieldMappings;
    this.tableColumns = tableColumns;
    this.setColumns = setColumns;
    this.searchConfig = searchConfig;
  }

  // Get field mappings configuration from child model
  getFieldMappings() {
    return this.fieldMappings || [];
  }

  getQuery(trx = null) {
    return trx ? trx(this.tableName) : knex(this.tableName);
  }

  addFieldMappings(selectQuery) {
    // Get field mappings for current table from child model
    const fieldMappings = this.getFieldMappings();

    // Add joins for each field mapping
    fieldMappings.forEach(
      ({ field, alias, targetTable, targetField, selectFields }) => {
        // Select fields from joined table
        const fields = selectFields?.map(
          (selectField) => `${alias}.${selectField} as ${alias}_${selectField}`
        );

        selectQuery = selectQuery
          .select(fields)
          .leftJoin(
            `${targetTable} as ${alias}`,
            `${this.tableName}.${field}`,
            `${alias}.${targetField}`
          );
      }
    );

    return selectQuery;
  }

  /**
   * Transform field mapping results into nested objects
   * @param {Object} record - The record to transform
   * @returns {Object} Transformed record with nested objects
   */
  _transformFieldMappings(record) {
    if (!record) return null;

    const transformed = { ...record };
    const fieldMappings = this.getFieldMappings();

    fieldMappings.forEach(({ alias, selectFields }) => {
      if (selectFields && selectFields.length > 0) {
        // Create nested object for this field mapping
        const nestedObject = {};

        selectFields.forEach((selectField) => {
          const aliasField = `${alias}_${selectField}`;
          if (transformed[aliasField] !== undefined) {
            nestedObject[selectField] = transformed[aliasField];
            // Remove the aliased field from the main object
            delete transformed[aliasField];
          }
        });

        // Only add the nested object if it has properties
        if (Object.keys(nestedObject).length > 0) {
          // Use the alias as the key for the nested object
          transformed[alias] = nestedObject;
        }
      }
    });

    return transformed;
  }

  async create({ data, trx = null }) {
    const query = this.getQuery(trx);
    const [insertedId] = await query.insert(data);

    // Build select query for fetching created record
    const selectQuery = this.getQuery(trx)
      .select(`${this.tableName}.*`)
      .where({ [`${this.tableName}.id`]: insertedId });

    // Apply field mappings
    this.addFieldMappings(selectQuery);

    const createdRecord = await selectQuery.first();

    if (createdRecord) {
      // Transform field mappings first
      const transformedRecord = this._transformFieldMappings(createdRecord);

      return this.transformResult
        ? this.transformResult(transformedRecord)
        : transformedRecord;
    }

    return createdRecord;
  }

  async findById({ id, trx = null }) {
    // Build select query for fetching record
    const selectQuery = this.getQuery(trx)
      .select(`${this.tableName}.*`)
      .where({ [`${this.tableName}.id`]: id });

    // Apply field mappings
    this.addFieldMappings(selectQuery);

    const record = await selectQuery.first();

    if (record) {
      // Transform field mappings first
      const transformedRecord = this._transformFieldMappings(record);

      return this.transformResult
        ? this.transformResult(transformedRecord)
        : transformedRecord;
    }

    return record;
  }

  async update({ id, data, trx = null }) {
    const query = this.getQuery(trx);
    await query.where({ [`${this.tableName}.id`]: id }).update(data);

    // Build select query for fetching updated record
    const selectQuery = this.getQuery(trx)
      .select(`${this.tableName}.*`)
      .where({ [`${this.tableName}.id`]: id });

    // Apply field mappings
    this.addFieldMappings(selectQuery);

    const updatedRecord = await selectQuery.first();

    if (updatedRecord) {
      // Transform field mappings first
      const transformedRecord = this._transformFieldMappings(updatedRecord);

      return this.transformResult
        ? this.transformResult(transformedRecord)
        : transformedRecord;
    }

    return updatedRecord;
  }

  async createWithoutUsername({ data, trx = null }) {
    const query = this.getQuery(trx);
    const [insertedId] = await query.insert(data);
    const createdRecord = await this.getQuery(trx)
      .where({ [`${this.tableName}.id`]: insertedId })
      .first();
    return createdRecord;
  }

  async updateWithoutUsername({ id, data, trx = null }) {
    const query = this.getQuery(trx);
    // First update the record
    await query.where({ [`${this.tableName}.id`]: id }).update(data);
    // Then fetch the updated record using a new query
    const updatedRecord = await this.getQuery(trx)
      .where({ [`${this.tableName}.id`]: id })
      .first();
    return updatedRecord;
  }

  async delete({ id, trx = null }) {
    const query = this.getQuery(trx);
    return query.where({ [`${this.tableName}.id`]: id }).delete();
  }

  async findOne({ where, trx = null }) {
    // Build select query for fetching record
    const selectQuery = this.getQuery(trx).select(`${this.tableName}.*`);

    // Apply table prefixes to where conditions
    if (where) {
      Object.entries(where).forEach(([key, value]) => {
        const columnName = key.includes(".") ? key : `${this.tableName}.${key}`;
        selectQuery.where(columnName, value);
      });
    }

    // Apply field mappings
    this.addFieldMappings(selectQuery);

    const record = await selectQuery.first();

    if (record) {
      // Transform field mappings first
      const transformedRecord = this._transformFieldMappings(record);

      return this.transformResult
        ? this.transformResult(transformedRecord)
        : transformedRecord;
    }

    return record;
  }

  /**
   * Find all records with enhanced filtering, sorting, and pagination
   * @param {Object} options - Options object
   * @param {Object} options.params - Query parameters
   * @param {Object} options.trx - Transaction object
   * @returns {Object} Object with data and pagination
   */
  async findAll({ params = {}, trx = null }) {
    try {
      const { page, limit, ...restParams } = params;

      console.log("restParams", restParams);

      // Build the main query
      const qb = this._processParams(restParams, trx);

      // Apply pagination
      if (limit) {
        qb.limit(parseInt(limit));
      }
      if (page && limit) {
        const offset = (parseInt(page) - 1) * parseInt(limit);
        qb.offset(offset);
      }

      // Execute the query
      const data = await qb;

      // Transform data if transform method exists
      const transformedData = Array.isArray(data)
        ? data.map((item) => {
            // Transform field mappings first
            const transformedItem = this._transformFieldMappings(item);
            return this.transformResult
              ? this.transformResult(transformedItem)
              : transformedItem;
          })
        : [];

      // Get total count for pagination
      let pagination = null;
      if (page || limit) {
        // Use _processParams but override select to only get count
        const countQb = await this._processParams(params, trx)
          .clearSelect() // Clear any existing selects
          .count(`${this.tableName}.id as total`)
          .first();

        const countResult = await countQb;
        const total = parseInt(countResult?.total || 0);
        const currentPage = parseInt(page) || 1;
        const currentLimit = parseInt(limit) || 10;

        pagination = {
          total,
          page: currentPage,
          limit: currentLimit,
          pages: Math.ceil(total / currentLimit),
        };
      }

      return {
        data: transformedData,
        pagination,
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  /**
   * Count records with enhanced filtering
   * @param {Object} options - Options object
   * @param {Object} options.params - Query parameters
   * @param {Object} options.trx - Transaction object
   * @returns {Object} Count result
   */
  async count({ params = {}, trx = null }) {
    try {
      // Build the query with all parameters
      const qb = await this._processParams(params, trx);

      // Apply count
      const result = await qb.count(`${this.tableName}.id as total`).first();
      return parseInt(result?.total || 0);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process query parameters and build the query
   * @param {Object} queryParams - Query parameters
   * @param {Object} trx - Transaction object
   * @returns {Object} Query builder instance
   */
  _processParams(queryParams, trx = null) {
    const qb = this.getQuery(trx);

    // Start with base table select
    qb.select(`${this.tableName}.*`);

    // Then apply field mappings (which may include additional user joins)
    this.addFieldMappings(qb);

    // Apply direct query parameters first (including field operators)
    this._applyDirectQueryParams(qb, queryParams);

    // Apply enhanced search fields if needed
    this._applyEnhancedSearchFields(qb, queryParams);

    // Apply enhanced sorting
    this._applyEnhancedSorting(qb, queryParams);

    return qb;
  }

  /**
   * Check if a parameter is a special parameter that should be handled elsewhere
   * @param {string} key - Parameter key
   * @returns {boolean} True if it's a special parameter
   */
  _isSpecialParameter(key) {
    const specialParams = [
      "select",
      "joins",
      "filters",
      "having",
      "groupBy",
      "distinct",
      "sort",
      "order",
      "page",
      "limit",
    ];
    return specialParams.includes(key);
  }

  /**
   * Check if a column is a SET type column
   * @param {string} columnName - Full column name with table prefix
   * @returns {boolean} True if the column is a SET type
   */
  _isSetColumn(columnName) {
    // Extract the actual column name without table prefix
    const actualColumnName = columnName.includes(".")
      ? columnName.split(".")[1]
      : columnName;

    // Use the setColumns configuration passed from child model
    return this.setColumns && this.setColumns.includes(actualColumnName);
  }

  /**
   * Apply operators specifically for SET type columns
   * @param {Object} qb - Query builder instance
   * @param {string} columnName - Full column name with table prefix
   * @param {string} operator - Operator type
   * @param {*} value - Value to apply
   */
  _applySetColumnOperator(qb, columnName, operator, value) {
    switch (operator) {
      case "eq":
        // For SET columns, eq means the SET contains exactly this value
        qb.whereRaw(`FIND_IN_SET(?, ${columnName}) > 0`, [value]);
        break;

      case "ne":
        // For SET columns, ne means the SET does not contain this value
        qb.whereRaw(
          `FIND_IN_SET(?, ${columnName}) = 0 OR ${columnName} IS NULL`,
          [value]
        );
        break;

      case "in":
        // For SET columns, in means the SET contains ANY of the specified values
        const inValues = Array.isArray(value) ? value : value.split(",");
        const inConditions = inValues
          .map(() => `FIND_IN_SET(?, ${columnName}) > 0`)
          .join(" OR ");
        qb.whereRaw(`(${inConditions})`, inValues);
        break;

      case "nin":
        // For SET columns, nin means the SET does not contain ANY of the specified values
        const ninValues = Array.isArray(value) ? value : value.split(",");
        const ninConditions = ninValues
          .map(() => `FIND_IN_SET(?, ${columnName}) = 0`)
          .join(" AND ");
        qb.whereRaw(
          `(${ninConditions}) AND ${columnName} IS NOT NULL`,
          ninValues
        );
        break;

      case "null":
        if (value === true || value === "true") {
          qb.whereNull(columnName);
        } else if (value === false || value === "false") {
          qb.whereNotNull(columnName);
        }
        break;

      case "not_null":
        if (value === true || value === "true") {
          qb.whereNotNull(columnName);
        } else if (value === false || value === "false") {
          qb.whereNull(columnName);
        }
        break;

      default:
        console.warn(`Unsupported operator for SET column: ${operator}`);
    }
  }

  /**
   * Apply a field operator to the query
   * @param {Object} qb - Query builder instance
   * @param {string} columnName - Full column name with table prefix
   * @param {string} operator - Operator type
   * @param {*} value - Value to apply
   */
  _applyFieldOperator(qb, columnName, operator, value) {
    // Check if this is a SET column and handle accordingly
    if (this._isSetColumn(columnName)) {
      return this._applySetColumnOperator(qb, columnName, operator, value);
    }
    switch (operator) {
      case "eq":
        qb.where(columnName, value);
        break;

      case "ne":
        qb.whereNot(columnName, value);
        break;

      case "gt":
        qb.where(columnName, ">", value);
        break;

      case "gte":
        qb.where(columnName, ">=", value);
        break;

      case "lt":
        qb.where(columnName, "<", value);
        break;

      case "lte":
        qb.where(columnName, "<=", value);
        break;

      // case "like":
      //   qb.where(columnName, "LIKE", `%${value}%`);
      //   break;

      case "not_like":
        qb.whereNot(columnName, "LIKE", `%${value}%`);
        break;

      case "starts_with":
        qb.where(columnName, "LIKE", `${value}%`);
        break;

      case "ends_with":
        qb.where(columnName, "LIKE", `%${value}`);
        break;

      case "in":
        const inValues = Array.isArray(value) ? value : value.split(",");
        qb.whereIn(columnName, inValues);
        break;

      case "nin":
        const ninValues = Array.isArray(value) ? value : value.split(",");
        qb.whereNotIn(columnName, ninValues);
        break;

      case "between":
        if (Array.isArray(value) && value.length === 2) {
          qb.whereBetween(columnName, value);
        }
        break;

      case "null":
        if (value === true || value === "true") {
          qb.whereNull(columnName);
        } else if (value === false || value === "false") {
          qb.whereNotNull(columnName);
        }
        break;

      case "not_null":
        if (value === true || value === "true") {
          qb.whereNotNull(columnName);
        } else if (value === false || value === "false") {
          qb.whereNull(columnName);
        }
        break;

      default:
        console.warn(`Unknown filter operator: ${operator}`);
    }
  }

  /**
   * Apply direct query parameters to the query
   * @param {Object} qb - Query builder instance
   * @param {Object} queryParams - Query parameters
   */
  _applyDirectQueryParams(qb, queryParams) {
    // Get common columns that are always valid
    const commonColumns = [
      "id",
      "created_at",
      "updated_at",
      "created_by",
      "updated_by",
    ];

    // Combine common columns with table-specific columns
    const validColumns = [...commonColumns, ...this.tableColumns];

    // Process each query parameter
    Object.entries(queryParams).forEach(([key, value]) => {
      // Skip special parameters that are handled elsewhere
      if (this._isSpecialParameter(key)) {
        return;
      }

      // Check if it's a field_operator pattern
      // const fieldOperatorMatch = key.match(
      //   /^(.+)_(eq|ne|gt|gte|lt|lte|like|not_like|starts_with|ends_with|in|nin|between|null|not_null)$/
      // );

      const fieldOperatorMatch = key.match(
        /^(.+)_(eq|ne|gt|gte|lt|lte|not_like|starts_with|ends_with|in|nin|between|null|not_null)$/
      );

      if (fieldOperatorMatch) {
        const [, fieldName, operator] = fieldOperatorMatch;

        // Validate that the field exists in the table
        if (validColumns.includes(fieldName)) {
          this._applyFieldOperator(
            qb,
            `${this.tableName}.${fieldName}`,
            operator,
            value
          );
        }
      } else {
        // Check if it's a direct column name
        if (validColumns.includes(key)) {
          qb = qb.where(`${this.tableName}.${key}`, value);
        }
      }
    });

    return qb;
  }

  /**
   * Apply enhanced filters using standardized query parameter patterns
   * @param {Object} qb - Query builder instance
   * @param {Object} filters - Filter object with enhanced filter patterns
   * @returns {Object} Modified query builder
   */
  _applyEnhancedFilters(qb, filters) {
    Object.entries(filters).forEach(([filterKey, value]) => {
      // Parse filter key to extract field name and operator
      const { field, operator } = this._parseFilterKey(filterKey);
      const columnName = `${this.tableName}.${field}`;

      if (!field || !operator) {
        console.warn(`Invalid filter key: ${filterKey}`);
        return;
      }

      switch (operator) {
        case "eq":
          qb = qb.where(columnName, value);
          break;

        case "ne":
          qb = qb.whereNot(columnName, value);
          break;

        case "gt":
          qb = qb.where(columnName, ">", value);
          break;

        case "gte":
          qb = qb.where(columnName, ">=", value);
          break;

        case "lt":
          qb = qb.where(columnName, "<", value);
          break;

        case "lte":
          qb = qb.where(columnName, "<=", value);
          break;

        case "like":
          qb = qb.where(columnName, "LIKE", `%${value}%`);
          break;

        case "not_like":
          qb = qb.whereNot(columnName, "LIKE", `%${value}%`);
          break;

        case "starts_with":
          qb = qb.where(columnName, "LIKE", `${value}%`);
          break;

        case "ends_with":
          qb = qb.where(columnName, "LIKE", `%${value}`);
          break;

        case "in":
          const inValues = Array.isArray(value) ? value : value.split(",");
          qb = qb.whereIn(columnName, inValues);
          break;

        case "nin":
          const ninValues = Array.isArray(value) ? value : value.split(",");
          qb = qb.whereNotIn(columnName, ninValues);
          break;

        case "between":
          if (Array.isArray(value) && value.length === 2) {
            qb = qb.whereBetween(columnName, value);
          }
          break;

        case "null":
          if (value === true || value === "true") {
            qb = qb.whereNull(columnName);
          } else if (value === false || value === "false") {
            qb = qb.whereNotNull(columnName);
          }
          break;

        case "not_null":
          if (value === true || value === "true") {
            qb = qb.whereNotNull(columnName);
          } else if (value === false || value === "false") {
            qb = qb.whereNull(columnName);
          }
          break;

        default:
          console.warn(
            `Unknown filter operator: ${operator} in filter key: ${filterKey}`
          );
      }
    });

    return qb;
  }

  /**
   * Parse filter key to extract field name and operator
   * @param {string} filterKey - Filter key like 'category_in', 'size_gt', 'name_like'
   * @returns {Object} Object with field and operator
   */
  _parseFilterKey(filterKey) {
    // Handle special cases first
    if (filterKey.endsWith("_null")) {
      return {
        field: filterKey.replace("_null", ""),
        operator: "null",
      };
    }

    if (filterKey.endsWith("_not_null")) {
      return {
        field: filterKey.replace("_not_null", ""),
        operator: "not_null",
      };
    }

    // Handle standard patterns: field_operator
    const parts = filterKey.split("_");
    if (parts.length < 2) {
      return { field: null, operator: null };
    }

    // Extract operator (last part)
    const operator = parts[parts.length - 1];

    // Extract field name (everything except last part)
    const field = parts.slice(0, -1).join("_");

    return { field, operator };
  }

  /**
   * Apply enhanced select with column specification
   * @param {Object} qb - Query builder instance
   * @param {Array|Object} select - Select configuration
   * @returns {Object} Modified query builder
   */
  _applyEnhancedSelect(qb, select) {
    if (!select) {
      return qb;
    }

    if (Array.isArray(select)) {
      // Simple array of columns
      const columns = select.map((col) =>
        col.includes(".") ? col : `${this.tableName}.${col}`
      );
      return qb.select(columns);
    } else if (typeof select === "object") {
      // Object with include/exclude
      let columns = [`${this.tableName}.*`];

      if (select.include) {
        columns = select.include.map((col) =>
          col.includes(".") ? col : `${this.tableName}.${col}`
        );
      }

      if (select.exclude) {
        // Remove excluded columns from the select
        const excluded = select.exclude.map((col) =>
          col.includes(".") ? col : `${this.tableName}.${col}`
        );
        columns = columns.filter((col) => !excluded.includes(col));
      }

      return qb.select(columns);
    } else if (typeof select === "string") {
      // Single column
      const column = select.includes(".")
        ? select
        : `${this.tableName}.${select}`;
      return qb.select(column);
    }

    return qb;
  }

  /**
   * Apply enhanced joins with standardized patterns
   * @param {Object} qb - Query builder instance
   * @param {Array} joins - Array of join configurations
   * @returns {Object} Modified query builder
   */
  _applyEnhancedJoins(qb, joins) {
    if (!joins || !Array.isArray(joins)) {
      return qb;
    }

    joins.forEach((join) => {
      const joinType = join.type || "inner";
      const joinTable = join.schema
        ? `${join.schema}.${join.table}`
        : join.table;
      const joinAlias = join.alias || join.table;

      // Build the join condition
      let joinCondition;
      if (join.on) {
        joinCondition = join.on;
      } else if (join.foreignKey && join.referenceKey) {
        const foreignKey = join.foreignKey.includes(".")
          ? join.foreignKey
          : `${this.tableName}.${join.foreignKey}`;
        const referenceKey = join.referenceKey.includes(".")
          ? join.referenceKey
          : `${joinAlias}.${join.referenceKey}`;
        joinCondition = `${foreignKey} = ${referenceKey}`;
      } else {
        console.warn(`Invalid join configuration: ${JSON.stringify(join)}`);
        return;
      }

      // Apply the join
      qb = qb[`${joinType}Join`](`${joinTable} as ${joinAlias}`, joinCondition);

      // Add select columns from joined table if specified
      if (join.select) {
        const joinColumns = Array.isArray(join.select)
          ? join.select
          : [join.select];

        joinColumns.forEach((col) => {
          const columnName = col.includes(".") ? col : `${joinAlias}.${col}`;
          qb = qb.select(columnName);
        });
      }
    });

    return qb;
  }

  /**
   * Apply enhanced search fields (like filters) to the query
   * @param {Object} qb - Query builder instance
   * @param {Object} queryParams - Query parameters
   */
  _applyEnhancedSearchFields(qb, queryParams) {
    const allLikeFilters = [];

    // Collect all _like filters for table columns
    this.tableColumns.forEach((field) => {
      const likeKey = `${field}_like`;
      if (queryParams[likeKey]) {
        allLikeFilters.push({
          field: `${this.tableName}.${field}`,
          value: queryParams[likeKey],
        });
      }
    });

    // Let child models handle their own search logic
    if (this.searchConfig) {
      this._applyModelSearchConfig(qb, queryParams, allLikeFilters);
    }

    // Apply ALL like filters with OR logic (both main table and joined table)
    if (allLikeFilters.length > 0) {
      qb = qb.where((builder) => {
        allLikeFilters.forEach((filter, index) => {
          if (filter.additionalField || filter.additionalFields) {
            // For fields with additional search fields, use OR logic
            const additionalFields = filter.additionalFields || [
              filter.additionalField,
            ];

            if (index === 0) {
              builder.where((subBuilder) => {
                subBuilder.where(filter.field, "LIKE", `%${filter.value}%`);
                additionalFields.forEach((field) => {
                  subBuilder.orWhere(field, "LIKE", `%${filter.value}%`);
                });
              });
            } else {
              builder.orWhere((subBuilder) => {
                subBuilder.where(filter.field, "LIKE", `%${filter.value}%`);
                additionalFields.forEach((field) => {
                  subBuilder.orWhere(field, "LIKE", `%${filter.value}%`);
                });
              });
            }
          } else {
            if (index === 0) {
              builder.where(filter.field, "LIKE", `%${filter.value}%`);
            } else {
              builder.orWhere(filter.field, "LIKE", `%${filter.value}%`);
            }
          }
        });
      });
    }

    return qb;
  }

  /**
   * Apply model-specific search configuration
   * @param {Object} _qb - Query builder instance
   * @param {Object} queryParams - Query parameters
   * @param {Array} joinedLikeFilters - Array to collect joined filters
   */
  _applyModelSearchConfig(_qb, queryParams, joinedLikeFilters) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (key.endsWith("_like")) {
        const fieldName = key.replace("_like", "");

        // Check if this field is defined in the model's search config
        const searchField = this.searchConfig[fieldName];
        if (searchField) {
          if (Array.isArray(searchField.fields)) {
            // Multiple fields to search in
            joinedLikeFilters.push({
              field: searchField.fields[0],
              value: value,
              additionalFields: searchField.fields.slice(1),
            });
          } else {
            // Single field
            joinedLikeFilters.push({
              field: searchField.field,
              value: value,
            });
          }
        }
      }
    });
  }

  /**
   * Apply enhanced group by with standardized patterns
   * @param {Object} qb - Query builder instance
   * @param {Array|Object|string} groupBy - Group by configuration
   * @returns {Object} Modified query builder
   */
  _applyEnhancedGroupBy(qb, groupBy) {
    if (!groupBy) {
      return qb;
    }

    if (Array.isArray(groupBy)) {
      // Array of columns
      const columns = groupBy.map((col) =>
        col.includes(".") ? col : `${this.tableName}.${col}`
      );
      return qb.groupBy(columns);
    } else if (typeof groupBy === "object" && groupBy.columns) {
      // Object with columns and options
      const columns = groupBy.columns.map((col) =>
        col.includes(".") ? col : `${this.tableName}.${col}`
      );

      qb = qb.groupBy(columns);

      // Handle rollup if specified
      if (groupBy.rollup) {
        qb = qb.groupByRaw(`ROLLUP(${columns.join(", ")})`);
      }

      return qb;
    } else if (typeof groupBy === "string") {
      // Single column
      const column = groupBy.includes(".")
        ? groupBy
        : `${this.tableName}.${groupBy}`;
      return qb.groupBy(column);
    }

    return qb;
  }

  /**
   * Apply enhanced distinct with standardized patterns
   * @param {Object} qb - Query builder instance
   * @param {boolean|Array|string} distinct - Distinct configuration
   * @returns {Object} Modified query builder
   */
  _applyEnhancedDistinct(qb, distinct) {
    if (!distinct) {
      return qb;
    }

    if (distinct === true) {
      // Simple distinct on all columns
      return qb.distinct();
    } else if (Array.isArray(distinct)) {
      // Distinct on specific columns
      const columns = distinct.map((col) =>
        col.includes(".") ? col : `${this.tableName}.${col}`
      );
      return qb.distinct(columns);
    } else if (typeof distinct === "string") {
      // Distinct on single column
      const column = distinct.includes(".")
        ? distinct
        : `${this.tableName}.${distinct}`;
      return qb.distinct(column);
    }

    return qb;
  }

  /**
   * Apply enhanced having conditions using standardized patterns
   * @param {Object} qb - Query builder instance
   * @param {Object} having - Having object with enhanced having patterns
   * @returns {Object} Modified query builder
   */
  _applyEnhancedHaving(qb, having) {
    Object.entries(having).forEach(([havingKey, value]) => {
      // Parse having key to extract field name and operator
      const { field, operator } = this._parseFilterKey(havingKey);

      if (!field || !operator) {
        console.warn(`Invalid having key: ${havingKey}`);
        return;
      }

      const columnName = field.includes(".")
        ? field
        : `${this.tableName}.${field}`;

      switch (operator) {
        case "eq":
          qb = qb.having(columnName, value);
          break;

        case "ne":
          qb = qb.havingNot(columnName, value);
          break;

        case "gt":
          qb = qb.having(columnName, ">", value);
          break;

        case "gte":
          qb = qb.having(columnName, ">=", value);
          break;

        case "lt":
          qb = qb.having(columnName, "<", value);
          break;

        case "lte":
          qb = qb.having(columnName, "<=", value);
          break;

        case "starts_with":
          qb = qb.having(columnName, "LIKE", `${value}%`);
          break;

        case "ends_with":
          qb = qb.having(columnName, "LIKE", `%${value}`);
          break;

        case "in":
          const inValues = Array.isArray(value) ? value : value.split(",");
          qb = qb.havingIn(columnName, inValues);
          break;

        case "nin":
          const ninValues = Array.isArray(value) ? value : value.split(",");
          qb = qb.havingNotIn(columnName, ninValues);
          break;

        case "between":
          if (Array.isArray(value) && value.length === 2) {
            qb = qb.havingBetween(columnName, value);
          }
          break;

        case "null":
          if (value === true || value === "true") {
            qb = qb.havingNull(columnName);
          } else if (value === false || value === "false") {
            qb = qb.havingNotNull(columnName);
          }
          break;

        case "not_null":
          if (value === true || value === "true") {
            qb = qb.havingNotNull(columnName);
          } else if (value === false || value === "false") {
            qb = qb.havingNull(columnName);
          }
          break;

        default:
          console.warn(
            `Unknown having operator: ${operator} in having key: ${havingKey}`
          );
      }
    });

    return qb;
  }

  /**
   * Apply enhanced sorting with validation and type-specific sorting
   * @param {Object} qb - Query builder instance
   * @param {Object} params - Parameters object
   * @returns {Object} Modified query builder
   */
  _applyEnhancedSorting(qb, params) {
    // Handle comma-separated sorting
    if (params.sort && params.order) {
      const sortColumns = params.sort.split(",").map((col) => col.trim());
      const sortDirections = params.order
        .split(",")
        .map((dir) => dir.trim().toLowerCase());

      // Ensure we have matching number of columns and directions
      const maxLength = Math.max(sortColumns.length, sortDirections.length);

      for (let i = 0; i < maxLength; i++) {
        const column = sortColumns[i];
        const direction = sortDirections[i] || "asc"; // Default to asc if no direction specified

        if (column && this._isValidSortDirection(direction)) {
          qb = this._applySortColumn(qb, column, direction);
        } else if (column) {
          console.warn(`Invalid sort direction: ${direction}`);
        }
      }
    }

    // Apply default sorting if no sorting specified
    if (!params.sort) {
      qb = this._applyDefaultSorting(qb);
    }

    return qb;
  }

  /**
   * Apply sorting to a specific column with type-specific logic
   * @param {Object} qb - Query builder instance
   * @param {string} column - Column name
   * @param {string} direction - Sort direction
   * @returns {Object} Modified query builder
   */
  _applySortColumn(qb, column, direction) {
    const columnName = `${this.tableName}.${column}`;

    // Use standard sorting - column validation is handled by _isValidSortColumn
    return qb.orderBy(columnName, direction);
  }

  /**
   * Validate sort direction
   * @param {string} direction - Sort direction
   * @returns {boolean} Is valid
   */
  _isValidSortDirection(direction) {
    return ["asc", "desc"].includes(direction);
  }

  /**
   * Apply default sorting
   * @param {Object} qb - Query builder instance
   * @returns {Object} Modified query builder
   */
  _applyDefaultSorting(qb) {
    // Default sorting by created_at desc for most tables
    return qb.orderBy(`${this.tableName}.created_at`, "desc");
  }
}

module.exports = BaseModel;
