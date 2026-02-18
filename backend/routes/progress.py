from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from models import db, ProgressDay

progress_bp = Blueprint('progress', __name__)

def _uid():
    raw = get_jwt_identity()
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None

@progress_bp.route('/days', methods=['GET'])
@jwt_required()
def list_days():
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    if year and month:
        from sqlalchemy import and_, extract
        days = ProgressDay.query.filter(
            ProgressDay.user_id == uid,
            extract('year', ProgressDay.day_date) == year,
            extract('month', ProgressDay.day_date) == month
        ).all()
    else:
        days = ProgressDay.query.filter_by(user_id=uid).order_by(ProgressDay.day_date.desc()).limit(365).all()
    return jsonify([d.to_dict() for d in days])

@progress_bp.route('/days', methods=['POST'])
@jwt_required()
def mark_day():
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    data = request.get_json(silent=True) or {}
    if not data or not data.get('day_date'):
        return jsonify({'error': 'day_date required (YYYY-MM-DD)'}), 400
    try:
        d = datetime.strptime(data['day_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    existing = ProgressDay.query.filter_by(user_id=uid, day_date=d).first()
    if existing:
        existing.notes = data.get('notes', existing.notes)
        db.session.commit()
        return jsonify(existing.to_dict())
    day = ProgressDay(user_id=uid, day_date=d, notes=data.get('notes', ''))
    db.session.add(day)
    db.session.commit()
    return jsonify(day.to_dict()), 201

@progress_bp.route('/days/<date_str>', methods=['DELETE'])
@jwt_required()
def unmark_day(date_str):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    try:
        d = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    day = ProgressDay.query.filter_by(user_id=uid, day_date=d).first()
    if not day:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(day)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200

@progress_bp.route('/stats', methods=['GET'])
@jwt_required()
def stats():
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    from sqlalchemy import func, extract
    today = date.today()
    total = db.session.query(func.count(ProgressDay.id)).filter(ProgressDay.user_id == uid).scalar()
    this_month = db.session.query(func.count(ProgressDay.id)).filter(
        ProgressDay.user_id == uid,
        extract('year', ProgressDay.day_date) == today.year,
        extract('month', ProgressDay.day_date) == today.month
    ).scalar()
    return jsonify({'total_days': total or 0, 'this_month': this_month or 0})
