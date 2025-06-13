from flask import Blueprint, jsonify

queries_bp = Blueprint("queries", __name__, url_prefix="/queries")

@queries_bp.route("/health")
def check():
    return jsonify(status="queries OK")