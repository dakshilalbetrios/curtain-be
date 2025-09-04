# Enhanced Filtering & Sorting System

This document describes the enhanced filtering and sorting system implemented in the base model that's available across all components.

## Overview

The enhanced filtering and sorting system provides standardized query parameter patterns for filtering and sorting data across all models. It uses **enhanced filters only** with powerful operators and comma-separated sorting for a clean, consistent, and maintainable approach.

## Supported Filter Operators

### Comparison Operators

- `_eq` - Equals
- `_ne` - Not equals
- `_gt` - Greater than
- `_gte` - Greater than or equal
- `_lt` - Less than
- `_lte` - Less than or equal

### String Operators

- `_like` - Contains (LIKE %value%)
- `_not_like` - Not contains
- `_starts_with` - Starts with
- `_ends_with` - Ends with

### Array Operators

- `_in` - In array (comma-separated or array)
- `_nin` - Not in array (comma-separated or array)

### Null Operators

- `_null` - Is null (true/false)
- `_not_null` - Is not null (true/false)

### Range Operators

- `_between` - Between two values (array with 2 elements)

### HAVING Operators (Post-GROUP BY Filtering)

- `having_*` - All the same operators as above, but applied after GROUP BY
- Example: `having_count_gt=5`, `having_sum_amount_gte=1000`

## Usage Examples

### Frontend Query Parameters

#### Basic Filtering

```
GET /images?category_eq=GENERAL&patient_id_eq=123
```

#### Multiple Values (IN)

```
GET /images?category_in=GENERAL,PRIVATE,LHR
```

#### String Search

```
GET /images?name_like=report&type_like=jpeg
```

#### Numeric Comparisons

```
GET /images?size_gt=1000000&size_lt=5000000
```

#### Date Ranges

```
GET /images?created_at_gte=2024-01-01&created_at_lte=2024-12-31
```

#### Null Checks

```
GET /images?thumbnail_url_null=true
GET /images?thumbnail_key_not_null=true
```

#### Complex Combinations

```
GET /images?category_in=GENERAL,PRIVATE&size_gt=1000000&name_like=report&created_at_gte=2024-01-01&thumbnail_url_null=false
```

#### HAVING Conditions (Post-GROUP BY)

```
GET /transactions?groupBy=patient_id&having_sum_amount_gt=1000&having_count_gte=5
GET /sales?groupBy=category&having_avg_price_gte=50&having_total_quantity_gt=10
```

### Backend Usage

#### In Services

```javascript
// Enhanced filtering
const result = await this.imageModel.findAll({
  params: {
    filters: {
      category_in: ["GENERAL", "PRIVATE"],
      size_gt: 1000000,
      name_like: "report",
      created_at_gte: "2024-01-01",
      thumbnail_url_null: true,
    },
  },
});
```

#### In Controllers

```javascript
// Parse query parameters
const filters = {};
Object.keys(req.query).forEach((key) => {
  if (key.includes("_")) {
    filters[key] = req.query[key];
  }
});

const result = await imageService.getAllImagesWithPagination({
  params: { filters },
});
```

#### HAVING Usage

```javascript
// Backend HAVING conditions
const result = await this.transactionModel.findAll({
  params: {
    filters: {
      created_at_gte: "2024-01-01",
    },
    having: {
      sum_amount_gt: 1000,
      count_gte: 5,
    },
    groupBy: "patient_id",
  },
});
```

#### Enhanced SELECT Usage

```javascript
// Backend SELECT conditions
const result = await this.imageModel.findAll({
  params: {
    select: ["id", "name", "category", "created_at"],
    // or with include/exclude
    select: {
      include: ["id", "name", "category"],
      exclude: ["deleted_at", "updated_at"],
    },
  },
});
```

#### Enhanced JOIN Usage

```javascript
// Backend JOIN conditions
const result = await this.imageModel.findAll({
  params: {
    joins: [
      {
        table: "patients",
        type: "left",
        foreignKey: "patient_id",
        referenceKey: "id",
        alias: "p",
        select: ["p.first_name", "p.last_name"],
      },
    ],
    filters: {
      category_eq: "GENERAL",
    },
  },
});
```

#### Enhanced GROUP BY Usage

```javascript
// Backend GROUP BY conditions
const result = await this.transactionModel.findAll({
  params: {
    groupBy: ["patient_id", "category"],
    // or with rollup
    groupBy: {
      columns: ["patient_id", "category"],
      rollup: true,
    },
    having: {
      sum_amount_gt: 1000,
    },
  },
});
```

#### Enhanced DISTINCT Usage

```javascript
// Backend DISTINCT conditions
const result = await this.imageModel.findAll({
  params: {
    distinct: ["category", "patient_id"],
    // or simple distinct
    distinct: true,
  },
});
```

## Available Models

The enhanced filtering is available in all models that extend the base model:

- Images
- Patients
- Appointments
- Treatments
- Prescriptions
- Transactions
- Sales
- Purchase Orders
- Medicine
- And all other models...

## Enhanced Clauses - Clean & Powerful

The system uses **enhanced clauses only** for all operations, providing a clean, powerful, and consistent approach:

### Enhanced Filtering (WHERE conditions)

```
GET /images?category_in=GENERAL,PRIVATE&size_gt=1000000&name_like=report&created_at_gte=2024-01-01
```

### Enhanced SELECT (Column Selection)

```
GET /images?select=id,name,category,created_at
GET /images?select=id,name&exclude=deleted_at,updated_at
```

### Enhanced JOIN (Table Joins)

```
GET /images?joins=patients&select=patients.first_name,patients.last_name
```

### Enhanced GROUP BY (Grouping)

```
GET /transactions?groupBy=patient_id,category&having_sum_amount_gt=1000
```

### Enhanced DISTINCT (Unique Records)

```
GET /images?distinct=category
GET /images?distinct=patient_id,category
```

### Enhanced HAVING (Post-GROUP BY Filtering)

```
GET /transactions?groupBy=patient_id&having_sum_amount_gt=1000&having_count_gte=5
```

### Comma-Separated Sorting

```
GET /images?sort=created_at,name&order=desc,asc
```

## Field-Specific Examples

### Images

```
GET /images?category_in=GENERAL,PRIVATE&size_gt=1000000&name_like=report&type_like=jpeg&thumbnail_url_null=true
```

### Patients

```
GET /patients?first_name_like=john&age_gt=18&age_lte=65&gender_in=male,female
```

### Appointments

```
GET /appointments?status_in=scheduled,completed&scheduled_datetime_gte=2024-01-01&patient_id_eq=123
```

### Transactions

```
GET /transactions?amount_gt=1000&payment_mode_in=cash,card&created_at_gte=2024-01-01
```

## Error Handling

- Invalid filter keys are logged as warnings
- Invalid operators are logged as warnings
- Invalid values are handled gracefully
- Missing fields don't cause errors

## Sorting

### Comma-Separated Sorting (Clean & Intuitive)

```
GET /images?sort=created_at&order=desc
GET /images?sort=name,category&order=asc,desc
GET /images?sort=created_at,name&order=desc,asc
```

### Backend Usage

#### In Services

```javascript
const result = await this.imageModel.findAll({
  params: {
    sort: "created_at,name",
    order: "desc,asc",
  },
});
```

#### In Controllers

```javascript
// Parse comma-separated sort parameters
const { sort, order } = req.query;

const result = await imageService.getAllImagesWithPagination({
  params: {
    sort, // e.g., "created_at,name"
    order, // e.g., "desc,asc"
  },
});
```

### Type-Specific Sorting

The system automatically applies appropriate sorting based on column type:

- **String columns**: Case-sensitive sorting using `BINARY`
- **Enum columns**: Regular sorting
- **Date columns**: Date sorting
- **Numeric columns**: Numeric sorting

### Validation

- Invalid sort columns are logged as warnings
- Invalid sort directions are logged as warnings
- Default sorting (created_at desc) is applied if no sorting specified

## Performance Considerations

- All filters are applied at the database level
- Indexes should be created on frequently filtered fields
- Complex filters are optimized for database performance
- Pagination is applied after filtering for optimal performance
- Sorting is optimized based on column types
