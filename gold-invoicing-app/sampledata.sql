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

