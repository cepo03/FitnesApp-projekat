from .db import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    plans = db.relationship('Plan', backref='user', lazy=True, cascade='all, delete-orphan')
    progress_days = db.relationship('ProgressDay', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {'id': self.id, 'username': self.username, 'email': self.email}
