from .entries import entries_bp
from .customer import customer_bp
from .queries import queries_bp

def register_routes(app):
    app.register_blueprint(entries_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(queries_bp)