-- ============================================
-- Treasure Data Star Schema - Sample Data
-- Business Domain: Retail Sales Analytics
-- ============================================

USE retail_analytics;

-- ============================================
-- DIMENSION DATA
-- ============================================

-- Sample data for Customer Dimension
INSERT INTO dim_customers VALUES
(1001, 'Alice Johnson', 'alice.johnson@email.com', 'Premium', 'San Francisco', 'CA', 'USA', '2022-01-15', 2500.00),
(1002, 'Bob Smith', 'bob.smith@email.com', 'Standard', 'New York', 'NY', 'USA', '2022-02-20', 1800.00),
(1003, 'Charlie Brown', 'charlie.brown@email.com', 'Premium', 'Los Angeles', 'CA', 'USA', '2021-11-10', 3200.00),
(1004, 'Diana Prince', 'diana.prince@email.com', 'VIP', 'Chicago', 'IL', 'USA', '2021-08-05', 4500.00),
(1005, 'Edward Wilson', 'edward.wilson@email.com', 'Standard', 'Houston', 'TX', 'USA', '2022-03-12', 1200.00),
(1006, 'Fiona Davis', 'fiona.davis@email.com', 'Premium', 'Phoenix', 'AZ', 'USA', '2022-01-30', 2800.00),
(1007, 'George Miller', 'george.miller@email.com', 'Standard', 'Philadelphia', 'PA', 'USA', '2021-12-18', 1600.00),
(1008, 'Helen Taylor', 'helen.taylor@email.com', 'VIP', 'San Antonio', 'TX', 'USA', '2021-09-22', 5200.00),
(1009, 'Ivan Rodriguez', 'ivan.rodriguez@email.com', 'Standard', 'San Diego', 'CA', 'USA', '2022-02-14', 1400.00),
(1010, 'Julia Anderson', 'julia.anderson@email.com', 'Premium', 'Dallas', 'TX', 'USA', '2021-10-07', 3600.00);

-- Sample data for Product Dimension
INSERT INTO dim_products VALUES
(2001, 'iPhone 14 Pro', 'Electronics', 'Smartphones', 'Apple', 999.99, 650.00, 'Apple Inc.', 'Active'),
(2002, 'Samsung Galaxy S23', 'Electronics', 'Smartphones', 'Samsung', 849.99, 580.00, 'Samsung Electronics', 'Active'),
(2003, 'MacBook Air M2', 'Electronics', 'Laptops', 'Apple', 1199.99, 800.00, 'Apple Inc.', 'Active'),
(2004, 'Dell XPS 13', 'Electronics', 'Laptops', 'Dell', 899.99, 620.00, 'Dell Technologies', 'Active'),
(2005, 'Nike Air Max 270', 'Footwear', 'Athletic Shoes', 'Nike', 149.99, 75.00, 'Nike Inc.', 'Active'),
(2006, 'Adidas Ultraboost 22', 'Footwear', 'Athletic Shoes', 'Adidas', 179.99, 90.00, 'Adidas AG', 'Active'),
(2007, 'Levi\'s 501 Jeans', 'Clothing', 'Denim', 'Levi\'s', 69.99, 35.00, 'Levi Strauss & Co.', 'Active'),
(2008, 'H&M Cotton T-Shirt', 'Clothing', 'Casual Wear', 'H&M', 12.99, 6.50, 'H&M Group', 'Active'),
(2009, 'Sony WH-1000XM4', 'Electronics', 'Audio', 'Sony', 349.99, 200.00, 'Sony Corporation', 'Active'),
(2010, 'Kindle Paperwhite', 'Electronics', 'E-readers', 'Amazon', 139.99, 85.00, 'Amazon', 'Active');

-- Sample data for Time Dimension (covering Q1 2024)
INSERT INTO dim_time VALUES
('20240101', '2024-01-01', 2024, 1, 1, 'January', 1, 1, 2, 'Monday', false, true, 2024, 1),
('20240102', '2024-01-02', 2024, 1, 1, 'January', 1, 2, 3, 'Tuesday', false, false, 2024, 1),
('20240103', '2024-01-03', 2024, 1, 1, 'January', 1, 3, 4, 'Wednesday', false, false, 2024, 1),
('20240104', '2024-01-04', 2024, 1, 1, 'January', 1, 4, 5, 'Thursday', false, false, 2024, 1),
('20240105', '2024-01-05', 2024, 1, 1, 'January', 1, 5, 6, 'Friday', false, false, 2024, 1),
('20240106', '2024-01-06', 2024, 1, 1, 'January', 1, 6, 7, 'Saturday', true, false, 2024, 1),
('20240107', '2024-01-07', 2024, 1, 1, 'January', 1, 7, 1, 'Sunday', true, false, 2024, 1),
('20240115', '2024-01-15', 2024, 1, 1, 'January', 3, 15, 2, 'Monday', false, true, 2024, 1),
('20240201', '2024-02-01', 2024, 1, 2, 'February', 5, 1, 5, 'Thursday', false, false, 2024, 1),
('20240214', '2024-02-14', 2024, 1, 2, 'February', 7, 14, 4, 'Wednesday', false, true, 2024, 1),
('20240301', '2024-03-01', 2024, 1, 3, 'March', 9, 1, 6, 'Friday', false, false, 2024, 1),
('20240315', '2024-03-15', 2024, 1, 3, 'March', 11, 15, 6, 'Friday', false, false, 2024, 1),
('20240320', '2024-03-20', 2024, 1, 3, 'March', 12, 20, 4, 'Wednesday', false, false, 2024, 1),
('20240325', '2024-03-25', 2024, 1, 3, 'March', 13, 25, 2, 'Monday', false, false, 2024, 1),
('20240331', '2024-03-31', 2024, 1, 3, 'March', 13, 31, 1, 'Sunday', true, false, 2024, 1);

-- ============================================
-- FACT TABLE DATA
-- ============================================

-- Sample data for Sales Fact Table
INSERT INTO fact_sales VALUES
('TXN001', 1001, 2001, '20240101', 1704067200, 1, 999.99, 0.00, 80.00, 1079.99, 349.99, 'Online', 'Credit Card', 'NEW2024'),
('TXN002', 1002, 2005, '20240102', 1704153600, 2, 149.99, 15.00, 27.00, 311.98, 149.98, 'Store', 'Debit Card', NULL),
('TXN003', 1003, 2003, '20240103', 1704240000, 1, 1199.99, 100.00, 88.00, 1187.99, 399.99, 'Online', 'Credit Card', 'SAVE100'),
('TXN004', 1004, 2007, '20240104', 1704326400, 3, 69.99, 0.00, 16.80, 226.77, 104.97, 'Store', 'Cash', NULL),
('TXN005', 1005, 2008, '20240105', 1704412800, 5, 12.99, 5.00, 5.20, 69.75, 32.45, 'Online', 'PayPal', 'BULK5'),
('TXN006', 1006, 2002, '20240106', 1704499200, 1, 849.99, 50.00, 64.00, 863.99, 269.99, 'Store', 'Credit Card', 'WEEKEND'),
('TXN007', 1007, 2009, '20240107', 1704585600, 1, 349.99, 0.00, 28.00, 377.99, 149.99, 'Online', 'Credit Card', NULL),
('TXN008', 1008, 2004, '20240115', 1705276800, 1, 899.99, 0.00, 72.00, 971.99, 279.99, 'Online', 'Credit Card', 'VIP20'),
('TXN009', 1009, 2006, '20240201', 1706745600, 1, 179.99, 20.00, 12.80, 172.79, 89.99, 'Store', 'Debit Card', 'FEB20'),
('TXN010', 1010, 2010, '20240214', 1707868800, 2, 139.99, 0.00, 22.40, 301.38, 109.98, 'Online', 'Credit Card', 'LOVE14'),
('TXN011', 1001, 2005, '20240301', 1709251200, 1, 149.99, 10.00, 11.20, 151.19, 74.99, 'Store', 'Credit Card', 'MARCH10'),
('TXN012', 1002, 2007, '20240315', 1710460800, 2, 69.99, 0.00, 11.20, 151.18, 69.98, 'Online', 'PayPal', NULL),
('TXN013', 1003, 2008, '20240320', 1710892800, 4, 12.99, 3.00, 4.16, 54.96, 25.96, 'Store', 'Cash', 'SPRING3'),
('TXN014', 1004, 2001, '20240325', 1711324800, 1, 999.99, 200.00, 64.00, 863.99, 149.99, 'Online', 'Credit Card', 'VIP200'),
('TXN015', 1005, 2009, '20240331', 1711843200, 1, 349.99, 30.00, 25.60, 345.59, 149.99, 'Store', 'Debit Card', 'EOQ30');

-- ============================================
-- DATA VALIDATION QUERIES
-- ============================================

-- Verify row counts
SELECT 'dim_customers' as table_name, COUNT(*) as row_count FROM dim_customers
UNION ALL
SELECT 'dim_products' as table_name, COUNT(*) as row_count FROM dim_products  
UNION ALL
SELECT 'dim_time' as table_name, COUNT(*) as row_count FROM dim_time
UNION ALL
SELECT 'fact_sales' as table_name, COUNT(*) as row_count FROM fact_sales;

-- Verify referential integrity
SELECT 'Missing customers' as check_type, COUNT(*) as count
FROM fact_sales f 
LEFT JOIN dim_customers c ON f.customer_id = c.customer_id 
WHERE c.customer_id IS NULL

UNION ALL

SELECT 'Missing products' as check_type, COUNT(*) as count
FROM fact_sales f 
LEFT JOIN dim_products p ON f.product_id = p.product_id 
WHERE p.product_id IS NULL

UNION ALL

SELECT 'Missing time' as check_type, COUNT(*) as count
FROM fact_sales f 
LEFT JOIN dim_time t ON f.date_id = t.date_id 
WHERE t.date_id IS NULL;