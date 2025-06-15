from flask import Blueprint, request, jsonify
from app.services.queries import (
    get_all_entries,
    get_entries_by_customer,
    get_summary_by_type,
    get_all_bills,
    get_bills_by_customer,
    get_all_cash,
    get_customer_details
)

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


@queries_bp.route("/bills/all", methods=["GET"])
def all_bills():
    try:
        result = get_all_bills()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@queries_bp.route("/bills/customer/<gstin>", methods=["GET"])
def bills_by_customer(gstin):
    try:
        result = get_bills_by_customer(gstin)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@queries_bp.route("/cash/all", methods=["GET"])
def all_cash():
    try:
        result = get_all_cash()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@queries_bp.route("/customer/<gstin>", methods=["GET"])
def customer_details(gstin):
    try:
        result = get_customer_details(gstin)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500