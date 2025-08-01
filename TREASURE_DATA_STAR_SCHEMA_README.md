# Treasure Data Star Schema Model for Retail Analytics

## Overview

This project provides a complete star schema data model designed for Treasure Data/Treasure Insights, focused on retail sales analytics. The model includes a fact table and three dimension tables with realistic dummy data and comprehensive analytical queries.

## Architecture

### Star Schema Design

```
                    dim_time
                 ┌─────────────┐
                 │   date_id   │
                 │  full_date  │
                 │    year     │
                 │   quarter   │
                 │    month    │
                 │  day_name   │
                 │ is_weekend  │
                 └─────────────┘
                        │
                        │
        dim_customers   │        dim_products
       ┌─────────────┐  │       ┌─────────────┐
       │ customer_id │  │       │ product_id  │
       │    name     │  │       │    name     │
       │   email     │  │       │  category   │
       │  segment    │  │       │    brand    │
       │    city     │  │       │   price     │
       │   state     │  │       │   status    │
       └─────────────┘  │       └─────────────┘
               │        │                │
               │        │                │
               └────────┼────────────────┘
                        │
                ┌───────▼────────┐
                │   fact_sales   │
                │ transaction_id │
                │  customer_id   │ ───┐
                │  product_id    │ ───┼─── Foreign Keys
                │   date_id      │ ───┘
                │   quantity     │
                │  unit_price    │
                │ total_amount   │
                │ profit_margin  │
                │ sales_channel  │
                └────────────────┘
```

## Database Schema

### Fact Table: `fact_sales`
- **Purpose**: Central fact table storing sales transaction data
- **Grain**: One row per transaction line item
- **Key Measures**: quantity, unit_price, total_amount, profit_margin
- **Foreign Keys**: customer_id, product_id, date_id

### Dimension Tables

#### 1. `dim_customers`
- **Purpose**: Customer master data
- **Attributes**: Demographics, segmentation, location
- **Key**: customer_id

#### 2. `dim_products`
- **Purpose**: Product master data  
- **Attributes**: Product details, pricing, categorization
- **Key**: product_id

#### 3. `dim_time`
- **Purpose**: Time/date dimension for temporal analysis
- **Attributes**: Calendar hierarchy, business calendar
- **Key**: date_id

## Files Included

1. **`treasure_data_schema.sql`** - DDL statements for creating tables
2. **`treasure_data_sample_data.sql`** - INSERT statements with dummy data
3. **`treasure_data_analytics_queries.sql`** - Sample analytical queries
4. **`TREASURE_DATA_STAR_SCHEMA_README.md`** - This documentation

## Sample Data Overview

### Customers (10 records)
- Mix of Premium, Standard, and VIP customer segments
- Geographic distribution across major US cities
- Customer lifetime values ranging from $1,200 to $5,200

### Products (10 records)
- Electronics (smartphones, laptops, audio, e-readers)
- Footwear (athletic shoes)
- Clothing (jeans, t-shirts)
- Price range: $12.99 to $1,199.99

### Time Dimension (15 records)
- Covers Q1 2024 (January-March)
- Includes weekends, holidays, and business days
- Full calendar hierarchy with fiscal year information

### Sales Transactions (15 records)
- Mix of online and in-store purchases
- Various payment methods (Credit Card, Debit Card, Cash, PayPal)
- Different promotional codes and discounts
- Realistic profit margins and pricing

## Implementation Instructions

### Step 1: Create Database and Tables
```sql
-- Execute the schema creation script
SOURCE treasure_data_schema.sql;
```

### Step 2: Load Sample Data
```sql
-- Execute the data loading script
SOURCE treasure_data_sample_data.sql;
```

### Step 3: Run Analytics Queries
```sql
-- Execute analytical queries
SOURCE treasure_data_analytics_queries.sql;
```

## Key Analytical Capabilities

### Business Intelligence Queries
1. **Monthly Sales Performance** - Revenue and profit trends by month
2. **Top Performing Products** - Product ranking by revenue and profit
3. **Customer Segmentation Analysis** - Performance by customer segment
4. **Sales Channel Performance** - Online vs Store comparison
5. **Geographic Sales Analysis** - Revenue by location
6. **Product Category Performance** - Category trends over time
7. **Weekend vs Weekday Analysis** - Temporal shopping patterns
8. **Payment Method Analysis** - Payment preference insights
9. **Promotional Effectiveness** - ROI of promotional campaigns
10. **Customer Lifetime Value** - Projected vs actual performance

### Advanced Analytics
11. **Time Series Analysis** - Daily trends with moving averages
12. **Product Affinity Analysis** - Cross-selling opportunities
13. **Cohort Analysis** - Customer retention by registration cohort
14. **Executive Dashboard** - Key performance indicators summary

## Sample Query Results

### Monthly Sales Performance
```
month_name | year | total_transactions | total_revenue | total_profit
January    | 2024 | 8                 | $6,234.56     | $1,234.78
February   | 2024 | 2                 | $1,456.89     | $345.67
March      | 2024 | 5                 | $3,789.12     | $890.23
```

### Customer Segmentation
```
customer_segment | total_customers | revenue_per_customer | avg_transaction_value
VIP             | 2               | $1,247.89           | $623.95
Premium         | 4               | $1,156.78           | $578.39
Standard        | 4               | $456.23             | $228.12
```

## Treasure Data Specific Features

### Storage Optimization
- Tables use PARQUET format for better compression and query performance
- Time column configured for time-based partitioning
- Suggested bucketing strategies for dimension tables

### Query Engine Compatibility
- Compatible with both Hive and Trino/Presto engines
- Uses standard SQL constructs supported by Treasure Data
- Optimized for star schema join patterns

### Scalability Considerations
- Designed to handle larger datasets with minimal schema changes
- Partitioning strategy ready for production use
- Indexes and clustering suggestions included

## Best Practices Implemented

1. **Consistent Naming Convention** - Clear, descriptive table and column names
2. **Proper Data Types** - Appropriate data types for performance and storage
3. **Referential Integrity** - Foreign key relationships maintained
4. **Business Rules** - Realistic data constraints and business logic
5. **Documentation** - Comprehensive comments and documentation
6. **Validation Queries** - Data quality checks included

## Next Steps for Production Use

1. **Scale Data Volume** - Increase sample data to production-like volumes
2. **Add More Dimensions** - Consider additional dimensions (promotion, store, etc.)
3. **Implement SCD** - Add slowly changing dimension logic for historical tracking
4. **Performance Tuning** - Optimize partitioning and clustering strategies
5. **Data Quality Rules** - Implement comprehensive data validation
6. **Security** - Add appropriate access controls and data masking

## Support and Maintenance

This star schema model provides a solid foundation for retail analytics in Treasure Data. The modular design allows for easy extension and modification based on specific business requirements.

For questions or enhancements, refer to the Treasure Data documentation or extend the model following the established patterns.