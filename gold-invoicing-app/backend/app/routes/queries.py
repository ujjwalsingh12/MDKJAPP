# routes/queries.py

from flask import Blueprint, request, jsonify
from app.services.queries import (
    get_table_data,
    insert_record,
    update_record_by_id,
    delete_record_by_id,
    unified_insert_journal_entry,
    batch_insert_journal_entries,
    unified_update_journal_entry,
    unified_delete_journal_entry,
    run_free_query,
    get_table_schema
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
    
@queries_bp.route("/journal/update", methods=["POST"])
def update_journal_entry():
    """
    API endpoint to update an existing financial entry and log it in the journal.
    Accepts a JSON payload similar to the insert endpoint, but must include 'entry_id'.
    """
    try:
        data = request.json

        if not data or "entry_id" not in data:
            return jsonify({"status": "error", "message": "Missing 'entry_id' in request body"}), 400

        result = unified_update_journal_entry(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@queries_bp.route("/journal/delete", methods=["POST"])
def delete_journal_entry():
    """
    API endpoint to delete an existing financial entry and log the deletion in the journal.
    Accepts a JSON payload with 'entry_type' and 'entry_id'.
    Optionally accepts 'remark_text' to log a reason for deletion.
    """
    try:
        data = request.json

        if not data or "entry_type" not in data or "entry_id" not in data:
            return jsonify({"status": "error", "message": "Missing 'entry_type' or 'entry_id' in request body"}), 400

        result = unified_delete_journal_entry(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@queries_bp.route("/journal/entries", methods=["POST"])
def add_batch_journal_entries():
    """
    Batch endpoint to insert multiple journal entries atomically.
    Accepts a list of entry dictionaries in JSON payload.
    Rolls back all inserts if any one fails.
    """
    try:
        data = request.json

        if not isinstance(data, list):
            return jsonify({"status": "error", "message": "Payload must be a list of journal entry objects"}), 400

        result = batch_insert_journal_entries(data)
        return jsonify(result), 200 if result["status"] == "success" else 500

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "error_type": type(e).__name__
        }), 500
    
    
@queries_bp.route("/<table>/schema", methods=["GET"])
def get_table_schema_route(table):
    try:
        result = get_table_schema(table)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@queries_bp.route("/free", methods=["POST"])
def execute_free_query():
    """
    API endpoint to execute a free-form SQL query with pagination and password.
    Input JSON:
    {
        "password": "mysecret",     # required
        "query": "SELECT * FROM table_name",
        "page": 1,
        "page_size": 20,
        "sort_by": "column_name",
        "sort_order": "asc"
    }
    """
    try:
        data = request.json
        raw_query = data.get("query")
        password = data.get("password")

        # Define your actual password here
        REQUIRED_PASSWORD = "mdkjpass"

        if not password or password != REQUIRED_PASSWORD:
            return jsonify({"status": "error", "message": "Invalid password"}), 403

        if not raw_query:
            return jsonify({"status": "error", "message": "Missing SQL 'query'"}), 400

        page = int(data.get("page", 1))
        page_size = int(data.get("page_size", 50))
        sort_by = data.get("sort_by")
        sort_order = data.get("sort_order", "asc")

        results = run_free_query(raw_query, page, page_size, sort_by, sort_order)
        return jsonify({"status": "success", "data": results})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500