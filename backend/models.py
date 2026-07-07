from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


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


__all__ = ['User', 'Plan', 'Exercise', 'ProgressDay', 'db']
