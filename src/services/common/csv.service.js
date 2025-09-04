class CsvService {
  constructor() {
    // No predefined configurations - will be generated dynamically
  }

  /**
   * Generate CSV from JSON data
   * @param {Object} params - Parameters object
   * @param {string} params.type - Type of CSV (leads, patients, appointments, etc.)
   * @param {Array} params.data - Array of data objects
   * @param {Object} params.queryParams - Query parameters used for filtering
   * @returns {string} CSV string
   */
  generateCsv({ type, data, queryParams = {} }) {
    try {
      if (!data || data.length === 0) {
        return "";
      }

      // Get the first object to determine headers and fields
      const firstObject = data[0];

      // Generate headers and fields from the first object
      const fields = Object.keys(firstObject);
      const headers = this.generateHeaders(fields, type);

      // Process data based on type and query params
      const processedData = this.processDataByType(type, data, queryParams);

      // Generate CSV content
      const csvContent = this.convertToCsv(processedData, { headers, fields });

      return csvContent;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate headers from field names
   * @param {Array} fields - Field names
   * @param {string} _type - CSV type
   * @returns {Array} Generated headers
   */
  generateHeaders(fields, _type) {
    return fields.map((field) => {
      // Convert snake_case to Title Case
      return field
        .split("_")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    });
  }

  /**
   * Process data based on type and query parameters
   * @param {string} type - CSV type
   * @param {Array} data - Raw data
   * @param {Object} queryParams - Query parameters
   * @returns {Array} Processed data
   */
  processDataByType(type, data, queryParams) {
    switch (type) {
      case "leads":
        return this.processLeadsData(data, queryParams);

      case "patients":
        return this.processPatientsData(data, queryParams);

      case "appointments":
        return this.processAppointmentsData(data, queryParams);

      case "branches":
        return this.processBranchesData(data, queryParams);

      case "chat-messages":
        return this.processChatMessagesData(data, queryParams);

      default:
        return this.processGenericData(data, queryParams);
    }
  }

  /**
   * Process leads data for CSV export
   * @param {Array} data - Leads data
   * @param {Object} _queryParams - Query parameters
   * @returns {Array} Processed leads data
   */
  processLeadsData(data, _queryParams) {
    return data.map((lead) => {
      const processed = {};

      // Process each field dynamically
      Object.keys(lead).forEach((key) => {
        const value = lead[key];

        // Format dates
        if (this.isDateField(key)) {
          processed[key] = this.formatDate(value);
        }
        // Handle null/undefined values
        else if (value === null || value === undefined) {
          processed[key] = "";
        }
        // Handle other values
        else {
          processed[key] = String(value);
        }
      });

      return processed;
    });
  }

  /**
   * Process patients data for CSV export
   * @param {Array} data - Patients data
   * @param {Object} _queryParams - Query parameters
   * @returns {Array} Processed patients data
   */
  processPatientsData(data, _queryParams) {
    return data.map((patient) => {
      const processed = {};

      Object.keys(patient).forEach((key) => {
        const value = patient[key];

        if (this.isDateField(key)) {
          processed[key] = this.formatDate(value);
        } else if (value === null || value === undefined) {
          processed[key] = "";
        } else {
          processed[key] = String(value);
        }
      });

      return processed;
    });
  }

  /**
   * Process chat-messages data for CSV export
   * @param {Array} data - Raw chat-messages data
   * @param {Object} queryParams - Query parameters
   * @returns {Array} Processed data
   */
  processChatMessagesData(data, queryParams) {
    return data.map((message) => {
      const processedMessage = {};

      // Process each field dynamically
      Object.keys(message).forEach((key) => {
        let value = message[key];

        // Format date fields
        if (this.isDateField(key) && value) {
          value = this.formatDate(value);
        }

        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = "";
        }

        processedMessage[key] = value;
      });

      return processedMessage;
    });
  }

  /**
   * Process branches data for CSV export
   * @param {Array} data - Raw branches data
   * @param {Object} _queryParams - Query parameters
   * @returns {Array} Processed data
   */
  processBranchesData(data, _queryParams) {
    return data.map((branch) => {
      const processedBranch = {};

      // Process each field dynamically
      Object.keys(branch).forEach((key) => {
        let value = branch[key];

        // Format date fields
        if (this.isDateField(key) && value) {
          value = this.formatDate(value);
        }

        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = "";
        }

        processedBranch[key] = value;
      });

      return processedBranch;
    });
  }

  /**
   * Process appointments data for CSV export
   * @param {Array} data - Raw appointments data
   * @param {Object} _queryParams - Query parameters
   * @returns {Array} Processed data
   */
  processAppointmentsData(data, _queryParams) {
    return data.map((appointment) => {
      const processed = {};

      Object.keys(appointment).forEach((key) => {
        const value = appointment[key];

        if (this.isDateField(key)) {
          processed[key] = this.formatDate(value);
        } else if (value === null || value === undefined) {
          processed[key] = "";
        } else {
          processed[key] = String(value);
        }
      });

      return processed;
    });
  }

  /**
   * Process generic data for CSV export
   * @param {Array} data - Generic data
   * @param {Object} _queryParams - Query parameters
   * @returns {Array} Processed data
   */
  processGenericData(data, _queryParams) {
    return data.map((item) => {
      const processed = {};

      Object.keys(item).forEach((key) => {
        const value = item[key];

        if (this.isDateField(key)) {
          processed[key] = this.formatDate(value);
        } else if (value === null || value === undefined) {
          processed[key] = "";
        } else {
          processed[key] = String(value);
        }
      });

      return processed;
    });
  }

  /**
   * Check if a field is a date field
   * @param {string} fieldName - Field name
   * @returns {boolean} True if it's a date field
   */
  isDateField(fieldName) {
    const dateFields = [
      "created_at",
      "updated_at",
      "deleted_at",
      "follow_up_date",
      "last_contacted_at",
      "converted_at",
      "scheduled_datetime",
      "birth_date",
      "appointment_date",
      "start_date",
      "end_date",
      "date",
      "datetime",
    ];

    return dateFields.some((dateField) => fieldName.includes(dateField));
  }

  /**
   * Convert processed data to CSV format
   * @param {Array} data - Processed data
   * @param {Object} config - CSV configuration with headers and fields
   * @returns {string} CSV string
   */
  convertToCsv(data, config) {
    const { headers, fields } = config;

    // Create CSV header row
    const headerRow = headers
      .map((header) => this.escapeCsvValue(header))
      .join(",");

    // Create CSV data rows
    const dataRows = data.map((row) => {
      return fields
        .map((field) => {
          const value = row[field] || "";
          const escapedValue = this.escapeCsvValue(value);
          return escapedValue;
        })
        .join(",");
    });

    // Combine header and data rows
    const csvContent = [headerRow, ...dataRows].join("\n");

    return csvContent;
  }

  /**
   * Escape CSV value to handle commas and quotes
   * @param {string} value - Value to escape
   * @returns {string} Escaped value
   */
  escapeCsvValue(value) {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Format date for CSV export
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    if (!date) return "";

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "";

      return dateObj.toISOString().slice(0, 19).replace("T", " ");
    } catch (error) {
      return "";
    }
  }
}

module.exports = CsvService;
