# Configuration de la base de données MySQL (XAMPP)

# Paramètres MySQL XAMPP par défaut
MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
MYSQL_USER = 'root'
MYSQL_PASSWORD = ''  # Par défaut, XAMPP n'a pas de mot de passe
MYSQL_DATABASE = 'maintenance_db'

# URI de connexion SQLAlchemy
SQLALCHEMY_DATABASE_URI = f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}'
SQLALCHEMY_TRACK_MODIFICATIONS = False
