from sqlalchemy import text
from db import db

def insert_entry(entry_type, gstin, dated, bank, remark, bill_no,
                 purity, weight, rate, making_charge, wastage,
                 discount, gold_weight, cash_amount):

    sql = text("""
        SELECT * FROM unified_insert_journal_entry(
            :entry_type, :gstin, :dated, :bank, :remark,
            :bill_no, :purity, :weight, :rate,
            :making_charge, :wastage, :discount,
            :gold_weight, :cash_amount
        );
    """)

    result = db.session.execute(sql, {
        'entry_type': entry_type,
        'gstin': gstin,
        'dated': dated,
        'bank': bank,
        'remark': remark,
        'bill_no': bill_no,
        'purity': purity,
        'weight': weight,
        'rate': rate,
        'making_charge': making_charge,
        'wastage': wastage,
        'discount': discount,
        'gold_weight': gold_weight,
        'cash_amount': cash_amount
    })

    db.session.commit()
    return result.fetchone()


def delete_entry(entry_type, entry_id, reason):
    sql = text("""
        SELECT * FROM unified_update_or_delete_entry(
            :entry_type, :entry_id, 'delete', NULL, :reason
        );
    """)
    result = db.session.execute(sql, {
        'entry_type': entry_type,
        'entry_id': entry_id,
        'reason': reason
    })

    db.session.commit()
    return result.fetchone()