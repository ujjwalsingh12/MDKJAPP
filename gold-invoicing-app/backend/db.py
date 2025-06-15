from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

db = SQLAlchemy()
engine = None
Session = None

def init_db(app):
    global engine, Session
    db.init_app(app)
    engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])
    Session = scoped_session(sessionmaker(bind=engine))

def get_db_connection():
    return engine.connect()