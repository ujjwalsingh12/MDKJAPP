try:
    from db import get_db_connection
except:
    pass
import pandas as pd
from sqlalchemy.sql import text
from typing import Optional, Union, Dict, Any, List
from decimal import Decimal
from datetime import date

def run_paginated_query(query, conn, params={}, page=1, page_size=20, sort_by=None, sort_order='asc'):
    base_query = query.strip().rstrip(';')
    if sort_by:
        base_query += f" ORDER BY {sort_by} {sort_order.upper()}"
    offset = (page - 1) * page_size
    base_query += f" LIMIT {page_size} OFFSET {offset}"
    df = pd.read_sql(text(base_query), conn, params=params)
    return df.to_dict(orient="records")


def get_table_data(table_name, page=1, page_size=20, sort_by=None, sort_order='asc', start_date=None, end_date=None):
    conn = get_db_connection()
    query = f"SELECT * FROM {table_name}"
    filters = []
    params = {}

    if start_date and end_date:
        filters.append("dated BETWEEN :start_date AND :end_date")
        params["start_date"] = start_date
        params["end_date"] = end_date

    if filters:
        query += " WHERE " + " AND ".join(filters)

    try:
        result = run_paginated_query(query, conn, params, page, page_size, sort_by, sort_order)
        return result
    finally:
        conn.close()


def get_data_by_gstin(table_name, gstin):
    conn = get_db_connection()
    try:
        df = pd.read_sql(
            text(f"SELECT * FROM {table_name} WHERE gstin = :gstin"),
            conn,
            params={"gstin": gstin}
        )
        return df.to_dict(orient="records")
    finally:
        conn.close()


def insert_record(table_name, data):
    conn = get_db_connection()
    cols = ', '.join(data.keys())
    placeholders = ', '.join([f":{k}" for k in data.keys()])
    query = text(f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})")

    try:
        conn.execute(query, data)
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


def update_record_by_id(table_name, record_id, data):
    conn = get_db_connection()
    set_clause = ', '.join([f"{k} = :{k}" for k in data.keys()])
    data["record_id"] = record_id
    query = text(f"UPDATE {table_name} SET {set_clause} WHERE id = :record_id")

    try:
        conn.execute(query, data)
        conn.commit()
        return {"status": "updated"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


def delete_record_by_id(table_name, record_id):
    conn = get_db_connection()
    query = text(f"DELETE FROM {table_name} WHERE id = :record_id")

    try:
        conn.execute(query, {"record_id": record_id})
        conn.commit()
        return {"status": "deleted"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


# def unified_insert_journal_entry(
#     entry_type: str,
#     gstin: str,
#     dated: Optional[date] = None,
#     bank: bool = False,
#     remark_text: Optional[str] = None,
#     bill_no: Optional[str] = None,
#     purity: Optional[str] = None,
#     wt: Optional[Union[float, Decimal]] = None,
#     rate: Optional[Union[float, Decimal]] = None,
#     cgst: Optional[Union[float, Decimal]] = None,
#     sgst: Optional[Union[float, Decimal]] = None,
#     igst: Optional[Union[float, Decimal]] = None,
#     weight: Optional[Union[float, Decimal]] = None,
#     cash_amount: Optional[Union[float, Decimal]] = None
# ) -> Dict[str, Any]:
#     """
#     Python wrapper to call the PostgreSQL unified_insert_journal_entry function.
    
#     Args:
#         entry_type: Type of entry ('bill', 'cash', 'stock', 'gold', 'remarks')
#         gstin: GST identification number
#         dated: Date of entry (defaults to current date)
#         bank: Whether this is a bank transaction
#         remark_text: Optional remark text
#         bill_no: Bill number (required for 'bill' type)
#         purity: Purity specification
#         wt: Weight (required for 'bill' type)
#         rate: Rate (required for 'bill' type)
#         cgst: Central GST amount
#         sgst: State GST amount
#         igst: Integrated GST amount
#         weight: Weight (required for 'stock'/'gold' types)
#         cash_amount: Cash amount (required for 'cash' type)
    
#     Returns:
#         Dict containing status and results from the SQL function
#     """
    
#     conn = get_db_connection()
#     if not conn:
#         return {"status": "error", "message": "Failed to get a database connection."}
    
#     try:
#         # Set default date if not provided
#         if dated is None:
#             dated = date.today()
        
#         # Call the PostgreSQL function
#         query = text("""
#             SELECT * FROM public.unified_insert_journal_entry(
#                 p_entry_type := :entry_type,
#                 p_gstin := :gstin,
#                 p_dated := :dated,
#                 p_bank := :bank,
#                 p_remark_text := :remark_text,
#                 p_bill_no := :bill_no,
#                 p_purity := :purity,
#                 p_wt := :wt,
#                 p_rate := :rate,
#                 p_cgst := :cgst,
#                 p_sgst := :sgst,
#                 p_igst := :igst,
#                 p_weight := :weight,
#                 p_cash_amount := :cash_amount
#             )
#         """)
        
#         result = conn.execute(query, {
#             'entry_type': entry_type,
#             'gstin': gstin,
#             'dated': dated,
#             'bank': bank,
#             'remark_text': remark_text,
#             'bill_no': bill_no,
#             'purity': purity,
#             'wt': wt,
#             'rate': rate,
#             'cgst': cgst,
#             'sgst': sgst,
#             'igst': igst,
#             'weight': weight,
#             'cash_amount': cash_amount
#         })
        
#         # Fetch the result
#         row = result.fetchone()
        
#         if row:
#             return {
#                 "status": "success",
#                 "journal_ts": row[0],          # journal_ts
#                 "entry_type": row[1],          # returned_entry_type
#                 "entry_id": row[2],            # returned_entry_id
#                 "amount": row[3],              # returned_amount
#                 "remark_id": row[4]            # returned_remark_id
#             }
#         else:
#             return {"status": "error", "message": "No result returned from function"}
            
#     except Exception as e:
#         error_msg = str(e)
#         return {
#             "status": "error", 
#             "message": f"Database error: {error_msg}",
#             "error_type": type(e).__name__
#         }
        
#     finally:
#         conn.close()



# def unified_insert_journal_entry(data, use_entry_table=False):
#     conn = get_db_connection()

#     if not conn:
#         return {"status": "error", "message": "Failed to get a database connection."}

#     table = "journal_entry" if use_entry_table else "journal"

#     columns = ["gstin", "entry_type", "amount", "dated"]
#     params = {
#         "gstin": data["gstin"],
#         "entry_type": data["entry_type"],
#         "amount": data["amount"],
#         "dated": data["dated"]
#     }

#     if use_entry_table:
#         if "remark_id" in data:
#             columns.append("remark_id")
#             params["remark_id"] = data["remark_id"]
#         if "linked_row_id" in data:
#             columns.append("linked_row_id")
#             params["linked_row_id"] = data["linked_row_id"]
#         columns.append("is_bank")
#         params["is_bank"] = data.get("is_bank", False)
#     else:
#         if "remark_id" in data:
#             columns.append("remark_id")
#             params["remark_id"] = data["remark_id"]
#         columns.append("bank")
#         params["bank"] = data.get("is_bank", False)

#     col_str = ', '.join(columns)
#     placeholders = ', '.join([f":{col}" for col in columns])
#     query = text(f"INSERT INTO {table} ({col_str}) VALUES ({placeholders})")

#     try:
#         conn.execute(query, params)
#         conn.commit()
#         return {"status": "success", "table": table}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}
#     finally:
#         conn.close()


# def unified_insert_journal_entry(
#     entry_type: str,
#     gstin: str,
#     dated: Optional[date] = None,
#     bank: bool = False,
#     remark_text: Optional[str] = None,
#     bill_no: Optional[str] = None,
#     purity: Optional[str] = None,
#     wt: Optional[Union[float, Decimal]] = None,
#     rate: Optional[Union[float, Decimal]] = None,
#     cgst: Optional[Union[float, Decimal]] = None,
#     sgst: Optional[Union[float, Decimal]] = None,
#     igst: Optional[Union[float, Decimal]] = None,
#     weight: Optional[Union[float, Decimal]] = None,
#     cash_amount: Optional[Union[float, Decimal]] = None
# ) -> Dict[str, Any]:
#     """
#     Unified function to insert journal entries with proper validation and error handling.
    
#     Returns:
#         Dict containing:
#         - status: "success" or "error"
#         - message: Error message if status is "error"
#         - journal_ts: Timestamp of journal entry
#         - entry_type: Type of entry inserted
#         - entry_id: ID of the main entry
#         - amount: Amount associated with the entry
#         - remark_id: ID of remark if inserted
#     """
    
#     conn = get_db_connection()
#     if not conn:
#         return {"status": "error", "message": "Failed to get a database connection."}
    
#     try:
#         # Initialize variables
#         entry_id = None
#         amount = None
#         remark_id = None
#         journal_timestamp = datetime.now()
        
#         # Set default date if not provided
#         if dated is None:
#             dated = date.today()
        
#         # Input validation
#         if not entry_type or not entry_type.strip():
#             return {"status": "error", "message": "entry_type cannot be null or empty"}
        
#         if not gstin or not gstin.strip():
#             return {"status": "error", "message": "gstin cannot be null or empty"}
        
#         # Normalize entry_type to lowercase
#         entry_type = entry_type.lower().strip()
        
#         # Validate entry_type specific requirements
#         if entry_type == 'bill':
#             if not bill_no or not bill_no.strip():
#                 return {"status": "error", "message": "bill_no is required for bill entries"}
#             if not wt or wt <= 0:
#                 return {"status": "error", "message": "weight (wt) must be positive for bill entries"}
#             if not rate or rate <= 0:
#                 return {"status": "error", "message": "rate must be positive for bill entries"}
                
#         elif entry_type == 'cash':
#             if not cash_amount or cash_amount == 0:
#                 return {"status": "error", "message": "cash_amount is required and must be non-zero for cash entries"}
                
#         elif entry_type in ['stock', 'gold']:
#             if not weight or weight <= 0:
#                 return {"status": "error", "message": f"weight must be positive for {entry_type} entries"}
                
#         elif entry_type == 'remarks':
#             if not remark_text or not remark_text.strip():
#                 return {"status": "error", "message": "remark_text is required for remarks entries"}
                
#         else:
#             return {"status": "error", "message": f"Unknown entry_type: {entry_type}. Valid types are: bill, cash, stock, gold, remarks"}
        
#         # Begin transaction
#         trans = conn.begin()
        
#         try:
#             # Handle remark insertion if provided
#             if remark_text and remark_text.strip():
#                 remark_query = text("""
#                     INSERT INTO remarks (gstin, remark) 
#                     VALUES (:gstin, :remark_text) 
#                     RETURNING remark_id
#                 """)
#                 result = conn.execute(remark_query, {
#                     'gstin': gstin,
#                     'remark_text': remark_text.strip()
#                 })
#                 remark_id = result.fetchone()[0]
            
#             # Handle main entry insertion based on type
#             if entry_type == 'bill':
#                 bill_query = text("""
#                     INSERT INTO bill (bill_no, gstin, purity, wt, rate, dated, bank)
#                     VALUES (:bill_no, :gstin, :purity, :wt, :rate, :dated, :bank)
#                     RETURNING id
#                 """)
#                 result = conn.execute(bill_query, {
#                     'bill_no': bill_no.strip(),
#                     'gstin': gstin,
#                     'purity': purity,
#                     'wt': wt,
#                     'rate': rate,
#                     'dated': dated,
#                     'bank': bank
#                 })
#                 entry_id = result.fetchone()[0]
#                 amount = Decimal(str(wt)) * Decimal(str(rate))
                
#             elif entry_type == 'cash':
#                 cash_query = text("""
#                     INSERT INTO cash (gstin, amount, dated, bank)
#                     VALUES (:gstin, :amount, :dated, :bank)
#                     RETURNING id
#                 """)
#                 result = conn.execute(cash_query, {
#                     'gstin': gstin,
#                     'amount': cash_amount,
#                     'dated': dated,
#                     'bank': bank
#                 })
#                 entry_id = result.fetchone()[0]
#                 amount = cash_amount
                
#             elif entry_type in ['stock', 'gold']:
#                 stock_query = text("""
#                     INSERT INTO stock (gstin, purity, weight, dated, bank)
#                     VALUES (:gstin, :purity, :weight, :dated, :bank)
#                     RETURNING id
#                 """)
#                 result = conn.execute(stock_query, {
#                     'gstin': gstin,
#                     'purity': purity,
#                     'weight': weight,
#                     'dated': dated,
#                     'bank': bank
#                 })
#                 entry_id = result.fetchone()[0]
#                 amount = weight
                
#             elif entry_type == 'remarks':
#                 entry_id = remark_id
#                 amount = None
            
#             # Validate that we have a valid entry_id
#             if entry_id is None:
#                 return {"status": "error", "message": f"Failed to generate entry_id for {entry_type} entry"}
            
#             # Insert into journal table
#             journal_query = text("""
#                 INSERT INTO journal (timestamp, gstin, entry_type, entry_id, amount, dated, bank, remark_id)
#                 VALUES (:timestamp, :gstin, :entry_type, :entry_id, :amount, :dated, :bank, :remark_id)
#                 RETURNING timestamp, entry_type, entry_id, amount, remark_id
#             """)
            
#             result = conn.execute(journal_query, {
#                 'timestamp': journal_timestamp,
#                 'gstin': gstin,
#                 'entry_type': entry_type,
#                 'entry_id': entry_id,
#                 'amount': amount,
#                 'dated': dated,
#                 'bank': bank,
#                 'remark_id': remark_id
#             })
            
#             journal_row = result.fetchone()
            
#             # Commit transaction
#             trans.commit()
            
#             return {
#                 "status": "success",
#                 "journal_ts": journal_row[0],
#                 "entry_type": journal_row[1],
#                 "entry_id": journal_row[2],
#                 "amount": journal_row[3],
#                 "remark_id": journal_row[4]
#             }
            
#         except Exception as e:
#             # Rollback transaction on error
#             trans.rollback()
            
#             # Handle specific database errors
#             error_message = str(e)
#             if "unique" in error_message.lower():
#                 return {"status": "error", "message": f"Duplicate entry detected for {entry_type}"}
#             elif "foreign key" in error_message.lower():
#                 return {"status": "error", "message": f"Referenced record does not exist for {entry_type}"}
#             elif "check" in error_message.lower():
#                 return {"status": "error", "message": f"Data violates table constraints for {entry_type}"}
#             else:
#                 return {"status": "error", "message": f"Database error: {error_message}"}
                
#     except Exception as e:
#         return {"status": "error", "message": f"Function failed: {str(e)}"}
        
#     finally:
#         conn.close()

def unified_insert_journal_entry(
    entry_type_or_data,  # Can be string (entry_type) or dict (data)
    gstin: Optional[str] = None,
    dated: Optional[date] = None,
    bank: bool = False,
    remark_text: Optional[str] = None,
    bill_no: Optional[str] = None,
    purity: Optional[str] = None,
    wt: Optional[Union[float, Decimal]] = None,
    rate: Optional[Union[float, Decimal]] = None,
    cgst: Optional[Union[float, Decimal]] = None,
    sgst: Optional[Union[float, Decimal]] = None,
    igst: Optional[Union[float, Decimal]] = None,
    weight: Optional[Union[float, Decimal]] = None,
    cash_amount: Optional[Union[float, Decimal]] = None,
    use_entry_table: bool = False  # For backward compatibility
) -> Dict[str, Any]:
    """
    Python wrapper to call the PostgreSQL unified_insert_journal_entry function.
    
    Args:
        entry_type_or_data: Either a string (entry_type) or dict containing all data
        gstin: GST identification number (if not using dict)
        dated: Date of entry (defaults to current date)
        bank: Whether this is a bank transaction
        remark_text: Optional remark text
        bill_no: Bill number (required for 'bill' type)
        purity: Purity specification
        wt: Weight (required for 'bill' type)
        rate: Rate (required for 'bill' type)
        cgst: Central GST amount
        sgst: State GST amount
        igst: Integrated GST amount
        weight: Weight (required for 'stock'/'gold' types)
        cash_amount: Cash amount (required for 'cash' type)
        use_entry_table: For backward compatibility (ignored)
    
    Returns:
        Dict containing status and results from the SQL function
    """
    
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "Failed to get a database connection."}
    
    # Start a transaction explicitly
    trans = conn.begin()
    
    try:
        # Handle both dict and individual parameter formats
        if isinstance(entry_type_or_data, dict):
            # Extract parameters from dictionary
            data = entry_type_or_data
            entry_type = data.get('entry_type')
            gstin = data.get('gstin')
            dated = data.get('dated')
            bank = data.get('is_bank', data.get('bank', False))
            remark_text = data.get('remark_text')
            bill_no = data.get('bill_no')
            purity = data.get('purity')
            wt = data.get('wt')
            rate = data.get('rate')
            cgst = data.get('cgst')
            sgst = data.get('sgst')
            igst = data.get('igst')
            weight = data.get('weight')
            cash_amount = data.get('cash_amount', data.get('amount'))  # Handle both 'cash_amount' and 'amount'
        else:
            # Use individual parameters
            entry_type = entry_type_or_data
        
        # Handle date conversion if it's a string
        if isinstance(dated, str):
            from datetime import datetime
            dated = datetime.strptime(dated, '%Y-%m-%d').date()
        
        # Set default date if not provided
        if dated is None:
            dated = date.today()
        
        # Call the PostgreSQL function
        query = text("""
            SELECT * FROM public.unified_insert_journal_entry(
                p_entry_type := :entry_type,
                p_gstin := :gstin,
                p_dated := :dated,
                p_bank := :bank,
                p_remark_text := :remark_text,
                p_bill_no := :bill_no,
                p_purity := :purity,
                p_wt := :wt,
                p_rate := :rate,
                p_cgst := :cgst,
                p_sgst := :sgst,
                p_igst := :igst,
                p_weight := :weight,
                p_cash_amount := :cash_amount
            )
        """)
        
        import logging
        logging.basicConfig(level=logging.INFO)
        
        # Create debug query (be careful with None values)
        def safe_format(value):
            if value is None:
                return 'NULL'
            elif isinstance(value, str):
                return f"'{value}'"
            elif isinstance(value, bool):
                return str(value).lower()
            else:
                return str(value)
        
        query2 = f"""
            SELECT * FROM public.unified_insert_journal_entry(
                p_entry_type := {safe_format(entry_type)},
                p_gstin := {safe_format(gstin)},
                p_dated := {safe_format(dated)},
                p_bank := {safe_format(bank)},
                p_remark_text := {safe_format(remark_text)},
                p_bill_no := {safe_format(bill_no)},
                p_purity := {safe_format(purity)},
                p_wt := {safe_format(wt)},
                p_rate := {safe_format(rate)},
                p_cgst := {safe_format(cgst)},
                p_sgst := {safe_format(sgst)},
                p_igst := {safe_format(igst)},
                p_weight := {safe_format(weight)},
                p_cash_amount := {safe_format(cash_amount)}
            )
        """
        
        try:
            logging.info(f"Executing query: {query2}")
        except Exception as e:
            logging.info("Failed to log query parameters, continuing with execution")
            logging.error(f"Error occurred during query logging: {str(e)}", exc_info=True)
        
        logging.info("Query execution started")
         
        # Execute the query
        result = conn.execute(query, {
            'entry_type': entry_type,
            'gstin': gstin,
            'dated': dated,
            'bank': bank,
            'remark_text': remark_text,
            'bill_no': bill_no,
            'purity': purity,
            'wt': wt,
            'rate': rate,
            'cgst': cgst,
            'sgst': sgst,
            'igst': igst,
            'weight': weight,
            'cash_amount': cash_amount
        })
        
        # Fetch the result
        row = result.fetchone()
        logging.info(f"Query executed successfully, fetched row: {row}")
        
        if row:
            # CRITICAL: Commit the transaction before returning success
            trans.commit()
            logging.info("Transaction committed successfully")
            
            # Verify the insert (optional but good for debugging)
            try:
                verify_query = text("SELECT COUNT(*) FROM stock WHERE id = :entry_id")
                verify_result = conn.execute(verify_query, {'entry_id': row[2]})
                count = verify_result.scalar()
                logging.info(f"Verification: Found {count} records with entry_id {row[2]}")
            except Exception as verify_error:
                logging.warning(f"Verification query failed: {verify_error}")
            
            return {
                "status": "success",
                "journal_ts": row[0],          # journal_ts
                "entry_type": row[1],          # returned_entry_type
                "entry_id": row[2],            # returned_entry_id
                "amount": row[3],              # returned_amount
                "remark_id": row[4]            # returned_remark_id
            }
        else:
            # Rollback if no result
            trans.rollback()
            logging.error("No result returned from function - rolling back transaction")
            return {"status": "error", "message": "No result returned from function"}
            
    except Exception as e:
        # Rollback transaction on error
        try:
            trans.rollback()
            logging.error("Transaction rolled back due to error")
        except:
            logging.error("Failed to rollback transaction")
        
        error_msg = str(e)
        logging.error(f"Database error: {error_msg}", exc_info=True)
        return {
            "status": "error", 
            "message": f"Database error: {error_msg}",
            "error_type": type(e).__name__
        }
        
    finally:
        # Close the connection
        try:
            conn.close()
            logging.info("Database connection closed")
        except Exception as close_error:
            logging.error(f"Error closing connection: {close_error}")

# def unified_insert_journal_entry(
#     entry_type_or_data,  # Can be string (entry_type) or dict (data)
#     gstin: Optional[str] = None,
#     dated: Optional[date] = None,
#     bank: bool = False,
#     remark_text: Optional[str] = None,
#     bill_no: Optional[str] = None,
#     purity: Optional[str] = None,
#     wt: Optional[Union[float, Decimal]] = None,
#     rate: Optional[Union[float, Decimal]] = None,
#     cgst: Optional[Union[float, Decimal]] = None,
#     sgst: Optional[Union[float, Decimal]] = None,
#     igst: Optional[Union[float, Decimal]] = None,
#     weight: Optional[Union[float, Decimal]] = None,
#     cash_amount: Optional[Union[float, Decimal]] = None,
#     use_entry_table: bool = False  # For backward compatibility
# ) -> Dict[str, Any]:
#     """
#     Python wrapper to call the PostgreSQL unified_insert_journal_entry function.
    
#     Args:
#         entry_type_or_data: Either a string (entry_type) or dict containing all data
#         gstin: GST identification number (if not using dict)
#         dated: Date of entry (defaults to current date)
#         bank: Whether this is a bank transaction
#         remark_text: Optional remark text
#         bill_no: Bill number (required for 'bill' type)
#         purity: Purity specification
#         wt: Weight (required for 'bill' type)
#         rate: Rate (required for 'bill' type)
#         cgst: Central GST amount
#         sgst: State GST amount
#         igst: Integrated GST amount
#         weight: Weight (required for 'stock'/'gold' types)
#         cash_amount: Cash amount (required for 'cash' type)
#         use_entry_table: For backward compatibility (ignored)
    
#     Returns:
#         Dict containing status and results from the SQL function
#     """
    
#     conn = get_db_connection()
#     if not conn:
#         return {"status": "error", "message": "Failed to get a database connection."}
    
#     try:
#         # Handle both dict and individual parameter formats
#         if isinstance(entry_type_or_data, dict):
#             # Extract parameters from dictionary
#             data = entry_type_or_data
#             entry_type = data.get('entry_type')
#             gstin = data.get('gstin')
#             dated = data.get('dated')
#             bank = data.get('is_bank', data.get('bank', False))
#             remark_text = data.get('remark_text')
#             bill_no = data.get('bill_no')
#             purity = data.get('purity')
#             wt = data.get('wt')
#             rate = data.get('rate')
#             cgst = data.get('cgst')
#             sgst = data.get('sgst')
#             igst = data.get('igst')
#             weight = data.get('weight')
#             cash_amount = data.get('cash_amount', data.get('amount'))  # Handle both 'cash_amount' and 'amount'
#         else:
#             # Use individual parameters
#             entry_type = entry_type_or_data
        
#         # Handle date conversion if it's a string
#         if isinstance(dated, str):
#             from datetime import datetime
#             dated = datetime.strptime(dated, '%Y-%m-%d').date()
        
#         # Set default date if not provided
#         if dated is None:
#             dated = date.today()
        
#         # Call the PostgreSQL function
#         query = text("""
#             SELECT * FROM public.unified_insert_journal_entry(
#                 p_entry_type := :entry_type,
#                 p_gstin := :gstin,
#                 p_dated := :dated,
#                 p_bank := :bank,
#                 p_remark_text := :remark_text,
#                 p_bill_no := :bill_no,
#                 p_purity := :purity,
#                 p_wt := :wt,
#                 p_rate := :rate,
#                 p_cgst := :cgst,
#                 p_sgst := :sgst,
#                 p_igst := :igst,
#                 p_weight := :weight,
#                 p_cash_amount := :cash_amount
#             )
#         """)
#         import logging
#         logging.basicConfig(level=logging.INFO)
#         query2 = f"""
#             SELECT * FROM public.unified_insert_journal_entry(
#             p_entry_type := '{entry_type}',
#             p_gstin := '{gstin}',
#             p_dated := '{dated}',
#             p_bank := {bank},
#             p_remark_text := '{remark_text}',
#             p_bill_no := '{bill_no}',
#             p_purity := '{purity}',
#             p_wt := {wt},
#             p_rate := {rate},
#             p_cgst := {cgst},
#             p_sgst := {sgst},
#             p_igst := {igst},
#             p_weight := {weight},
#             p_cash_amount := {cash_amount}
#             )
#         """
#         try:
#             logging.info(query2)
#         except  Exception as e:
#             logging.info("Failed to log query parameters, continuing with execution") 
#             logging.error(f"Error occurred during unified_insert_journal_entry execution: {str(e)}", exc_info=True)
       
#         finally:
#             logging.info("Query execution started")
         
#         # Log the query using Flask's logging system
#         result = conn.execute(query, {
#             'entry_type': entry_type,
#             'gstin': gstin,
#             'dated': dated,
#             'bank': bank,
#             'remark_text': remark_text,
#             'bill_no': bill_no,
#             'purity': purity,
#             'wt': wt,
#             'rate': rate,
#             'cgst': cgst,
#             'sgst': sgst,
#             'igst': igst,
#             'weight': weight,
#             'cash_amount': cash_amount
#         })
#         # result = conn.execute(query2)
        
#         # Fetch the result
#         row = result.fetchone()
#         logging.info(f"Query executed successfully, fetched row: {row}")
        
#         if row:
#             return {
#                 "status": "success",
#                 "journal_ts": row[0],          # journal_ts
#                 "entry_type": row[1],          # returned_entry_type
#                 "entry_id": row[2],            # returned_entry_id
#                 "amount": row[3],              # returned_amount
#                 "remark_id": row[4]            # returned_remark_id
#             }
#         else:
#             return {"status": "error", "message": "No result returned from function"}
            
#     except Exception as e:
#         error_msg = str(e)
#         return {
#             "status": "error", 
#             "message": f"Database error: {error_msg}",
#             "error_type": type(e).__name__
#         }
        
#     finally:
#         conn.close()


def unified_insert_journal_entry_from_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Wrapper that accepts a dictionary of parameters for easier integration.
    
    Args:
        data: Dictionary containing all the parameters
        
    Returns:
        Result from unified_insert_journal_entry function
    """
    return unified_insert_journal_entry(data)


# Backward compatibility function that matches your original signature
def unified_insert_journal_entry_legacy(data: Dict[str, Any], use_entry_table: bool = False) -> Dict[str, Any]:
    """
    Legacy function that matches the original signature for backward compatibility.
    
    Args:
        data: Dictionary containing entry parameters
        use_entry_table: Whether to use entry table (ignored, maintained for compatibility)
        
    Returns:
        Result from the PostgreSQL function
    """
    return unified_insert_journal_entry(data)


def insert_bill_entry(
    gstin: str,
    bill_no: str,
    wt: Union[float, Decimal],
    rate: Union[float, Decimal],
    purity: Optional[str] = None,
    dated: Optional[date] = None,
    bank: bool = False,
    remark_text: Optional[str] = None,
    cgst: Optional[Union[float, Decimal]] = None,
    sgst: Optional[Union[float, Decimal]] = None,
    igst: Optional[Union[float, Decimal]] = None
) -> Dict[str, Any]:
    """
    Specialized function for inserting bill entries.
    """
    return unified_insert_journal_entry(
        entry_type='bill',
        gstin=gstin,
        bill_no=bill_no,
        wt=wt,
        rate=rate,
        purity=purity,
        dated=dated,
        bank=bank,
        remark_text=remark_text,
        cgst=cgst,
        sgst=sgst,
        igst=igst
    )


def insert_cash_entry(
    gstin: str,
    cash_amount: Union[float, Decimal],
    dated: Optional[date] = None,
    bank: bool = False,
    remark_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Specialized function for inserting cash entries.
    """
    return unified_insert_journal_entry(
        entry_type='cash',
        gstin=gstin,
        cash_amount=cash_amount,
        dated=dated,
        bank=bank,
        remark_text=remark_text
    )


def insert_stock_entry(
    gstin: str,
    weight: Union[float, Decimal],
    purity: Optional[str] = None,
    dated: Optional[date] = None,
    bank: bool = False,
    remark_text: Optional[str] = None,
    entry_type: str = 'stock'  # can be 'stock' or 'gold'
) -> Dict[str, Any]:
    """
    Specialized function for inserting stock/gold entries.
    """
    return unified_insert_journal_entry(
        entry_type=entry_type,
        gstin=gstin,
        weight=weight,
        purity=purity,
        dated=dated,
        bank=bank,
        remark_text=remark_text
    )


def insert_remark_entry(
    gstin: str,
    remark_text: str,
    dated: Optional[date] = None,
    bank: bool = False
) -> Dict[str, Any]:
    """
    Specialized function for inserting remarks entries.
    """
    return unified_insert_journal_entry(
        entry_type='remarks',
        gstin=gstin,
        remark_text=remark_text,
        dated=dated,
        bank=bank
    )


def diagnose_cash_table() -> Dict[str, Any]:
    """
    Call the diagnostic function to check cash table status.
    """
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "Failed to get database connection"}
    
    try:
        query = text("SELECT * FROM public.diagnose_cash_table()")
        result = conn.execute(query)
        
        diagnostics = []
        for row in result:
            diagnostics.append({
                "check_type": row[0],
                "result": row[1],
                "details": row[2]
            })
        
        return {"status": "success", "diagnostics": diagnostics}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        conn.close()


def test_cash_insert() -> Dict[str, Any]:
    """
    Call the test function to verify cash table functionality.
    """
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "Failed to get database connection"}
    
    try:
        query = text("SELECT public.test_cash_insert()")
        result = conn.execute(query)
        
        test_result = result.fetchone()[0]
        
        return {
            "status": "success" if "SUCCESS" in test_result else "error",
            "message": test_result
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        conn.close()


def batch_insert_journal_entries(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Insert multiple journal entries in sequence.
    
    Args:
        entries: List of dictionaries, each containing parameters for an entry
        
    Returns:
        Dict with overall status and individual results
    """
    results = []
    successful = 0
    failed = 0
    
    for i, entry_data in enumerate(entries):
        try:
            result = unified_insert_journal_entry(entry_data)
            results.append({
                "entry_index": i,
                "entry_type": entry_data.get('entry_type'),
                "result": result
            })
            
            if result.get('status') == 'success':
                successful += 1
            else:
                failed += 1
                
        except Exception as e:
            results.append({
                "entry_index": i,
                "entry_type": entry_data.get('entry_type'),
                "result": {"status": "error", "message": str(e)}
            })
            failed += 1
    
    return {
        "status": "completed",
        "summary": {
            "total": len(entries),
            "successful": successful,
            "failed": failed
        },
        "results": results
    }


# Example usage and testing functions
def example_usage():
    """
    Example usage of the journal entry functions.
    """
    
    # Example 1: Insert a bill entry
    bill_result = insert_bill_entry(
        gstin="12ABCDE1234F1Z5",
        bill_no="BILL001",
        wt=10.5,
        rate=5000.00,
        purity="22K",
        bank=True,
        remark_text="Gold purchase from supplier A"
    )
    print("Bill Entry Result:", bill_result)
    
    # Example 2: Insert a cash entry
    cash_result = insert_cash_entry(
        gstin="12ABCDE1234F1Z5",
        cash_amount=25000.00,
        bank=False,
        remark_text="Cash deposit"
    )
    print("Cash Entry Result:", cash_result)
    
    # Example 3: Insert a stock entry
    stock_result = insert_stock_entry(
        gstin="12ABCDE1234F1Z5",
        weight=15.75,
        purity="24K",
        entry_type="gold",
        remark_text="Gold stock addition"
    )
    print("Stock Entry Result:", stock_result)
    
    # Example 4: Using dictionary approach
    entry_data = {
        'entry_type': 'cash',
        'gstin': '12ABCDE1234F1Z5',
        'cash_amount': 10000.00,
        'bank': True,
        'remark_text': 'Bank deposit'
    }
    dict_result = unified_insert_journal_entry(entry_data)
    print("Dictionary Entry Result:", dict_result)
    
    # Example 5: Batch insert
    batch_entries = [
        {
            'entry_type': 'cash',
            'gstin': '12ABCDE1234F1Z5',
            'cash_amount': 5000.00,
            'remark_text': 'Cash entry 1'
        },
        {
            'entry_type': 'cash',
            'gstin': '12ABCDE1234F1Z5',
            'cash_amount': 7500.00,
            'remark_text': 'Cash entry 2'
        }
    ]
    batch_result = batch_insert_journal_entries(batch_entries)
    print("Batch Insert Result:", batch_result)


if __name__ == "__main__":
    global get_db_connection,db,engine,Session
    
    from flask_sqlalchemy import SQLAlchemy
    from sqlalchemy import create_engine
    from sqlalchemy.orm import scoped_session, sessionmaker
    from sqlalchemy.sql import text

    db = SQLAlchemy()
    engine = None
    Session = None
    config = dict()
    config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:mysecret@db:5432/gold_db"
    def init_db(app):
        global engine, Session
        db.init_app(app)
        engine = create_engine(config["SQLALCHEMY_DATABASE_URI"])
        Session = scoped_session(sessionmaker(bind=engine))

    def get_db_connectionx():
        return engine.connect()
    get_db_connection = get_db_connectionx
    # Initialize the database connection
    # Run diagnostics
    print("=== Diagnostics ===")
    diag_result = diagnose_cash_table()
    print("Cash Table Diagnostics:", diag_result)
    
    test_result = test_cash_insert()
    print("Cash Insert Test:", test_result)
    
    # Run examples (uncomment to test)
    # print("\n=== Examples ===")
    # example_usage()