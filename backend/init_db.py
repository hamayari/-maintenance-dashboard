"""
Script pour créer la base de données MySQL dans XAMPP
Exécutez ce script AVANT de démarrer l'application
"""

import pymysql
from config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

def create_database():
    """Créer la base de données si elle n'existe pas"""
    try:
        # Connexion à MySQL sans spécifier de base de données
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        
        cursor = connection.cursor()
        
        # Créer la base de données
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Base de données '{MYSQL_DATABASE}' créée avec succès!")
        
        cursor.close()
        connection.close()
        
        return True
        
    except pymysql.Error as e:
        print(f"❌ Erreur lors de la création de la base de données: {e}")
        print("\n⚠️  Assurez-vous que:")
        print("   1. XAMPP est démarré")
        print("   2. MySQL est en cours d'exécution")
        print("   3. Les paramètres dans config.py sont corrects")
        return False

if __name__ == '__main__':
    print("🔧 Initialisation de la base de données MySQL...")
    print(f"📍 Hôte: {MYSQL_HOST}:{MYSQL_PORT}")
    print(f"👤 Utilisateur: {MYSQL_USER}")
    print(f"🗄️  Base de données: {MYSQL_DATABASE}")
    print("-" * 50)
    
    if create_database():
        print("\n✅ Initialisation terminée!")
        print("Vous pouvez maintenant démarrer l'application avec: python app.py")
    else:
        print("\n❌ Échec de l'initialisation")
        print("Vérifiez que XAMPP MySQL est démarré")
