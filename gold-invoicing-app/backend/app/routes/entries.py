from flask import Blueprint, request, jsonify
from app.services.journal import insert_entry, delete_entry

entries_bp = Blueprint("entries", __name__, url_prefix="/entries")


@entries_bp.route("/insert", methods=["POST"])
def insert():
    data = request.json

    required_fields = ["entry_type", "gstin", "dated"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    result = insert_entry(
        data.get("entry_type"),
        data.get("gstin"),
        data.get("dated"),
        data.get("bank", False),
        data.get("remark"),
        data.get("bill_no"),
        data.get("purity"),
        data.get("weight"),
        data.get("rate"),
        data.get("making_charge"),
        data.get("wastage"),
        data.get("discount"),
        data.get("gold_weight"),
        data.get("cash_amount")
    )

    return jsonify({"status": "success", "result": [str(val) for val in result]})


@entries_bp.route("/delete", methods=["POST"])
def delete():
    data = request.json
    if "entry_type" not in data or "entry_id" not in data or "reason" not in data:
        return jsonify({"error": "entry_type, entry_id and reason are required"}), 400

    result = delete_entry(data["entry_type"], data["entry_id"], data["reason"])

    return jsonify({"status": "deleted", "result": [str(val) for val in result]})