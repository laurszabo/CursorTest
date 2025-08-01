-- ============================================
-- Treasure Data Star Schema - Analytics Queries
-- Business Intelligence and Analytical Queries
-- ============================================

USE retail_analytics;

-- ============================================
-- BUSINESS INTELLIGENCE QUERIES
-- ============================================

-- 1. Monthly Sales Performance
SELECT 
    t.month_name,
    t.year,
    COUNT(DISTINCT f.transaction_id) as total_transactions,
    SUM(f.quantity) as total_units_sold,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(SUM(f.profit_margin), 2) as total_profit,
    ROUND(AVG(f.total_amount), 2) as avg_transaction_value,
    ROUND((SUM(f.profit_margin) / SUM(f.total_amount)) * 100, 2) as profit_margin_pct
FROM fact_sales f
JOIN dim_time t ON f.date_id = t.date_id
GROUP BY t.month_name, t.year, t.month
ORDER BY t.year, t.month;

-- 2. Top Performing Products by Revenue
SELECT 
    p.product_name,
    p.product_category,
    p.brand,
    COUNT(f.transaction_id) as times_sold,
    SUM(f.quantity) as total_units_sold,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(SUM(f.profit_margin), 2) as total_profit,
    ROUND(AVG(f.unit_price), 2) as avg_selling_price
FROM fact_sales f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_name, p.product_category, p.brand, p.product_id
ORDER BY total_revenue DESC
LIMIT 10;

-- 3. Customer Segmentation Analysis
SELECT 
    c.customer_segment,
    COUNT(DISTINCT c.customer_id) as total_customers,
    COUNT(f.transaction_id) as total_transactions,
    ROUND(COUNT(f.transaction_id) * 1.0 / COUNT(DISTINCT c.customer_id), 2) as avg_transactions_per_customer,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(SUM(f.total_amount) / COUNT(DISTINCT c.customer_id), 2) as revenue_per_customer,
    ROUND(AVG(f.total_amount), 2) as avg_transaction_value
FROM fact_sales f
JOIN dim_customers c ON f.customer_id = c.customer_id
GROUP BY c.customer_segment
ORDER BY total_revenue DESC;

-- 4. Sales Channel Performance
SELECT 
    f.sales_channel,
    COUNT(f.transaction_id) as total_transactions,
    SUM(f.quantity) as total_units_sold,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(SUM(f.profit_margin), 2) as total_profit,
    ROUND(AVG(f.total_amount), 2) as avg_transaction_value,
    ROUND((SUM(f.profit_margin) / SUM(f.total_amount)) * 100, 2) as profit_margin_pct
FROM fact_sales f
GROUP BY f.sales_channel
ORDER BY total_revenue DESC;

-- 5. Geographic Sales Analysis
SELECT 
    c.state,
    c.country,
    COUNT(DISTINCT c.customer_id) as unique_customers,
    COUNT(f.transaction_id) as total_transactions,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(SUM(f.total_amount) / COUNT(DISTINCT c.customer_id), 2) as revenue_per_customer
FROM fact_sales f
JOIN dim_customers c ON f.customer_id = c.customer_id
GROUP BY c.state, c.country
ORDER BY total_revenue DESC;

-- 6. Product Category Performance by Time
SELECT 
    p.product_category,
    t.month_name,
    COUNT(f.transaction_id) as transactions,
    SUM(f.quantity) as units_sold,
    ROUND(SUM(f.total_amount), 2) as revenue,
    ROUND(SUM(f.profit_margin), 2) as profit
FROM fact_sales f
JOIN dim_products p ON f.product_id = p.product_id
JOIN dim_time t ON f.date_id = t.date_id
GROUP BY p.product_category, t.month_name, t.month
ORDER BY p.product_category, t.month;

-- 7. Weekend vs Weekday Sales Analysis
SELECT 
    CASE WHEN t.is_weekend THEN 'Weekend' ELSE 'Weekday' END as day_type,
    COUNT(f.transaction_id) as total_transactions,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(AVG(f.total_amount), 2) as avg_transaction_value,
    ROUND(SUM(f.profit_margin), 2) as total_profit
FROM fact_sales f
JOIN dim_time t ON f.date_id = t.date_id
GROUP BY t.is_weekend
ORDER BY total_revenue DESC;

-- 8. Payment Method Analysis
SELECT 
    f.payment_method,
    COUNT(f.transaction_id) as transaction_count,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(AVG(f.total_amount), 2) as avg_transaction_value,
    ROUND((COUNT(f.transaction_id) * 100.0 / (SELECT COUNT(*) FROM fact_sales)), 2) as pct_of_transactions
FROM fact_sales f
GROUP BY f.payment_method
ORDER BY transaction_count DESC;

-- 9. Promotional Code Effectiveness
SELECT 
    CASE 
        WHEN f.promotion_code IS NULL THEN 'No Promotion'
        ELSE f.promotion_code 
    END as promotion_type,
    COUNT(f.transaction_id) as transactions_with_promo,
    ROUND(SUM(f.total_amount), 2) as total_revenue,
    ROUND(AVG(f.total_amount), 2) as avg_transaction_value,
    ROUND(SUM(f.discount_amount), 2) as total_discounts_given,
    ROUND(SUM(f.profit_margin), 2) as total_profit
FROM fact_sales f
GROUP BY f.promotion_code
ORDER BY total_revenue DESC;

-- 10. Customer Lifetime Value vs Actual Performance
SELECT 
    c.customer_name,
    c.customer_segment,
    c.customer_lifetime_value as projected_clv,
    COUNT(f.transaction_id) as actual_transactions,
    ROUND(SUM(f.total_amount), 2) as actual_revenue,
    ROUND(SUM(f.profit_margin), 2) as actual_profit,
    ROUND((SUM(f.total_amount) - c.customer_lifetime_value), 2) as clv_variance
FROM dim_customers c
LEFT JOIN fact_sales f ON c.customer_id = f.customer_id
GROUP BY c.customer_id, c.customer_name, c.customer_segment, c.customer_lifetime_value
ORDER BY actual_revenue DESC;

-- ============================================
-- ADVANCED ANALYTICS QUERIES
-- ============================================

-- 11. Time Series Analysis - Daily Sales Trend
SELECT 
    t.full_date,
    t.day_name,
    COUNT(f.transaction_id) as daily_transactions,
    ROUND(SUM(f.total_amount), 2) as daily_revenue,
    ROUND(AVG(SUM(f.total_amount)) OVER (ORDER BY t.full_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as seven_day_avg_revenue
FROM fact_sales f
JOIN dim_time t ON f.date_id = t.date_id
GROUP BY t.full_date, t.day_name, t.date_id
ORDER BY t.full_date;

-- 12. Product Affinity Analysis (Simple Cross-sell)
WITH customer_purchases AS (
    SELECT 
        f.customer_id,
        p.product_category,
        COUNT(*) as purchase_count
    FROM fact_sales f
    JOIN dim_products p ON f.product_id = p.product_id
    GROUP BY f.customer_id, p.product_category
)
SELECT 
    cp1.product_category as category_1,
    cp2.product_category as category_2,
    COUNT(DISTINCT cp1.customer_id) as customers_bought_both
FROM customer_purchases cp1
JOIN customer_purchases cp2 ON cp1.customer_id = cp2.customer_id 
WHERE cp1.product_category < cp2.product_category
GROUP BY cp1.product_category, cp2.product_category
ORDER BY customers_bought_both DESC;

-- 13. Cohort Analysis - Customer Retention by Registration Month
WITH customer_first_purchase AS (
    SELECT 
        c.customer_id,
        c.registration_date,
        MIN(t.full_date) as first_purchase_date
    FROM dim_customers c
    JOIN fact_sales f ON c.customer_id = f.customer_id
    JOIN dim_time t ON f.date_id = t.date_id
    GROUP BY c.customer_id, c.registration_date
),
monthly_activity AS (
    SELECT 
        cfp.customer_id,
        cfp.registration_date,
        t.month_name as purchase_month,
        t.year as purchase_year
    FROM customer_first_purchase cfp
    JOIN fact_sales f ON cfp.customer_id = f.customer_id
    JOIN dim_time t ON f.date_id = t.date_id
)
SELECT 
    registration_date,
    purchase_month,
    purchase_year,
    COUNT(DISTINCT customer_id) as active_customers
FROM monthly_activity
GROUP BY registration_date, purchase_month, purchase_year
ORDER BY registration_date, purchase_year, purchase_month;

-- ============================================
-- SUMMARY DASHBOARD QUERY
-- ============================================

-- 14. Executive Dashboard - Key Metrics Summary
SELECT 
    'Total Revenue' as metric,
    CONCAT('$', FORMAT_NUMBER(SUM(total_amount), 2)) as value
FROM fact_sales

UNION ALL

SELECT 
    'Total Transactions' as metric,
    FORMAT_NUMBER(COUNT(transaction_id), 0) as value
FROM fact_sales

UNION ALL

SELECT 
    'Average Transaction Value' as metric,
    CONCAT('$', FORMAT_NUMBER(AVG(total_amount), 2)) as value
FROM fact_sales

UNION ALL

SELECT 
    'Total Profit' as metric,
    CONCAT('$', FORMAT_NUMBER(SUM(profit_margin), 2)) as value
FROM fact_sales

UNION ALL

SELECT 
    'Unique Customers' as metric,
    FORMAT_NUMBER(COUNT(DISTINCT customer_id), 0) as value
FROM fact_sales

UNION ALL

SELECT 
    'Products Sold' as metric,
    FORMAT_NUMBER(COUNT(DISTINCT product_id), 0) as value
FROM fact_sales;