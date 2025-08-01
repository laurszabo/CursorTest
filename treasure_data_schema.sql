-- ============================================
-- Treasure Data Star Schema Model
-- Business Domain: Retail Sales Analytics
-- ============================================

-- Create database for Treasure Insights
CREATE DATABASE IF NOT EXISTS retail_analytics;
USE retail_analytics;

-- ============================================
-- DIMENSION TABLES
-- ============================================

-- Dimension 1: Customer Dimension
CREATE TABLE IF NOT EXISTS dim_customers (
    customer_id BIGINT,
    customer_name STRING,
    email STRING,
    customer_segment STRING,
    city STRING,
    state STRING,
    country STRING,
    registration_date STRING,
    customer_lifetime_value DOUBLE
)
STORED AS PARQUET;

-- Dimension 2: Product Dimension  
CREATE TABLE IF NOT EXISTS dim_products (
    product_id BIGINT,
    product_name STRING,
    product_category STRING,
    product_subcategory STRING,
    brand STRING,
    unit_price DOUBLE,
    cost_price DOUBLE,
    supplier STRING,
    product_status STRING
)
STORED AS PARQUET;

-- Dimension 3: Time Dimension
CREATE TABLE IF NOT EXISTS dim_time (
    date_id STRING,
    full_date STRING,
    year INT,
    quarter INT,
    month INT,
    month_name STRING,
    week_of_year INT,
    day_of_month INT,
    day_of_week INT,
    day_name STRING,
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    fiscal_year INT,
    fiscal_quarter INT
)
STORED AS PARQUET;

-- ============================================
-- FACT TABLE
-- ============================================

-- Fact Table: Sales Transactions
CREATE TABLE IF NOT EXISTS fact_sales (
    transaction_id STRING,
    customer_id BIGINT,
    product_id BIGINT,
    date_id STRING,
    time BIGINT,
    quantity INT,
    unit_price DOUBLE,
    discount_amount DOUBLE,
    tax_amount DOUBLE,
    total_amount DOUBLE,
    profit_margin DOUBLE,
    sales_channel STRING,
    payment_method STRING,
    promotion_code STRING
)
STORED AS PARQUET;

-- ============================================
-- INDEXES AND OPTIMIZATION HINTS
-- ============================================

-- Add partitioning suggestions for better performance
-- Note: Actual partitioning syntax may vary based on TD version

-- For fact table, partition by date for time-based queries
-- ALTER TABLE fact_sales SET TBLPROPERTIES('td.time.column'='time');

-- For dimensions, consider bucketing on primary keys
-- ALTER TABLE dim_customers CLUSTERED BY (customer_id) INTO 50 BUCKETS;
-- ALTER TABLE dim_products CLUSTERED BY (product_id) INTO 30 BUCKETS;