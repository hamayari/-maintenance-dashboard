import os

# Configuration pour la production
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql://root:@localhost:3306/maintenance_db')

# Remplacer postgres:// par postgresql:// si nécessaire (Render utilise postgres://)
if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith('postgres://'):
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace('postgres://', 'postgresql://', 1)

SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = os.environ.get('SECRET_KEY', 'votre-cle-secrete-super-securisee-2024')
