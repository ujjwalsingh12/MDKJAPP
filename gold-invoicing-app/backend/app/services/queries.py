from sqlalchemy import text

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def fetch_all_entries():
    sql = text("""
        SELECT * FROM journal_entry
        ORDER BY id DESC
        LIMIT 100
    """)
    result = db.session.execute(sql)
    rows = [dict(row) for row in result.fetchall()]
    return rows