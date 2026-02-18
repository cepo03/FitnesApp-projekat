from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Plan

plans_bp = Blueprint('plans', __name__)

def _uid():
    raw = get_jwt_identity()
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None

@plans_bp.route('', methods=['GET'])
@jwt_required()
def list_plans():
    raw = get_jwt_identity()
    uid = _uid()
    # #region agent log
    import json; open(r'c:\Users\Korisnik\Desktop\App\.cursor\debug.log', 'a', encoding='utf-8').write(json.dumps({'location':'plans.py:list_plans','message':'list_plans','data':{'raw':str(raw),'uid':uid},'hypothesisId':'H2'}) + '\n')
    # #endregion
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plans = Plan.query.filter_by(user_id=uid).all()
    return jsonify([p.to_dict() for p in plans])

@plans_bp.route('', methods=['POST'])
@jwt_required()
def create_plan():
    uid = _uid()
    data = request.get_json(silent=True) or {}
    # #region agent log
    import json; open(r'c:\Users\Korisnik\Desktop\App\.cursor\debug.log', 'a', encoding='utf-8').write(json.dumps({'location':'plans.py:create_plan','message':'create_plan','data':{'uid':uid,'hasName':bool(data.get('name')),'keys':list(data.keys())},'hypothesisId':'H4'}) + '\n')
    # #endregion
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    if not data or not data.get('name'):
        return jsonify({'error': 'Name required'}), 400
    plan = Plan(
        user_id=uid,
        name=data['name'],
        description=data.get('description', ''),
        duration_months=data.get('duration_months', 1)
    )
    db.session.add(plan)
    db.session.commit()
    return jsonify(plan.to_dict()), 201

@plans_bp.route('/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_plan(plan_id):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plan = Plan.query.filter_by(id=plan_id, user_id=uid).first()
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    return jsonify(plan.to_dict())

@plans_bp.route('/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_plan(plan_id):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plan = Plan.query.filter_by(id=plan_id, user_id=uid).first()
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    data = request.get_json(silent=True) or {}
    if data.get('name') is not None:
        plan.name = data['name']
    if data.get('description') is not None:
        plan.description = data['description']
    if data.get('duration_months') is not None:
        plan.duration_months = data['duration_months']
    db.session.commit()
    return jsonify(plan.to_dict())

@plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_plan(plan_id):
    uid = _uid()
    if uid is None:
        return jsonify({'error': 'Invalid token'}), 401
    plan = Plan.query.filter_by(id=plan_id, user_id=uid).first()
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    db.session.delete(plan)
    db.session.commit()
    return jsonify({'message': 'Deleted'}), 200
