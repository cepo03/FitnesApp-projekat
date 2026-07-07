import os
from pathlib import Path
from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flasgger import Swagger
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_ROOT / '.env')

# PostgreSQL je jedini podržan tip baze
_db_uri = os.environ.get('DATABASE_URL')

if not _db_uri:
    raise RuntimeError('DATABASE_URL must be set to a PostgreSQL connection string')

_db_uri = _db_uri.replace('postgres://', 'postgresql://', 1)

def create_app():
    app = Flask(__name__)
    # Minimalno 32 karaktera za JWT (SHA256 preporuka), inače 422
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fitness-app-secret-key-2024-extra-long-enough')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-fitness-secret-key-2024-min-32-bytes-long')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['SQLALCHEMY_DATABASE_URI'] = _db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Dozvoli i localhost i 127.0.0.1 (proxy ili direktan poziv)
    CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])
    bcrypt = Bcrypt(app)
    jwt = JWTManager(app)

    app.config['SWAGGER'] = {
        'title': 'Fitness App API',
        'uiversion': 3,
        'openapi': '3.0.0'
    }
    swagger = Swagger(app, template_file='swagger.yaml')

    @jwt.invalid_token_loader
    def invalid_token_callback(err):
        msg = str(err) if err else 'Neispravan token'
        return jsonify({'error': msg}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(err):
        return jsonify({'error': 'Token nije poslat'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token istekao, prijavi se ponovo'}), 401

    from models import db, User, Plan, Exercise
    db.init_app(app)

    def seed_data():
        # create a default user + sample plan & exercise if none exist
        from flask_bcrypt import generate_password_hash
        if User.query.first():
            return
        pwd = generate_password_hash('password').decode('utf-8')
        user = User(username='demo', email='demo@example.com', password_hash=pwd)
        db.session.add(user)
        db.session.commit()
        plan = Plan(user_id=user.id, name='Demo Plan', description='Auto-created demo plan', duration_months=1)
        db.session.add(plan)
        db.session.commit()
        ex = Exercise(plan_id=plan.id, name='Push Ups', repetitions=10, sets=3)
        db.session.add(ex)
        db.session.commit()

    with app.app_context():
        # create tables from models and seed initial data (development convenience)
        db.create_all()
        try:
            seed_data()
        except Exception:
            # don't crash app startup if seeding fails
            pass

    from routes.auth import auth_bp
    from routes.plans import plans_bp
    from routes.exercises import exercises_bp
    from routes.progress import progress_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(plans_bp, url_prefix='/api/plans')
    app.register_blueprint(exercises_bp, url_prefix='/api/plans')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')

    @app.errorhandler(500)
    def handle_500(e):
        from flask import jsonify
        return jsonify({'error': 'Interna greška servera'}), 500

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
