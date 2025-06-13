from . import db

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer = db.Column(db.String(100))
    amount = db.Column(db.Float)
    created_at = db.Column(db.DateTime, server_default=db.func.now())