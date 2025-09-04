# Query Parameters Documentation

This document provides comprehensive examples of all possible parameters you can pass to the `findAll` method in the base model implementation.

## **Basic Usage**

```javascript
const result = await leadService.getAllLeads({
  params: {
    // Your query parameters here
  },
});
```

---

## **1. Pagination Parameters**

```javascript
{
  page: 1,           // Page number (positive integer)
  limit: 20          // Items per page (1-1000)
}
```

**Example:**

```javascript
// Get first 20 leads
{ page: 1, limit: 20 }

// Get leads 41-60 (page 3, 20 items)
{ page: 3, limit: 20 }
```

---

## **2. Sorting Parameters**

```javascript
{
  sort: "created_at",           // Single column
  order: "desc"                 // asc, desc, ASC, DESC
}
```

**Multiple Column Sorting:**

```javascript
{
  sort: "created_at,patient_name,status",    // Multiple columns
  order: "desc,asc,desc"                     // Corresponding directions
}
```

**Examples:**

```javascript
// Sort by creation date descending
{ sort: "created_at", order: "desc" }

// Sort by patient name ascending, then by status descending
{ sort: "patient_name,status", order: "asc,desc" }

// Sort by engagement mode, then by follow-up date
{ sort: "engagement_mode,follow_up_date", order: "asc,desc" }
```

---

## **3. Direct Field Filtering (AND Logic)**

```javascript
{
  // Direct field matches
  patient_name: "John Doe",
  status: "NEW",
  engagement_mode: "PHONE",
  assigned_to: 123,
  referred_by_type: "DOCTOR"
}
```

**Examples:**

```javascript
// Find leads with specific status and engagement mode
{
  status: "NEW",
  engagement_mode: "PHONE"
}

// Find leads assigned to specific user
{
  assigned_to: 456
}

// Find leads from specific source
{
  source: "WEBSITE"
}
```

---

## **4. Field Operators (AND Logic)**

### **Equality Operators**

```javascript
{
  patient_name_eq: "John Doe",        // Equal
  status_ne: "CONVERTED",             // Not equal
  assigned_to_null: true,             // Is null
  assigned_to_not_null: false         // Is not null
}
```

### **Comparison Operators**

```javascript
{
  created_at_gt: "2024-01-01",        // Greater than
  created_at_gte: "2024-01-01",       // Greater than or equal
  follow_up_date_lt: "2024-12-31",    // Less than
  follow_up_date_lte: "2024-12-31"    // Less than or equal
}
```

### **String Operators**

```javascript
{
  patient_name_like: "John",          // Contains
  patient_name_not_like: "Test",      // Does not contain
  patient_name_starts_with: "Jo",     // Starts with
  patient_name_ends_with: "oe"        // Ends with
}
```

### **Array Operators**

```javascript
{
  status_in: "NEW,CONTACTED",         // In array (comma-separated)
  status_in: ["NEW", "CONTACTED"],    // In array (actual array)
  engagement_mode_nin: "EMAIL,SMS"    // Not in array
}
```

### **Range Operators**

```javascript
{
  created_at_between: ["2024-01-01", "2024-12-31"],
  follow_up_date_between: ["2024-06-01", "2024-06-30"]
}
```

---

## **5. Date Range Filters**

```javascript
{
  // Follow-up date ranges
  follow_up_date_from: "2024-06-01",
  follow_up_date_to: "2024-06-30",

  // Last contacted ranges
  last_contacted_at_from: "2024-05-01",
  last_contacted_at_to: "2024-05-31",

  // Conversion date ranges
  converted_at_from: "2024-01-01",
  converted_at_to: "2024-12-31",

  // Creation date ranges
  created_at_from: "2024-01-01",
  created_at_to: "2024-12-31",

  // Update date ranges
  updated_at_from: "2024-06-01",
  updated_at_to: "2024-06-30"
}
```

---

## **6. Advanced Query Parameters**

### **Field Selection**

```javascript
{
  select: "id,patient_name,status"; // Specific fields
  select: ["id", "patient_name", "status"]; // Array format
  select: {
    include: ["id", "patient_name"];
  } // Include only
  select: {
    exclude: ["notes", "address"];
  } // Exclude fields
}
```

### **Table Joins**

```javascript
{
  joins: JSON.stringify([
    {
      table: "users",
      alias: "assignee",
      foreignKey: "assigned_to",
      referenceKey: "id",
      type: "left",
      select: ["first_name", "last_name"],
    },
  ]);
}
```

### **Grouping**

```javascript
{
  groupBy: "status"                                   // Single column
  groupBy: ["status", "engagement_mode"]              // Multiple columns
  groupBy: { columns: ["status"], rollup: true }      // With rollup
}
```

### **Distinct Results**

```javascript
{
  distinct: true; // All columns
  distinct: "patient_name"; // Single column
  distinct: ["patient_name", "status"]; // Multiple columns
}
```

### **Having Conditions**

```javascript
{
  having: JSON.stringify({
    "COUNT(*)_gt": 5, // Count greater than 5
    status_eq: "NEW", // Status equals NEW
  });
}
```

---

## **7. Search Parameters (OR Logic)**

```javascript
{
  search: "John"; // General search
  filters: JSON.stringify({
    // Advanced filters
    patient_name_like: "John",
    patient_mobile_no_like: "123",
  });
}
```

---

## **8. Complete Real-World Examples**

### **Example 1: Basic Lead Search**

```javascript
{
  page: 1,
  limit: 20,
  status: "NEW",
  engagement_mode: "PHONE",
  sort: "created_at",
  order: "desc"
}
```

### **Example 2: Advanced Filtering**

```javascript
{
  page: 1,
  limit: 50,
  status_in: ["NEW", "CONTACTED"],
  engagement_mode_ne: "EMAIL",
  created_at_gte: "2024-01-01",
  follow_up_date_between: ["2024-06-01", "2024-06-30"],
  assigned_to_not_null: true,
  sort: "follow_up_date,created_at",
  order: "asc,desc"
}
```

### **Example 3: Search with Multiple Criteria**

```javascript
{
  page: 1,
  limit: 100,
  patient_name_like: "John",
  patient_mobile_no_like: "123",
  status_eq: "NEW",
  engagement_mode_in: ["PHONE", "WHATSAPP"],
  created_at_from: "2024-05-01",
  created_at_to: "2024-05-31",
  sort: "patient_name",
  order: "asc"
}
```

### **Example 4: Complex Query with Joins**

```javascript
{
  page: 1,
  limit: 25,
  status: "NEW",
  assigned_to_not_null: true,
  select: ["id", "patient_name", "status", "assigned_to"],
  joins: JSON.stringify([
    {
      table: "users",
      alias: "assignee",
      foreignKey: "assigned_to",
      referenceKey: "id",
      type: "left",
      select: ["first_name", "last_name"]
    }
  ]),
  sort: "created_at",
  order: "desc"
}
```

### **Example 5: Analytics Query**

```javascript
{
  groupBy: ["status", "engagement_mode"],
  select: ["status", "engagement_mode", "COUNT(*) as count"],
  having: JSON.stringify({
    "COUNT(*)_gt": 5
  }),
  sort: "count",
  order: "desc"
}
```

---

## **9. URL Query String Examples**

### **Basic Filtering**

```
GET /leads?page=1&limit=20&status=NEW&engagement_mode=PHONE
```

### **Advanced Filtering**

```
GET /leads?page=1&limit=50&status_in=NEW,CONTACTED&created_at_gte=2024-01-01&follow_up_date_between=["2024-06-01","2024-06-30"]&sort=follow_up_date&order=asc
```

### **Search with Multiple Criteria**

```
GET /leads?patient_name_like=John&patient_mobile_no_like=123&status_eq=NEW&engagement_mode_in=PHONE,WHATSAPP&created_at_from=2024-05-01&created_at_to=2024-05-31
```

### **Complex Query**

```
GET /leads?page=1&limit=25&status=NEW&assigned_to_not_null=true&select=["id","patient_name","status"]&sort=created_at&order=desc
```

---

## **10. Response Format**

```javascript
{
  data: [
    {
      id: 1,
      patient_name: "John Doe",
      patient_mobile_no: "1234567890",
      engagement_mode: "PHONE",
      status: "NEW",
      // ... other fields
    }
  ],
  pagination: {
    total: 150,
    page: 1,
    limit: 20,
    pages: 8
  }
}
```

---

## **11. Logic Rules**

### **AND Logic (Default)**

- **Direct field names**: `?patient_name=John&status=NEW` → `WHERE patient_name = 'John' AND status = 'NEW'`
- **Field operators**: `?patient_name_like=John&status_eq=NEW` → `WHERE patient_name LIKE '%John%' AND status = 'NEW'`
- **Enhanced filters**: `?filters[status_eq]=NEW&filters[engagement_mode_eq]=PHONE` → `WHERE status = 'NEW' AND engagement_mode = 'PHONE'`

### **OR Logic (Special Cases)**

- **Search fields**: `?patient_name_like=John&patient_mobile_no_like=123` → `WHERE (patient_name LIKE '%John%' OR patient_mobile_no LIKE '%123%')`
- **Multiple \_like filters on searchable fields** use OR logic

---

## **12. Available Operators**

| Operator      | Description           | Example                                          |
| ------------- | --------------------- | ------------------------------------------------ |
| `eq`          | Equal                 | `status_eq=NEW`                                  |
| `ne`          | Not equal             | `status_ne=CONVERTED`                            |
| `gt`          | Greater than          | `created_at_gt=2024-01-01`                       |
| `gte`         | Greater than or equal | `created_at_gte=2024-01-01`                      |
| `lt`          | Less than             | `follow_up_date_lt=2024-12-31`                   |
| `lte`         | Less than or equal    | `follow_up_date_lte=2024-12-31`                  |
| `like`        | Contains              | `patient_name_like=John`                         |
| `not_like`    | Does not contain      | `patient_name_not_like=Test`                     |
| `starts_with` | Starts with           | `patient_name_starts_with=Jo`                    |
| `ends_with`   | Ends with             | `patient_name_ends_with=oe`                      |
| `in`          | In array              | `status_in=NEW,CONTACTED`                        |
| `nin`         | Not in array          | `engagement_mode_nin=EMAIL,SMS`                  |
| `between`     | Between range         | `created_at_between=["2024-01-01","2024-12-31"]` |
| `null`        | Is null               | `assigned_to_null=true`                          |
| `not_null`    | Is not null           | `assigned_to_not_null=true`                      |

---

## **13. Special Parameters**

| Parameter  | Type                 | Description                        |
| ---------- | -------------------- | ---------------------------------- |
| `page`     | number               | Page number for pagination         |
| `limit`    | number               | Items per page (1-1000)            |
| `sort`     | string               | Column(s) to sort by               |
| `order`    | string               | Sort direction (asc/desc)          |
| `search`   | string               | General search term                |
| `filters`  | string               | JSON string for advanced filtering |
| `select`   | string/array/object  | Field selection                    |
| `joins`    | string               | JSON string for table joins        |
| `groupBy`  | string/array/object  | Grouping configuration             |
| `distinct` | boolean/string/array | Distinct results                   |
| `having`   | string               | JSON string for having conditions  |

---

## **14. Best Practices**

1. **Use appropriate operators** for your use case
2. **Combine AND and OR logic** effectively
3. **Use pagination** for large datasets
4. **Optimize field selection** to reduce data transfer
5. **Use date ranges** for time-based filtering
6. **Validate input** before sending to the API
7. **Use proper encoding** for URL parameters
8. **Test complex queries** thoroughly

---

## **15. Error Handling**

Common validation errors:

- Invalid field names
- Invalid operator types
- Invalid date formats
- Invalid JSON in complex parameters
- Exceeding limit maximum (1000)
- Invalid sort directions

Always check the API response for error messages and handle them appropriately in your application.
