from .db import db
from datetime import date

class ProgressDay(db.Model):
    __tablename__ = 'progress_days'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    day_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    __table_args__ = (db.UniqueConstraint('user_id', 'day_date', name='unique_user_day'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'day_date': self.day_date.isoformat(),
            'notes': self.notes or ''
        }
