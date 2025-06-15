# services/queries.py

from db import get_db_connection
import pandas as pd

def run_paginated_query(query, conn, params=(), page=1, page_size=20, sort_by=None, sort_order='asc'):
    base_query = query.strip().rstrip(';')
    if sort_by:
        base_query += f" ORDER BY {sort_by} {sort_order.upper()}"
    offset = (page - 1) * page_size
    base_query += f" LIMIT {page_size} OFFSET {offset}"
    df = pd.read_sql(base_query, conn, params=params)
    return df.to_dict(orient="records")


def get_table_data(table_name, page=1, page_size=20, sort_by=None, sort_order='asc', start_date=None, end_date=None):
    conn = get_db_connection()
    query = f"SELECT * FROM {table_name}"
    params = []

    if start_date and end_date:
        query += " WHERE dated BETWEEN %s AND %s"
        params.extend([start_date, end_date])

    result = run_paginated_query(query, conn, params, page, page_size, sort_by, sort_order)
    conn.close()
    return result


def get_data_by_gstin(table_name, gstin):
    conn = get_db_connection()
    df = pd.read_sql(f"SELECT * FROM {table_name} WHERE gstin = %s", conn, params=(gstin,))
    conn.close()
    return df.to_dict(orient="records")


def insert_record(table_name, data):
    conn = get_db_connection()
    cols = ', '.join(data.keys())
    placeholders = ', '.join(['%s'] * len(data))
    values = tuple(data.values())
    query = f"INSERT INTO {table_name} ({cols}) VALUES ({placeholders})"

    with conn:
        conn.cursor().execute(query, values)
    conn.close()
    return {"status": "success"}


def update_record_by_id(table_name, record_id, data):
    conn = get_db_connection()
    set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
    values = list(data.values())
    query = f"UPDATE {table_name} SET {set_clause} WHERE id = %s"
    values.append(record_id)

    with conn:
        conn.cursor().execute(query, values)
    conn.close()
    return {"status": "updated"}


def delete_record_by_id(table_name, record_id):
    conn = get_db_connection()
    with conn:
        conn.cursor().execute(f"DELETE FROM {table_name} WHERE id = %s", (record_id,))
    conn.close()
    return {"status": "deleted"}