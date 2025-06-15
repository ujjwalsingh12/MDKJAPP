# routes/queries.py

from flask import Blueprint, request, jsonify
from app.services.queries import (
    get_table_data,
    get_data_by_gstin,
    insert_record,
    update_record_by_id,
    delete_record_by_id,
    unified_insert_journal_entry
)

queries_bp = Blueprint("queries_bp", __name__)

@queries_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@queries_bp.route("/<table>/all", methods=["GET"])
def get_all_records(table):
    try:
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", 20))
        sort_by = request.args.get("sort_by")
        sort_order = request.args.get("sort_order", "asc")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        result = get_table_data(table, page, page_size, sort_by, sort_order, start_date, end_date)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@queries_bp.route("/<table>/customer/<gstin>", methods=["GET"])
def get_by_gstin(table, gstin):
    try:
        result = get_data_by_gstin(table, gstin)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@queries_bp.route("/<table>/add", methods=["POST"])
def add_record(table):
    try:
        data = request.json
        result = insert_record(table, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@queries_bp.route("/<table>/update/<int:record_id>", methods=["PUT"])
def update_record(table, record_id):
    try:
        data = request.json
        result = update_record_by_id(table, record_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@queries_bp.route("/<table>/delete/<int:record_id>", methods=["DELETE"])
def delete_record(table, record_id):
    try:
        result = delete_record_by_id(table, record_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@queries_bp.route("/journal/entry", methods=["POST"])
def add_journal_entry():
    try:
        data = request.json
        use_entry_table = data.get("journal", False)  # default to "journal"
        result = unified_insert_journal_entry(data, use_entry_table)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500