from .db import db

class Exercise(db.Model):
    __tablename__ = 'exercises'
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey('plans.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    repetitions = db.Column(db.Integer, nullable=False)
    sets = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'plan_id': self.plan_id,
            'name': self.name,
            'repetitions': self.repetitions,
            'sets': self.sets
        }
