"""
Script pour vérifier le contenu de la base de données MySQL
"""

import pymysql
from config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

def check_database():
    """Afficher le contenu de la base de données"""
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        
        cursor = connection.cursor()
        
        print("=" * 60)
        print("📊 CONTENU DE LA BASE DE DONNÉES")
        print("=" * 60)
        
        # Compter les machines
        cursor.execute("SELECT COUNT(*) FROM machines")
        nb_machines = cursor.fetchone()[0]
        print(f"\n🔧 Machines: {nb_machines}")
        
        # Afficher les machines
        cursor.execute("SELECT id, nom, type FROM machines")
        machines = cursor.fetchall()
        for machine in machines:
            print(f"   - Machine #{machine[0]}: {machine[1]} ({machine[2]})")
        
        # Compter les pannes
        cursor.execute("SELECT COUNT(*) FROM pannes")
        nb_pannes = cursor.fetchone()[0]
        print(f"\n⚠️  Pannes: {nb_pannes}")
        
        # Afficher quelques pannes
        cursor.execute("SELECT id, machine_id, type_panne, duree_reparation FROM pannes LIMIT 5")
        pannes = cursor.fetchall()
        for panne in pannes:
            print(f"   - Panne #{panne[0]}: Machine {panne[1]} - {panne[2]} ({panne[3]}h)")
        
        if nb_pannes > 5:
            print(f"   ... et {nb_pannes - 5} autres pannes")
        
        print("\n" + "=" * 60)
        print("✅ Base de données opérationnelle!")
        print("=" * 60)
        
        cursor.close()
        connection.close()
        
    except pymysql.Error as e:
        print(f"❌ Erreur: {e}")

if __name__ == '__main__':
    check_database()
