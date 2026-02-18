from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Plan, Exercise

exercises_bp = Blueprint('exercises', __name__)

def _uid():
    raw = get_jwt_identity()
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None

def _get_plan_for_user(plan_id, user_id):
    return Plan.query.filter_by(id=plan_id, user_id=user_id).first()

@exercises_bp.route('/<int:plan_id>/exercises', methods=['GET'])
@jwt_required()
def list_exercises(plan_id):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plan = _get_plan_for_user(plan_id, uid)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    return jsonify([e.to_dict() for e in plan.exercises])

@exercises_bp.route('/<int:plan_id>/exercises', methods=['POST'])
@jwt_required()
def add_exercise(plan_id):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plan = _get_plan_for_user(plan_id, uid)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    data = request.get_json(silent=True) or {}
    if not data or not data.get('name'):
        return jsonify({'error': 'Exercise name required'}), 400
    ex = Exercise(
        plan_id=plan_id,
        name=data['name'],
        repetitions=data.get('repetitions', 10),
        sets=data.get('sets', 3)
    )
    db.session.add(ex)
    db.session.commit()
    return jsonify(ex.to_dict()), 201

@exercises_bp.route('/<int:plan_id>/exercises/<int:ex_id>', methods=['PUT'])
@jwt_required()
def update_exercise(plan_id, ex_id):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plan = _get_plan_for_user(plan_id, uid)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    ex = Exercise.query.filter_by(id=ex_id, plan_id=plan_id).first()
    if not ex:
        return jsonify({'error': 'Exercise not found'}), 404
    data = request.get_json(silent=True) or {}
    if data.get('name') is not None:
        ex.name = data['name']
    if data.get('repetitions') is not None:
        ex.repetitions = data['repetitions']
    if data.get('sets') is not None:
        ex.sets = data['sets']
    db.session.commit()
    return jsonify(ex.to_dict())

@exercises_bp.route('/<int:plan_id>/exercises/<int:ex_id>', methods=['DELETE'])
@jwt_required()
def delete_exercise(plan_id, ex_id):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plan = _get_plan_for_user(plan_id, uid)
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    ex = Exercise.query.filter_by(id=ex_id, plan_id=plan_id).first()
    if not ex:
        return jsonify({'error': 'Exercise not found'}), 404
    db.session.delete(ex)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200
