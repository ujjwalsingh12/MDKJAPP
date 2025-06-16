INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN001', 'Amit Jewels', '9876543210');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN002', 'Sharma Traders', '9123456780');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN003', 'Lakshmi Metals', '9988776655');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN004', 'Kohinoor Gold', '8877665544');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN005', 'Ridhi Sidhi', '9001122334');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN006', 'Sona Chandi', '9887766554');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN007', 'Ganesh & Sons', '9663344552');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN008', 'Raj Goldsmiths', '9111222333');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN009', 'Mahalaxmi Stores', '9334455667');
INSERT INTO customer_details (gstin, name, contact) VALUES ('GSTIN010', 'Zaveri Bazaar', '9556677880');

SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN003', '2025-06-12', false, NULL, 'BILL-011', '22', 4.5, 6150);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN004', '2025-06-13', false, NULL, 'BILL-012', '22', 6.0, 6200);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN005', '2025-06-14', false, NULL, 'BILL-013', '20', 8.0, 6000);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN006', '2025-06-15', true,  NULL, 'BILL-014', '18', 3.0, 5950);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN007', '2025-06-16', false, NULL, 'BILL-015', '24', 7.5, 6300);

SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN003', '2025-06-12', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 45000);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN004', '2025-06-13', true,  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30000);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN005', '2025-06-14', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25000);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN006', '2025-06-15', true,  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 52000);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN007', '2025-06-16', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 61000);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN003', '2025-06-12', false, NULL, NULL, '22', NULL, NULL, NULL, NULL, NULL, 50);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN004', '2025-06-13', true,  NULL, NULL, '20', NULL, NULL, NULL, NULL, NULL, 35);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN005', '2025-06-14', false, NULL, NULL, '18', NULL, NULL, NULL, NULL, NULL, 40);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN006', '2025-06-15', true,  NULL, NULL, '24', NULL, NULL, NULL, NULL, NULL, 25);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN007', '2025-06-16', false, NULL, NULL, '22', NULL, NULL, NULL, NULL, NULL, 60);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN003', '2025-06-12', false, NULL, NULL, '22', NULL, NULL, NULL, NULL, NULL, 20);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN004', '2025-06-13', true,  NULL, NULL, '20', NULL, NULL, NULL, NULL, NULL, 18);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN005', '2025-06-14', false, NULL, NULL, '24', NULL, NULL, NULL, NULL, NULL, 22);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN006', '2025-06-15', true,  NULL, NULL, '18', NULL, NULL, NULL, NULL, NULL, 30);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN007', '2025-06-16', false, NULL, NULL, '22', NULL, NULL, NULL, NULL, NULL, 28);

-- 1 to 10
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN001', '2025-06-01', FALSE, 'Opening balance', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10000);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN002', '2025-06-02', TRUE, 'June billing', 'BILL101', '22K', 5.2, 4700, 122, 122, 0, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN003', '2025-06-03', FALSE, 'Gold purchased', NULL, '24K', NULL, NULL, NULL, NULL, NULL, 80.5, NULL);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN004', '2025-06-04', TRUE, 'Stock refill', NULL, '18K', NULL, NULL, NULL, NULL, NULL, 150.0, NULL);
SELECT * FROM unified_insert_journal_entry('remarks', 'GSTIN005', '2025-06-05', FALSE, 'Special instruction', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN006', '2025-06-06', FALSE, 'Bulk order', 'BILL102', '20K', 8.5, 4950, 210, 210, 0, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN007', '2025-06-07', FALSE, 'Payment received', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25000);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN008', '2025-06-08', FALSE, 'Restocked', NULL, '22K', NULL, NULL, NULL, NULL, NULL, 65.3, NULL);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN009', '2025-06-09', TRUE, 'Gold deposit', NULL, '24K', NULL, NULL, NULL, NULL, NULL, 95.75, NULL);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN010', '2025-06-10', FALSE, 'Retail invoice', 'BILL103', '22K', 3.0, 5000, 75, 75, 0, NULL, NULL);

-- 11 to 20
SELECT * FROM unified_insert_journal_entry('remarks', 'GSTIN001', '2025-06-11', FALSE, 'Follow-up call', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN002', '2025-06-12', TRUE, 'Advance payment', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 15000);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN003', '2025-06-13', FALSE, 'New consignment', NULL, '19K', NULL, NULL, NULL, NULL, NULL, 120.2, NULL);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN004', '2025-06-14', TRUE, 'Gold return', NULL, '24K', NULL, NULL, NULL, NULL, NULL, 50.0, NULL);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN005', '2025-06-15', FALSE, 'Retail order', 'BILL104', '21K', 6.0, 4600, 110, 110, 0, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN006', '2025-06-16', TRUE, 'Cashback credited', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3000);
SELECT * FROM unified_insert_journal_entry('remarks', 'GSTIN007', '2025-06-17', FALSE, 'Urgent shipment', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN008', '2025-06-18', FALSE, 'Mid-month billing', 'BILL105', '18K', 7.0, 4800, 105, 105, 0, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN009', '2025-06-19', TRUE, 'Opening stock', NULL, '22K', NULL, NULL, NULL, NULL, NULL, 88.8, NULL);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN010', '2025-06-20', FALSE, 'Gold from refinery', NULL, '24K', NULL, NULL, NULL, NULL, NULL, 120.0, NULL);

-- 21 to 30
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN001', '2025-06-21', FALSE, 'Customer refund', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2000);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN002', '2025-06-22', TRUE, 'Corporate billing', 'BILL106', '20K', 9.5, 5100, 133, 133, 0, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN003', '2025-06-23', FALSE, 'Old gold exchange', NULL, '22K', NULL, NULL, NULL, NULL, NULL, 45.5, NULL);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN004', '2025-06-24', TRUE, 'Returned goods', NULL, '19K', NULL, NULL, NULL, NULL, NULL, 60.0, NULL);
SELECT * FROM unified_insert_journal_entry('remarks', 'GSTIN005', '2025-06-25', FALSE, 'Duplicate bill warning', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('bill', 'GSTIN006', '2025-06-26', FALSE, 'New scheme billing', 'BILL107', '22K', 2.8, 5200, 65, 65, 0, NULL, NULL);
SELECT * FROM unified_insert_journal_entry('cash', 'GSTIN007', '2025-06-27', FALSE, 'Cheque deposited', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4000);
SELECT * FROM unified_insert_journal_entry('stock', 'GSTIN008', '2025-06-28', TRUE, 'Excess inventory', NULL, '21K', NULL, NULL, NULL, NULL, NULL, 135.0, NULL);
SELECT * FROM unified_insert_journal_entry('gold', 'GSTIN009', '2025-06-29', FALSE, 'Customer deposit', NULL, '24K', NULL, NULL, NULL, NULL, NULL, 70.0, NULL);
SELECT * FROM unified_insert_journal_entry('remarks', 'GSTIN010', '2025-06-30', FALSE, 'Final remark test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);