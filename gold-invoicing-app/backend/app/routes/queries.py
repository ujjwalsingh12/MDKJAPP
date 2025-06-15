from flask import Blueprint, request, jsonify
from app.services.queries import get_all_entries, get_entries_by_customer, get_summary_by_type

queries_bp = Blueprint("queries_bp", __name__)

@queries_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

@queries_bp.route("/entries/all", methods=["GET"])
def all_entries():
    try:
        result = get_all_entries()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@queries_bp.route("/entries/customer/<gstin>", methods=["GET"])
def entries_by_customer(gstin):
    try:
        result = get_entries_by_customer(gstin)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@queries_bp.route("/summary/type", methods=["GET"])
def summary_by_type():
    try:
        result = get_summary_by_type()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500