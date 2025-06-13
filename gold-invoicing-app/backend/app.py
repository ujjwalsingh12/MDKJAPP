from flask import Flask
from config import Config
from db import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    # Register Blueprints
    from routes.entries import entries_bp
    from routes.customer import customer_bp
    from routes.queries import queries_bp
    app.register_blueprint(entries_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(queries_bp)

    return app