# from flask import Flask
# from flask_sqlalchemy import SQLAlchemy
# from config import Config

# db = SQLAlchemy()

# def create_app():
#     app = Flask(__name__)
#     app.config.from_object(Config)
#     db.init_app(app)

#     # Blueprints
#     from app.routes.entries import entries_bp
#     app.register_blueprint(entries_bp)

#     return app
from flask import Flask
from config import Config
from db import db, init_db
from flask_cors import CORS  # ✅ Add this import

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ Enable CORS for all routes (customize origin as needed)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database connections
    init_db(app)

    # Register blueprints
    from app.routes.entries import entries_bp
    from app.routes.customer import customer_bp
    from app.routes.queries import queries_bp

    app.register_blueprint(entries_bp, url_prefix="/api/entries")
    app.register_blueprint(customer_bp, url_prefix="/api/customers")
    app.register_blueprint(queries_bp, url_prefix="/api/queries")

    @app.route("/")
    def home():
        return {"message": "Flask + PostgreSQL app running successfully."}

    return app