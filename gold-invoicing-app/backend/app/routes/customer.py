from flask import Blueprint, jsonify

customer_bp = Blueprint("customer", __name__, url_prefix="/customer")

@customer_bp.route("/health")
def check():
    return jsonify(status="customer OK")