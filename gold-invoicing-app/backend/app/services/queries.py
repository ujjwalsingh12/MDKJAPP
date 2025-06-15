from db import get_db_connection
import pandas as pd

def get_all_entries():
    conn = get_db_connection()
    df = pd.read_sql("SELECT * FROM journal", conn)
    conn.close()
    return df.to_dict(orient="records")

def get_entries_by_customer(gstin):
    conn = get_db_connection()
    df = pd.read_sql(
        "SELECT * FROM journal WHERE gstin = %s", conn, params=(gstin,)
    )
    conn.close()
    return df.to_dict(orient="records")

def get_summary_by_type():
    conn = get_db_connection()
    df = pd.read_sql("SELECT entry_type, COUNT(*) AS count FROM journal GROUP BY entry_type", conn)
    conn.close()
    return df.to_dict(orient="records")