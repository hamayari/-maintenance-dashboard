from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import pandas as pd
import os
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import pymysql

# Installer pymysql comme MySQLdb
pymysql.install_as_MySQLdb()

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['JWT_SECRET_KEY'] = 'votre-cle-secrete-super-securisee-2024'  # Changez en production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Charger la configuration MySQL depuis config.py
app.config.from_pyfile('config.py')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialiser les extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# ==================== MODÈLES DE BASE DE DONNÉES ====================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='technicien')  # admin, technicien, superviseur
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prenom': self.prenom,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class Objectif(db.Model):
    __tablename__ = 'objectifs'
    
    id = db.Column(db.Integer, primary_key=True)
    mttr_cible = db.Column(db.Float, nullable=False, default=5.0)  # heures
    mtbf_cible = db.Column(db.Float, nullable=False, default=100.0)  # heures
    trs_cible = db.Column(db.Float, nullable=False, default=85.0)  # pourcentage
    taux_panne_cible = db.Column(db.Float, nullable=False, default=10.0)  # nombre max de pannes
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.String(100))
    
    def to_dict(self):
        return {
            'id': self.id,
            'mttr_cible': self.mttr_cible,
            'mtbf_cible': self.mtbf_cible,
            'trs_cible': self.trs_cible,
            'taux_panne_cible': self.taux_panne_cible,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None,
            'updated_by': self.updated_by
        }

class ActionCorrective(db.Model):
    __tablename__ = 'actions_correctives'
    
    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    machine_id = db.Column(db.Integer, db.ForeignKey('machines.id'), nullable=True)
    kpi_concerne = db.Column(db.String(50))  # MTTR, MTBF, TRS, nb_pannes
    priorite = db.Column(db.String(20), default='moyenne')  # basse, moyenne, haute, urgente
    statut = db.Column(db.String(20), default='planifie')  # planifie, en_cours, termine, annule
    assigne_a = db.Column(db.String(100))
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    date_echeance = db.Column(db.DateTime)
    date_cloture = db.Column(db.DateTime)
    cree_par = db.Column(db.String(100))
    commentaires = db.Column(db.Text)
    
    def to_dict(self):
        machine_nom = None
        if self.machine_id:
            machine = Machine.query.get(self.machine_id)
            machine_nom = machine.nom if machine else None
            
        return {
            'id': self.id,
            'titre': self.titre,
            'description': self.description,
            'machine_id': self.machine_id,
            'machine_nom': machine_nom,
            'kpi_concerne': self.kpi_concerne,
            'priorite': self.priorite,
            'statut': self.statut,
            'assigne_a': self.assigne_a,
            'date_creation': self.date_creation.strftime('%Y-%m-%d %H:%M:%S') if self.date_creation else None,
            'date_echeance': self.date_echeance.strftime('%Y-%m-%d') if self.date_echeance else None,
            'date_cloture': self.date_cloture.strftime('%Y-%m-%d %H:%M:%S') if self.date_cloture else None,
            'cree_par': self.cree_par,
            'commentaires': self.commentaires
        }

class Machine(db.Model):
    __tablename__ = 'machines'
    
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(100), nullable=False)
    date_installation = db.Column(db.String(50))
    localisation = db.Column(db.String(100))
    
    # Relation avec les pannes
    pannes = db.relationship('Panne', backref='machine', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'type': self.type,
            'date_installation': self.date_installation,
            'localisation': self.localisation
        }

class Panne(db.Model):
    __tablename__ = 'pannes'
    
    id = db.Column(db.Integer, primary_key=True)
    machine_id = db.Column(db.Integer, db.ForeignKey('machines.id'), nullable=False)
    date_panne = db.Column(db.String(50), nullable=False)
    type_panne = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    duree_reparation = db.Column(db.Float, nullable=False)
    cout_reparation = db.Column(db.Float)
    technicien = db.Column(db.String(100))
    
    def to_dict(self):
        return {
            'id': self.id,
            'machine_id': self.machine_id,
            'date_panne': self.date_panne,
            'type_panne': self.type_panne,
            'description': self.description,
            'duree_reparation': self.duree_reparation,
            'cout_reparation': self.cout_reparation,
            'technicien': self.technicien
        }

# Créer les tables au démarrage
with app.app_context():
    try:
        db.create_all()
        print("✅ Tables créées dans MySQL")
        
        # Initialiser les objectifs par défaut si aucun n'existe
        if not Objectif.query.first():
            objectifs_defaut = Objectif(
                mttr_cible=5.0,
                mtbf_cible=100.0,
                trs_cible=85.0,
                taux_panne_cible=10.0,
                updated_by='Système'
            )
            db.session.add(objectifs_defaut)
            db.session.commit()
            print("✅ Objectifs par défaut initialisés")
    except Exception as e:
        print(f"⚠️  Erreur lors de la création des tables: {e}")
        print("Assurez-vous que XAMPP MySQL est démarré et que la base de données existe")

# ==================== FONCTIONS UTILITAIRES ====================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def calculer_mttr(pannes):
    """Calculer le temps moyen de réparation"""
    if len(pannes) == 0:
        return 0
    total_duree = sum([p.duree_reparation for p in pannes])
    return round(total_duree / len(pannes), 2)

def calculer_mtbf(pannes, periode_totale=720):
    """Calculer le temps moyen entre pannes"""
    if len(pannes) == 0:
        return periode_totale
    nb_pannes = len(pannes)
    temps_arret = sum([p.duree_reparation for p in pannes])
    temps_fonctionnement = periode_totale - temps_arret
    return round(temps_fonctionnement / nb_pannes if nb_pannes > 0 else periode_totale, 2)

def calculer_trs(disponibilite=0.95, performance=0.90, qualite=0.98):
    """Calculer le taux de rendement synthétique"""
    return round(disponibilite * performance * qualite * 100, 2)

def calculer_ecart(valeur_reelle, valeur_cible):
    """Calculer l'écart en pourcentage entre valeur réelle et cible"""
    if valeur_cible == 0:
        return 0
    ecart = ((valeur_reelle - valeur_cible) / valeur_cible) * 100
    return round(ecart, 2)

def get_statut_kpi(valeur_reelle, valeur_cible, inverse=False):
    """Déterminer le statut d'un KPI (success, warning, danger)
    inverse=True pour MTTR et taux_panne (plus bas = mieux)
    inverse=False pour MTBF et TRS (plus haut = mieux)
    """
    ecart = calculer_ecart(valeur_reelle, valeur_cible)
    
    if inverse:
        # Pour MTTR et taux_panne: plus bas = mieux
        if valeur_reelle <= valeur_cible:
            return 'success'  # Objectif atteint
        elif ecart <= 20:
            return 'warning'  # Légèrement au-dessus
        else:
            return 'danger'  # Très au-dessus
    else:
        # Pour MTBF et TRS: plus haut = mieux
        if valeur_reelle >= valeur_cible:
            return 'success'  # Objectif atteint
        elif ecart >= -20:
            return 'warning'  # Légèrement en-dessous
        else:
            return 'danger'  # Très en-dessous

# ==================== ROUTES API ====================

# Routes d'authentification
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.get_json()
        
        # Vérifier si l'email existe déjà
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
        
        # Hasher le mot de passe
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Créer le nouvel utilisateur
        new_user = User(
            nom=data['nom'],
            prenom=data['prenom'],
            email=data['email'],
            password=hashed_password,
            role=data.get('role', 'technicien')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Inscription réussie',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Connexion utilisateur"""
    try:
        data = request.get_json()
        
        # Trouver l'utilisateur
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not bcrypt.check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        # Créer le token JWT
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'Connexion réussie',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtenir l'utilisateur connecté"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Réinitialisation du mot de passe (simulation)"""
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            # Ne pas révéler si l'email existe ou non (sécurité)
            return jsonify({'message': 'Si cet email existe, un lien de réinitialisation a été envoyé'}), 200
        
        # TODO: Envoyer un email avec un lien de réinitialisation
        # Pour l'instant, on simule juste
        
        return jsonify({'message': 'Un email de réinitialisation a été envoyé'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'Backend fonctionne avec SQLite!', 'status': 'OK'})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Importer un fichier Excel et sauvegarder dans la BD"""
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nom de fichier vide'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Lire le fichier Excel
            df_machines = pd.read_excel(filepath, sheet_name='Machines')
            df_pannes = pd.read_excel(filepath, sheet_name='Pannes')
            
            # Supprimer les anciennes données
            Panne.query.delete()
            Machine.query.delete()
            
            # Importer les machines
            for _, row in df_machines.iterrows():
                machine = Machine(
                    id=int(row['id']),
                    nom=row['nom'],
                    type=row['type'],
                    date_installation=str(row.get('date_installation', '')),
                    localisation=row.get('localisation', '')
                )
                db.session.add(machine)
            
            # Importer les pannes
            for _, row in df_pannes.iterrows():
                panne = Panne(
                    machine_id=int(row['machine_id']),
                    date_panne=str(row.get('date', row.get('date_panne', ''))),
                    type_panne=row['type_panne'],
                    description=row.get('description', ''),
                    duree_reparation=float(row['duree_reparation']),
                    cout_reparation=float(row.get('cout_reparation', 0)),
                    technicien=row.get('technicien', '')
                )
                db.session.add(panne)
            
            db.session.commit()
            
            # Calculer les KPI
            pannes = Panne.query.all()
            kpi = {
                'mttr': calculer_mttr(pannes),
                'mtbf': calculer_mtbf(pannes),
                'trs': calculer_trs(),
                'nb_pannes': len(pannes),
                'temps_arret_total': round(sum([p.duree_reparation for p in pannes]), 2)
            }
            
            return jsonify({
                'message': 'Fichier importé avec succès',
                'nb_machines': Machine.query.count(),
                'nb_pannes': Panne.query.count(),
                'kpi': kpi
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Erreur: {str(e)}'}), 500
    
    return jsonify({'error': 'Type de fichier non autorisé'}), 400

@app.route('/api/kpi', methods=['GET'])
def get_kpi():
    """Obtenir les KPI globaux avec comparaison aux objectifs"""
    pannes = Panne.query.all()
    
    if len(pannes) == 0:
        return jsonify({'error': 'Aucune donnée'}), 404
    
    # Calculer les KPI réels
    kpi_reels = {
        'mttr': calculer_mttr(pannes),
        'mtbf': calculer_mtbf(pannes),
        'trs': calculer_trs(),
        'nb_pannes': len(pannes),
        'temps_arret_total': round(sum([p.duree_reparation for p in pannes]), 2)
    }
    
    # Récupérer les objectifs (prendre le dernier enregistré)
    objectif = Objectif.query.order_by(Objectif.id.desc()).first()
    
    if objectif:
        # Calculer les écarts
        kpi_reels['objectifs'] = objectif.to_dict()
        kpi_reels['ecarts'] = {
            'mttr': calculer_ecart(kpi_reels['mttr'], objectif.mttr_cible),
            'mtbf': calculer_ecart(kpi_reels['mtbf'], objectif.mtbf_cible),
            'trs': calculer_ecart(kpi_reels['trs'], objectif.trs_cible),
            'nb_pannes': calculer_ecart(kpi_reels['nb_pannes'], objectif.taux_panne_cible)
        }
        kpi_reels['statuts'] = {
            'mttr': get_statut_kpi(kpi_reels['mttr'], objectif.mttr_cible, inverse=True),
            'mtbf': get_statut_kpi(kpi_reels['mtbf'], objectif.mtbf_cible, inverse=False),
            'trs': get_statut_kpi(kpi_reels['trs'], objectif.trs_cible, inverse=False),
            'nb_pannes': get_statut_kpi(kpi_reels['nb_pannes'], objectif.taux_panne_cible, inverse=True)
        }
    
    return jsonify(kpi_reels)

@app.route('/api/machines', methods=['GET'])
def get_machines():
    """Obtenir toutes les machines avec statistiques"""
    machines = Machine.query.all()
    
    if len(machines) == 0:
        return jsonify({'error': 'Aucune machine'}), 404
    
    result = []
    for machine in machines:
        machine_dict = machine.to_dict()
        machine_dict['nb_pannes'] = len(machine.pannes)
        machine_dict['statut'] = 'critique' if len(machine.pannes) > 5 else 'normal'
        result.append(machine_dict)
    
    return jsonify(result)

@app.route('/api/machines/<int:machine_id>', methods=['GET'])
def get_machine(machine_id):
    """Obtenir les détails d'une machine"""
    machine = Machine.query.get(machine_id)
    
    if not machine:
        return jsonify({'error': 'Machine non trouvée'}), 404
    
    pannes = machine.pannes
    
    kpi_machine = {
        'mttr': calculer_mttr(pannes),
        'mtbf': calculer_mtbf(pannes),
        'nb_pannes': len(pannes),
        'temps_arret_total': round(sum([p.duree_reparation for p in pannes]), 2)
    }
    
    return jsonify({
        'machine': machine.to_dict(),
        'kpi': kpi_machine,
        'pannes': [p.to_dict() for p in pannes]
    })

@app.route('/api/pannes', methods=['GET'])
def get_pannes():
    """Obtenir toutes les pannes"""
    pannes = Panne.query.all()
    
    if len(pannes) == 0:
        return jsonify({'error': 'Aucune panne'}), 404
    
    return jsonify([p.to_dict() for p in pannes])

@app.route('/api/analytics/critical', methods=['GET'])
def get_critical_machines():
    """Obtenir les machines critiques"""
    machines = Machine.query.all()
    
    critical = []
    for machine in machines:
        pannes = machine.pannes
        if len(pannes) > 5:
            critical.append({
                'machine': machine.to_dict(),
                'nb_pannes': len(pannes),
                'temps_arret_total': round(sum([p.duree_reparation for p in pannes]), 2),
                'mttr': calculer_mttr(pannes),
                'recommandation': 'Maintenance préventive urgente'
            })
    
    return jsonify(sorted(critical, key=lambda x: x['nb_pannes'], reverse=True))

@app.route('/api/stats/pannes-par-type', methods=['GET'])
def get_pannes_par_type():
    """Statistiques des pannes par type"""
    pannes = Panne.query.all()
    
    if len(pannes) == 0:
        return jsonify({})
    
    stats = {}
    for panne in pannes:
        if panne.type_panne in stats:
            stats[panne.type_panne] += 1
        else:
            stats[panne.type_panne] = 1
    
    return jsonify(stats)

@app.route('/api/stats/pannes-par-machine', methods=['GET'])
def get_pannes_par_machine():
    """Statistiques des pannes par machine"""
    machines = Machine.query.all()
    
    stats = {}
    for machine in machines:
        stats[machine.nom] = len(machine.pannes)
    
    return jsonify(stats)

@app.route('/api/stats/evolution-kpi', methods=['GET'])
def get_evolution_kpi():
    """Obtenir l'évolution des KPI dans le temps"""
    try:
        # Récupérer toutes les pannes avec leurs dates
        pannes = Panne.query.all()
        
        if len(pannes) == 0:
            return jsonify({'error': 'Aucune donnée'}), 404
        
        # Grouper les pannes par mois
        pannes_par_mois = {}
        
        for panne in pannes:
            try:
                # Parser la date (format peut varier)
                date_str = panne.date_panne
                # Essayer différents formats
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                except:
                    try:
                        date_obj = datetime.strptime(date_str, '%d/%m/%Y')
                    except:
                        # Si la date ne peut pas être parsée, utiliser le mois actuel
                        date_obj = datetime.now()
                
                mois_key = date_obj.strftime('%Y-%m')
                
                if mois_key not in pannes_par_mois:
                    pannes_par_mois[mois_key] = []
                
                pannes_par_mois[mois_key].append(panne)
            except:
                continue
        
        # Calculer les KPI pour chaque mois
        evolution = []
        
        for mois, pannes_mois in sorted(pannes_par_mois.items()):
            kpi_mois = {
                'periode': mois,
                'mttr': calculer_mttr(pannes_mois),
                'mtbf': calculer_mtbf(pannes_mois),
                'trs': calculer_trs(),
                'nb_pannes': len(pannes_mois),
                'temps_arret_total': round(sum([p.duree_reparation for p in pannes_mois]), 2)
            }
            evolution.append(kpi_mois)
        
        return jsonify(evolution)
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/stats/comparaison-periodes', methods=['GET'])
def get_comparaison_periodes():
    """Comparer les performances entre deux périodes"""
    try:
        pannes = Panne.query.all()
        
        if len(pannes) == 0:
            return jsonify({'error': 'Aucune donnée'}), 404
        
        # Diviser les pannes en deux périodes (première moitié vs deuxième moitié)
        pannes_triees = sorted(pannes, key=lambda p: p.date_panne)
        milieu = len(pannes_triees) // 2
        
        periode1 = pannes_triees[:milieu]
        periode2 = pannes_triees[milieu:]
        
        kpi_periode1 = {
            'mttr': calculer_mttr(periode1),
            'mtbf': calculer_mtbf(periode1),
            'trs': calculer_trs(),
            'nb_pannes': len(periode1),
        }
        
        kpi_periode2 = {
            'mttr': calculer_mttr(periode2),
            'mtbf': calculer_mtbf(periode2),
            'trs': calculer_trs(),
            'nb_pannes': len(periode2),
        }
        
        # Calculer les variations
        variations = {
            'mttr': calculer_ecart(kpi_periode2['mttr'], kpi_periode1['mttr']),
            'mtbf': calculer_ecart(kpi_periode2['mtbf'], kpi_periode1['mtbf']),
            'trs': calculer_ecart(kpi_periode2['trs'], kpi_periode1['trs']),
            'nb_pannes': calculer_ecart(kpi_periode2['nb_pannes'], kpi_periode1['nb_pannes']),
        }
        
        return jsonify({
            'periode1': kpi_periode1,
            'periode2': kpi_periode2,
            'variations': variations,
            'amelioration': {
                'mttr': variations['mttr'] < 0,  # Diminution = amélioration
                'mtbf': variations['mtbf'] > 0,  # Augmentation = amélioration
                'trs': variations['trs'] > 0,    # Augmentation = amélioration
                'nb_pannes': variations['nb_pannes'] < 0,  # Diminution = amélioration
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/stats/tendances', methods=['GET'])
def get_tendances():
    """Analyser les tendances des KPI"""
    try:
        pannes = Panne.query.all()
        
        if len(pannes) == 0:
            return jsonify({'error': 'Aucune donnée'}), 404
        
        # Grouper par mois et calculer la tendance
        pannes_par_mois = {}
        
        for panne in pannes:
            try:
                date_str = panne.date_panne
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                except:
                    try:
                        date_obj = datetime.strptime(date_str, '%d/%m/%Y')
                    except:
                        date_obj = datetime.now()
                
                mois_key = date_obj.strftime('%Y-%m')
                
                if mois_key not in pannes_par_mois:
                    pannes_par_mois[mois_key] = []
                
                pannes_par_mois[mois_key].append(panne)
            except:
                continue
        
        # Calculer la tendance (simple: comparer premier et dernier mois)
        mois_tries = sorted(pannes_par_mois.keys())
        
        if len(mois_tries) < 2:
            return jsonify({
                'tendance': 'stable',
                'message': 'Pas assez de données pour calculer une tendance'
            })
        
        premier_mois = pannes_par_mois[mois_tries[0]]
        dernier_mois = pannes_par_mois[mois_tries[-1]]
        
        mttr_debut = calculer_mttr(premier_mois)
        mttr_fin = calculer_mttr(dernier_mois)
        
        nb_pannes_debut = len(premier_mois)
        nb_pannes_fin = len(dernier_mois)
        
        tendance_mttr = 'amelioration' if mttr_fin < mttr_debut else 'degradation' if mttr_fin > mttr_debut else 'stable'
        tendance_pannes = 'amelioration' if nb_pannes_fin < nb_pannes_debut else 'degradation' if nb_pannes_fin > nb_pannes_debut else 'stable'
        
        return jsonify({
            'mttr': {
                'tendance': tendance_mttr,
                'debut': mttr_debut,
                'fin': mttr_fin,
                'variation': calculer_ecart(mttr_fin, mttr_debut)
            },
            'nb_pannes': {
                'tendance': tendance_pannes,
                'debut': nb_pannes_debut,
                'fin': nb_pannes_fin,
                'variation': calculer_ecart(nb_pannes_fin, nb_pannes_debut)
            },
            'periode': {
                'debut': mois_tries[0],
                'fin': mois_tries[-1],
                'nb_mois': len(mois_tries)
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

# ==================== ROUTES OBJECTIFS ====================

@app.route('/api/objectifs', methods=['GET'])
def get_objectifs():
    """Obtenir les objectifs actuels"""
    objectif = Objectif.query.order_by(Objectif.id.desc()).first()
    
    if not objectif:
        # Créer des objectifs par défaut si aucun n'existe
        objectif = Objectif(
            mttr_cible=5.0,
            mtbf_cible=100.0,
            trs_cible=85.0,
            taux_panne_cible=10.0,
            updated_by='Système'
        )
        db.session.add(objectif)
        db.session.commit()
    
    return jsonify(objectif.to_dict())

@app.route('/api/objectifs', methods=['POST'])
@jwt_required()
def update_objectifs():
    """Mettre à jour les objectifs (admin uniquement)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        # Vérifier que l'utilisateur est admin
        if user.role != 'admin':
            return jsonify({'error': 'Accès refusé. Seuls les admins peuvent modifier les objectifs'}), 403
        
        data = request.get_json()
        
        # Créer un nouvel objectif (historique)
        nouvel_objectif = Objectif(
            mttr_cible=float(data.get('mttr_cible', 5.0)),
            mtbf_cible=float(data.get('mtbf_cible', 100.0)),
            trs_cible=float(data.get('trs_cible', 85.0)),
            taux_panne_cible=float(data.get('taux_panne_cible', 10.0)),
            updated_by=f"{user.prenom} {user.nom}"
        )
        
        db.session.add(nouvel_objectif)
        db.session.commit()
        
        return jsonify({
            'message': 'Objectifs mis à jour avec succès',
            'objectifs': nouvel_objectif.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/objectifs/historique', methods=['GET'])
@jwt_required()
def get_objectifs_historique():
    """Obtenir l'historique des objectifs"""
    objectifs = Objectif.query.order_by(Objectif.updated_at.desc()).limit(10).all()
    return jsonify([obj.to_dict() for obj in objectifs])

# ==================== ROUTES ACTIONS CORRECTIVES ====================

@app.route('/api/actions-correctives', methods=['GET'])
def get_actions_correctives():
    """Obtenir toutes les actions correctives avec filtres"""
    statut = request.args.get('statut')
    priorite = request.args.get('priorite')
    machine_id = request.args.get('machine_id')
    
    query = ActionCorrective.query
    
    if statut:
        query = query.filter_by(statut=statut)
    if priorite:
        query = query.filter_by(priorite=priorite)
    if machine_id:
        query = query.filter_by(machine_id=int(machine_id))
    
    actions = query.order_by(ActionCorrective.date_creation.desc()).all()
    return jsonify([action.to_dict() for action in actions])

@app.route('/api/actions-correctives/<int:action_id>', methods=['GET'])
def get_action_corrective(action_id):
    """Obtenir une action corrective spécifique"""
    action = ActionCorrective.query.get(action_id)
    
    if not action:
        return jsonify({'error': 'Action corrective non trouvée'}), 404
    
    return jsonify(action.to_dict())

@app.route('/api/actions-correctives', methods=['POST'])
@jwt_required()
def create_action_corrective():
    """Créer une nouvelle action corrective"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        data = request.get_json()
        
        # Convertir la date d'échéance si fournie
        date_echeance = None
        if data.get('date_echeance'):
            date_echeance = datetime.strptime(data['date_echeance'], '%Y-%m-%d')
        
        nouvelle_action = ActionCorrective(
            titre=data['titre'],
            description=data['description'],
            machine_id=data.get('machine_id'),
            kpi_concerne=data.get('kpi_concerne'),
            priorite=data.get('priorite', 'moyenne'),
            statut='planifie',
            assigne_a=data.get('assigne_a'),
            date_echeance=date_echeance,
            cree_par=f"{user.prenom} {user.nom}",
            commentaires=data.get('commentaires')
        )
        
        db.session.add(nouvelle_action)
        db.session.commit()
        
        return jsonify({
            'message': 'Action corrective créée avec succès',
            'action': nouvelle_action.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/actions-correctives/<int:action_id>', methods=['PUT'])
@jwt_required()
def update_action_corrective(action_id):
    """Mettre à jour une action corrective"""
    try:
        action = ActionCorrective.query.get(action_id)
        
        if not action:
            return jsonify({'error': 'Action corrective non trouvée'}), 404
        
        data = request.get_json()
        
        # Mettre à jour les champs
        if 'titre' in data:
            action.titre = data['titre']
        if 'description' in data:
            action.description = data['description']
        if 'machine_id' in data:
            action.machine_id = data['machine_id']
        if 'kpi_concerne' in data:
            action.kpi_concerne = data['kpi_concerne']
        if 'priorite' in data:
            action.priorite = data['priorite']
        if 'statut' in data:
            action.statut = data['statut']
            # Si terminé, enregistrer la date de clôture
            if data['statut'] == 'termine' and not action.date_cloture:
                action.date_cloture = datetime.utcnow()
        if 'assigne_a' in data:
            action.assigne_a = data['assigne_a']
        if 'date_echeance' in data:
            action.date_echeance = datetime.strptime(data['date_echeance'], '%Y-%m-%d') if data['date_echeance'] else None
        if 'commentaires' in data:
            action.commentaires = data['commentaires']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Action corrective mise à jour',
            'action': action.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/actions-correctives/<int:action_id>', methods=['DELETE'])
@jwt_required()
def delete_action_corrective(action_id):
    """Supprimer une action corrective"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Accès refusé. Seuls les admins peuvent supprimer'}), 403
        
        action = ActionCorrective.query.get(action_id)
        
        if not action:
            return jsonify({'error': 'Action corrective non trouvée'}), 404
        
        db.session.delete(action)
        db.session.commit()
        
        return jsonify({'message': 'Action corrective supprimée'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/actions-correctives/stats', methods=['GET'])
def get_actions_stats():
    """Obtenir les statistiques des actions correctives"""
    total = ActionCorrective.query.count()
    planifie = ActionCorrective.query.filter_by(statut='planifie').count()
    en_cours = ActionCorrective.query.filter_by(statut='en_cours').count()
    termine = ActionCorrective.query.filter_by(statut='termine').count()
    urgente = ActionCorrective.query.filter_by(priorite='urgente').count()
    
    return jsonify({
        'total': total,
        'planifie': planifie,
        'en_cours': en_cours,
        'termine': termine,
        'urgente': urgente,
        'taux_completion': round((termine / total * 100) if total > 0 else 0, 2)
    })

# ==================== ROUTES UTILISATEURS ====================

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    """Obtenir tous les utilisateurs (admin uniquement)"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Accès refusé. Réservé aux administrateurs'}), 403
        
        # Filtres optionnels
        role = request.args.get('role')
        search = request.args.get('search')
        
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.nom.ilike(search_pattern),
                    User.prenom.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )
        
        users = query.order_by(User.created_at.desc()).all()
        return jsonify([u.to_dict() for u in users])
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Obtenir un utilisateur spécifique"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Admin peut voir tous les utilisateurs, les autres seulement leur propre profil
        if current_user.role != 'admin' and current_user_id != user_id:
            return jsonify({'error': 'Accès refusé'}), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        return jsonify(user.to_dict())
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/users', methods=['POST'])
@jwt_required()
def create_user_by_admin():
    """Créer un utilisateur via l'interface admin (admin uniquement)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Accès refusé. Réservé aux administrateurs'}), 403
        
        data = request.get_json()
        
        # Vérifier si l'email existe déjà
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
        
        # Hasher le mot de passe
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Créer le nouvel utilisateur avec le rôle spécifié par l'admin
        new_user = User(
            nom=data['nom'],
            prenom=data['prenom'],
            email=data['email'],
            password=hashed_password,
            role=data.get('role', 'technicien')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Utilisateur créé avec succès',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Mettre à jour un utilisateur"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Admin peut modifier tous les utilisateurs, les autres seulement leur propre profil
        if current_user.role != 'admin' and current_user_id != user_id:
            return jsonify({'error': 'Accès refusé'}), 403
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        data = request.get_json()
        
        # Mettre à jour les champs
        if 'nom' in data:
            user.nom = data['nom']
        if 'prenom' in data:
            user.prenom = data['prenom']
        if 'email' in data:
            # Vérifier si le nouvel email n'est pas déjà utilisé
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({'error': 'Cet email est déjà utilisé'}), 400
            user.email = data['email']
        
        # Seul l'admin peut changer le rôle
        if 'role' in data and current_user.role == 'admin':
            user.role = data['role']
        
        # Changer le mot de passe si fourni
        if 'password' in data and data['password']:
            user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        db.session.commit()
        
        return jsonify({
            'message': 'Utilisateur mis à jour',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Supprimer un utilisateur (admin uniquement)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Accès refusé. Réservé aux administrateurs'}), 403
        
        # Empêcher la suppression de son propre compte
        if current_user_id == user_id:
            return jsonify({'error': 'Vous ne pouvez pas supprimer votre propre compte'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Utilisateur supprimé avec succès'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

@app.route('/api/users/stats', methods=['GET'])
@jwt_required()
def get_users_stats():
    """Obtenir les statistiques des utilisateurs (admin uniquement)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Accès refusé'}), 403
        
        total = User.query.count()
        admins = User.query.filter_by(role='admin').count()
        superviseurs = User.query.filter_by(role='superviseur').count()
        techniciens = User.query.filter_by(role='technicien').count()
        
        return jsonify({
            'total': total,
            'admins': admins,
            'superviseurs': superviseurs,
            'techniciens': techniciens
        })
        
    except Exception as e:
        return jsonify({'error': f'Erreur: {str(e)}'}), 500

# ==================== ROUTES RAPPORTS ====================
def generate_pdf_report():
    """Générer rapport PDF professionnel avec logo"""
    machines = Machine.query.all()
    pannes = Panne.query.all()
    
    if len(machines) == 0 or len(pannes) == 0:
        return jsonify({'error': 'Aucune donnée disponible'}), 404
    
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        elements = []
        styles = getSampleStyleSheet()
        
        # Styles personnalisés
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=15,
            spaceBefore=20,
            fontName='Helvetica-Bold'
        )
        
        # Logo
        logo_path = os.path.join(os.path.dirname(__file__), 'maz.tn.jpg')
        if os.path.exists(logo_path):
            logo_img = Image(logo_path, width=1.5*inch, height=1.5*inch)
            elements.append(logo_img)
            elements.append(Spacer(1, 10))
        
        # Titre
        title = Paragraph("Rapport de Maintenance Industrielle", title_style)
        elements.append(title)
        
        # Date
        date_text = Paragraph(
            f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", 
            subtitle_style
        )
        elements.append(date_text)
        elements.append(Spacer(1, 20))
        
        # Calculer KPI
        kpi = {
            'mttr': calculer_mttr(pannes),
            'mtbf': calculer_mtbf(pannes),
            'trs': calculer_trs(),
            'nb_pannes': len(pannes),
            'temps_arret_total': round(sum([p.duree_reparation for p in pannes]), 2)
        }
        
        # Résumé Exécutif
        summary_title = Paragraph("📊 Résumé Exécutif", heading_style)
        elements.append(summary_title)
        
        summary_data = [
            ['Indicateur', 'Valeur', 'Statut'],
            [
                'MTTR (Temps Moyen de Réparation)', 
                f"{kpi['mttr']} heures",
                '✓ Bon' if kpi['mttr'] < 5 else '⚠ À améliorer'
            ],
            [
                'MTBF (Temps Moyen Entre Pannes)', 
                f"{kpi['mtbf']} heures",
                '✓ Excellent' if kpi['mtbf'] > 100 else '⚠ Attention'
            ],
            [
                'TRS (Taux de Rendement Synthétique)', 
                f"{kpi['trs']} %",
                '✓ Optimal' if kpi['trs'] > 85 else '⚠ Critique'
            ],
            [
                'Nombre Total de Pannes', 
                str(kpi['nb_pannes']),
                '✓ Normal' if kpi['nb_pannes'] < 10 else '✗ Élevé'
            ],
            [
                'Temps d\'Arrêt Total', 
                f"{kpi['temps_arret_total']} heures",
                ''
            ],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 1.5*inch, 1.2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 25))
        
        # Section Machines
        machines_title = Paragraph("🔧 État des Machines", heading_style)
        elements.append(machines_title)
        
        machines_data = [['Machine', 'Type', 'Pannes', 'Statut']]
        for machine in machines:
            pannes_count = len(machine.pannes)
            statut = '✗ Critique' if pannes_count > 5 else '⚠ Attention' if pannes_count > 3 else '✓ Normal'
            machines_data.append([
                machine.nom, 
                machine.type, 
                str(pannes_count),
                statut
            ])
        
        machines_table = Table(machines_data, colWidths=[2*inch, 1.8*inch, 1*inch, 1.5*inch])
        machines_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e3a8a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(machines_table)
        elements.append(Spacer(1, 25))
        
        # Recommandations
        reco_title = Paragraph("💡 Recommandations", heading_style)
        elements.append(reco_title)
        
        recommendations = []
        if kpi['mttr'] > 5:
            recommendations.append("• Former les techniciens pour réduire le temps de réparation")
        if kpi['mtbf'] < 50:
            recommendations.append("• Augmenter la fréquence de maintenance préventive")
        if kpi['trs'] < 70:
            recommendations.append("• Analyser les causes de baisse de performance")
        
        critical_machines = [m for m in machines if len(m.pannes) > 5]
        if critical_machines:
            recommendations.append(f"• Planifier maintenance urgente pour {len(critical_machines)} machine(s) critique(s)")
        
        if not recommendations:
            recommendations.append("✓ Aucune action urgente requise - Système opérationnel")
        
        for reco in recommendations:
            elements.append(Paragraph(reco, styles['Normal']))
            elements.append(Spacer(1, 8))
        
        # Footer
        elements.append(Spacer(1, 30))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            alignment=TA_CENTER
        )
        footer = Paragraph(
            f"Document confidentiel - Généré automatiquement le {datetime.now().strftime('%d/%m/%Y')}", 
            footer_style
        )
        elements.append(footer)
        
        # Générer PDF
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'rapport_maintenance_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
        )
    
    except Exception as e:
        return jsonify({'error': f'Erreur génération PDF: {str(e)}'}), 500

@app.route('/api/reports/excel', methods=['GET'])
def generate_excel_report():
    """Générer rapport Excel"""
    machines = Machine.query.all()
    pannes = Panne.query.all()
    
    if len(machines) == 0 or len(pannes) == 0:
        return jsonify({'error': 'Aucune donnée disponible'}), 404
    
    try:
        buffer = BytesIO()
        
        # Calculer KPI
        kpi = {
            'mttr': calculer_mttr(pannes),
            'mtbf': calculer_mtbf(pannes),
            'trs': calculer_trs(),
            'nb_pannes': len(pannes),
            'temps_arret_total': round(sum([p.duree_reparation for p in pannes]), 2)
        }
        
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            # Feuille KPI
            kpi_df = pd.DataFrame([kpi])
            kpi_df.to_excel(writer, sheet_name='KPI', index=False)
            
            # Feuille Machines
            machines_data = [m.to_dict() for m in machines]
            machines_df = pd.DataFrame(machines_data)
            machines_df.to_excel(writer, sheet_name='Machines', index=False)
            
            # Feuille Pannes
            pannes_data = [p.to_dict() for p in pannes]
            pannes_df = pd.DataFrame(pannes_data)
            pannes_df.to_excel(writer, sheet_name='Pannes', index=False)
            
            # Feuille Statistiques
            stats_data = []
            for machine in machines:
                stats_data.append({
                    'Machine': machine.nom,
                    'Type': machine.type,
                    'Nombre_Pannes': len(machine.pannes),
                    'Temps_Arret_Total': sum([p.duree_reparation for p in machine.pannes])
                })
            
            stats_df = pd.DataFrame(stats_data)
            stats_df.to_excel(writer, sheet_name='Statistiques', index=False)
        
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f'rapport_maintenance_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
        )
    
    except Exception as e:
        return jsonify({'error': f'Erreur génération Excel: {str(e)}'}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Backend démarré avec MySQL (XAMPP)")
    print("📍 URL: http://localhost:5000")
    print("🗄️  Base de données: maintenance_db")
    print("=" * 60)
    app.run(debug=True, port=5000)
