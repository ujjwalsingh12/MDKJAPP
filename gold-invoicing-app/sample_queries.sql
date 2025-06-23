http://localhost:5003/api/queries/cash/all?page=1&page_size=5&sort_by=dated&sort_order=asc&start_date=2025-06-19&end_date=2025-06-22&gstin=GSTIN001&is_debit=false


select sum(amount),gstin,entry_type,is_debit from journal group by (gstin,entry_type,is_debit) order by gstin,entry_type,is_debit;