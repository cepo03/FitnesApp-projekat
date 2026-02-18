from .db import db

class Plan(db.Model):
    __tablename__ = 'plans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration_months = db.Column(db.Integer, nullable=False)

    exercises = db.relationship('Exercise', backref='plan', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description or '',
            'duration_months': self.duration_months,
            'exercises': [e.to_dict() for e in self.exercises]
        }
