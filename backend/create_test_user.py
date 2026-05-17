"""
Script pour créer un utilisateur de test
Email: admin@test.com
Password: admin123
"""

from app import app, db, User, bcrypt

with app.app_context():
    # Vérifier si l'utilisateur existe déjà
    existing_user = User.query.filter_by(email='admin@test.com').first()
    
    if existing_user:
        print("❌ L'utilisateur admin@test.com existe déjà")
    else:
        # Créer l'utilisateur
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        
        admin_user = User(
            nom='Admin',
            prenom='Test',
            email='admin@test.com',
            password=hashed_password,
            role='admin'
        )
        
        db.session.add(admin_user)
        db.session.commit()
        
        print("✅ Utilisateur créé avec succès!")
        print("=" * 50)
        print("Email: admin@test.com")
        print("Password: admin123")
        print("Rôle: admin")
        print("=" * 50)
