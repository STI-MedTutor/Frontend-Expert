# Learner Auth API - Documentation

API de gestion de l'authentification et des profils d'utilisateurs pour le Système Tuteur Intelligent (STI) 5GI.

## 📋 Vue d'ensemble

Cette API gère :
- **Authentification** : Inscription, connexion, réinitialisation mot de passe
- **Profils apprenants** : CRUD complet avec suivi progression
- **Profils experts (médecins)** : Inscription avec domaine d'expertise médical
- **Notes tuteur** : Observations pédagogiques personnalisées
- **Système de points** : Calcul automatique des niveaux (6 niveaux)
- **Gestion gérants** : Profils administrateurs (minimal)

**Stack** : Flask + SQLite + JWT (tokens 30 jours)

**Port** : 5004

---

## 🚀 Installation

### Prérequis
```bash
Python 3.11+
pip
```

### Installation des dépendances
```bash
cd Learner_Auth_API
pip install -r requirements.txt
```

### Lancement
```bash
python app.py
```

L'API sera disponible sur `http://localhost:5004`

### Docker
```bash
docker build -t learner-auth-api .
docker run -p 5004:5004 learner-auth-api
```

### Variables d'environnement (emails SMTP)

Pour activer l'envoi d'email (réinitialisation de mot de passe) définissez :

```
SMTP_USER=tigerfox750@gmail.com
SMTP_PASS=<mot_de_passe_app_google>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_URL=http://localhost:3000
```

Utilisez **un mot de passe d'application** Google si votre compte a 2FA. Ne commitez jamais ces valeurs dans le repo.

---

## 📊 Modèle de données

### Table `apprenants`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | ID unique (auto-incrémenté) |
| `nom` | TEXT | Nom de famille |
| `prenom` | TEXT | Prénom |
| `age` | INTEGER | Âge |
| `niveau_scolaire` | TEXT | `secondaire`, `licence`, `master`, `doctorat` |
| `email` | TEXT | Email unique (login) |
| `password_hash` | TEXT | Mot de passe hashé (Werkzeug) |
| `sexe` | TEXT | `M`, `F`, `Autre` |
| `langue` | TEXT | `francais`, `anglais` |
| `notes_tuteur` | TEXT | Notes libres du tuteur (visible/modifiable par apprenant) |
| `points` | INTEGER | Points accumulés (défaut: 0) |
| `niveau` | TEXT | Niveau calculé automatiquement (voir ci-dessous) |
| `date_creation` | TIMESTAMP | Date inscription |
| `derniere_connexion` | TIMESTAMP | Dernière connexion |

### Système de niveaux (par seuils de 50 points)

| Niveau | Points requis |
|--------|---------------|
| `debutant1` | 0-49 |
| `debutant2` | 50-99 |
| `intermediaire1` | 100-149 |
| `intermediaire2` | 150-199 |
| `avance1` | 200-249 |
| `avance2` | 250+ |

**Note** : Le niveau est recalculé automatiquement à chaque ajout de points.

### Table `experts` (médecins)

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | ID unique |
| `nom` | TEXT | Nom |
| `prenom` | TEXT | Prénom |
| `email` | TEXT | Email unique |
| `password_hash` | TEXT | Mot de passe hashé |
| `domaine_expertise` | TEXT | Spécialité médicale (voir liste ci-dessous) |
| `etablissement` | TEXT | Établissement de santé (optionnel) |
| `annees_experience` | INTEGER | Années d'expérience (optionnel) |
| `date_creation` | TIMESTAMP | Date création |
| `derniere_connexion` | TIMESTAMP | Dernière connexion |

### Domaines d'expertise médicale disponibles

| Code | Label |
|------|-------|
| `cardiologie` | Cardiologie |
| `neurologie` | Neurologie |
| `pneumologie` | Pneumologie |
| `gastro-enterologie` | Gastro-entérologie |
| `nephrologie` | Néphrologie |
| `endocrinologie` | Endocrinologie |
| `rhumatologie` | Rhumatologie |
| `dermatologie` | Dermatologie |
| `pediatrie` | Pédiatrie |
| `geriatrie` | Gériatrie |
| `psychiatrie` | Psychiatrie |
| `medecine-generale` | Médecine Générale |
| `chirurgie-generale` | Chirurgie Générale |
| `gynecologie` | Gynécologie |
| `urologie` | Urologie |
| `ophtalmologie` | Ophtalmologie |
| `orl` | ORL |
| `oncologie` | Oncologie |
| `hematologie` | Hématologie |
| `infectiologie` | Infectiologie |
| `autre` | Autre |

### Table `gerants`

| Champ | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | ID unique |
| `nom` | TEXT | Nom |
| `prenom` | TEXT | Prénom |
| `email` | TEXT | Email unique |
| `password_hash` | TEXT | Mot de passe hashé |
| `date_creation` | TIMESTAMP | Date création |
| `derniere_connexion` | TIMESTAMP | Dernière connexion |

---

## 🔐 Authentification

### JWT Tokens
- **Expiration** : 30 jours (tokens longue durée)
- **Format Header** : `Authorization: Bearer <token>`
- **Algorithme** : HS256

### Types d'utilisateurs
- `apprenant` : Étudiant en médecine
- `expert` : Médecin / Expert médical
- `gerant` : Administrateur

---

## 📡 Endpoints

### 1. Auth - Authentification

#### `POST /auth/register` - Inscription apprenant

**Body (tous requis)** :
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 25,
  "niveau_scolaire": "licence",
  "email": "jean@example.com",
  "mot_de_passe": "password123",
  "sexe": "M",
  "langue": "francais"
}
```

**Réponse 201** :
```json
{
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "apprenant",
  "user": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 25,
    "niveau_scolaire": "licence",
    "email": "jean@example.com",
    "sexe": "M",
    "langue": "francais",
    "notes_tuteur": "",
    "points": 0,
    "niveau": "debutant1",
    "date_creation": "2025-11-16T10:30:00",
    "derniere_connexion": "2025-11-16T10:30:00"
  }
}
```

**Erreurs** :
- `400` : Champ manquant ou invalide
- `409` : Email déjà utilisé

---

#### `POST /auth/register/expert` - Inscription expert (médecin)

**Body** :
```json
{
  "nom": "Martin",
  "prenom": "Sophie",
  "email": "sophie.martin@hopital.fr",
  "mot_de_passe": "password123",
  "domaine_expertise": "cardiologie",
  "etablissement": "CHU de Yaoundé",
  "annees_experience": 10
}
```

**Champs requis** : `nom`, `prenom`, `email`, `mot_de_passe`, `domaine_expertise`
**Champs optionnels** : `etablissement`, `annees_experience`

**Réponse 201** :
```json
{
  "message": "Inscription expert réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "expert",
  "user": {
    "id": 1,
    "nom": "Martin",
    "prenom": "Sophie",
    "email": "sophie.martin@hopital.fr",
    "domaine_expertise": "cardiologie",
    "etablissement": "CHU de Yaoundé",
    "annees_experience": 10,
    "date_creation": "2025-12-05T10:30:00",
    "derniere_connexion": "2025-12-05T10:30:00"
  }
}
```

**Erreurs** :
- `400` : Champ manquant ou domaine_expertise invalide
- `409` : Email déjà utilisé

---

#### `GET /auth/domaines-expertise` - Liste des domaines d'expertise

**Réponse 200** :
```json
{
  "domaines": [
    "cardiologie", "neurologie", "pneumologie", "gastro-enterologie",
    "nephrologie", "endocrinologie", "rhumatologie", "dermatologie",
    "pediatrie", "geriatrie", "psychiatrie", "medecine-generale",
    "chirurgie-generale", "gynecologie", "urologie", "ophtalmologie",
    "orl", "oncologie", "hematologie", "infectiologie", "autre"
  ]
}
```

---

#### `POST /auth/login` - Connexion

**Body** :
```json
{
  "email": "jean@example.com",
  "mot_de_passe": "password123"
}
```

**Note** : La connexion fonctionne pour les 3 types d'utilisateurs (apprenant, expert, gérant). Le système recherche automatiquement dans les tables appropriées.

**Réponse 200** :
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_type": "apprenant",
  "user": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "points": 75,
    "niveau": "debutant2",
    ...
  }
}
```

**`user_type` possibles** : `apprenant`, `expert`, `gerant`

**Erreurs** :
- `400` : Email ou mot de passe manquant
- `401` : Identifiants incorrects

---

#### `POST /auth/reset-password` - Réinitialiser mot de passe

**Body** :
```json
{
  "email": "jean@example.com",
  "nouveau_mot_de_passe": "newpassword456"
}
```

**Réponse 200** :
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Erreurs** :
- `400` : Mot de passe trop court (< 6 caractères)
- `404` : Email non trouvé

---

#### `POST /auth/request-reset` - Demande de réinitialisation (envoie email)

**Body** :
```json
{ "email": "jean@example.com" }
```

**Réponse 200** :
```json
{ "message": "Si l'email existe, un lien de réinitialisation a été envoyé" }
```

**Notes** :
- Le token est stocké dans la table `password_resets` et est valide 1 heure.
- Pour envoyer l'email, définir les variables d'environnement `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`, `FRONTEND_URL`.

---

#### `POST /auth/confirm-reset` - Confirmer la réinitialisation via token

**Body (JSON)** :
```json
{ "token": "xxx", "nouveau_mot_de_passe": "newpassword" }
```

**Réponse 200** :
```json
{ "message": "Mot de passe réinitialisé avec succès" }
```

**Erreurs** :
- `400` : Token invalide ou mot de passe non valide
- `400` : Token expiré

---

### 2. Apprenant - Gestion profil

#### `GET /apprenant/<id>` - Récupérer profil

**Headers** : `Authorization: Bearer <token>`

**Réponse 200** :
```json
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 25,
  "niveau_scolaire": "licence",
  "email": "jean@example.com",
  "sexe": "M",
  "langue": "francais",
  "notes_tuteur": "[2025-11-15 10:30] Difficulté avec diagnostics différentiels",
  "points": 75,
  "niveau": "debutant2",
  "date_creation": "2025-11-01T08:00:00",
  "derniere_connexion": "2025-11-16T10:30:00"
}
```

**Erreurs** :
- `401` : Token manquant/invalide
- `403` : Accès non autorisé (autre apprenant)
- `404` : Apprenant non trouvé

---

#### `PUT /apprenant/<id>` - Modifier profil

**Headers** : `Authorization: Bearer <token>`

**Body (tous optionnels)** :
```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prénom",
  "age": 26,
  "niveau_scolaire": "master",
  "sexe": "F",
  "langue": "anglais"
}
```

**Réponse 200** :
```json
{
  "message": "Profil mis à jour",
  "user": {
    "id": 1,
    "nom": "Nouveau Nom",
    ...
  }
}
```

**Erreurs** :
- `400` : Aucun champ à mettre à jour ou valeur invalide
- `403` : Accès non autorisé

---

#### `GET /apprenant/<id>/stats` - Statistiques progression

**Headers** : `Authorization: Bearer <token>`

**Réponse 200** :
```json
{
  "points": 75,
  "niveau": "debutant2",
  "points_prochain_niveau": 100,
  "points_restants": 25,
  "date_creation": "2025-11-01T08:00:00"
}
```

---

### 3. Notes Tuteur

#### `GET /apprenant/<id>/notes-tuteur` - Lire notes

**Headers** : `Authorization: Bearer <token>`

**Réponse 200** :
```json
{
  "apprenant_id": 1,
  "notes_tuteur": "[2025-11-15 10:30] Difficulté avec diagnostics différentiels\n[2025-11-16 14:20] Excellente capacité d'analyse des symptômes"
}
```

---

#### `PUT /apprenant/<id>/notes-tuteur` - Remplacer notes (apprenant peut modifier)

**Headers** : `Authorization: Bearer <token>`

**Body** :
```json
{
  "notes_tuteur": "Nouvelles notes complètes..."
}
```

**Réponse 200** :
```json
{
  "message": "Notes du tuteur mises à jour",
  "apprenant_id": 1,
  "notes_tuteur": "Nouvelles notes complètes..."
}
```

---

#### `POST /apprenant/<id>/notes-tuteur/append` - Ajouter note (Tutor Agent)

**⚠️ Pas de token requis** (appelé par Tutor Agent)

**Body** :
```json
{
  "notes": "Confusion persistante entre paludisme simple et grave"
}
```

**Réponse 200** :
```json
{
  "message": "Note ajoutée",
  "apprenant_id": 1
}
```

**Note** : La note est horodatée automatiquement : `[2025-11-16 15:45] Confusion persistante...`

---

### 4. Points & Niveau

#### `POST /apprenant/<id>/points` - Ajouter points

**⚠️ Pas de token requis** (appelé par Tutor Agent)

**Body** :
```json
{
  "points": 10
}
```

**Réponse 200** :
```json
{
  "message": "Points ajoutés et niveau mis à jour",
  "apprenant_id": 1,
  "points_ajoutes": 10,
  "points_total": 85,
  "ancien_niveau": "debutant2",
  "nouveau_niveau": "debutant2",
  "niveau_change": false
}
```

**Exemple avec changement de niveau** :
```json
{
  "points": 20
}
```
Réponse si apprenant avait 95 points (debutant2) :
```json
{
  "message": "Points ajoutés et niveau mis à jour",
  "apprenant_id": 1,
  "points_ajoutes": 20,
  "points_total": 115,
  "ancien_niveau": "debutant2",
  "nouveau_niveau": "intermediaire1",
  "niveau_change": true
}
```

---

### 5. Gérant

#### `GET /gerant/<id>` - Profil gérant

**Headers** : `Authorization: Bearer <token>` (gérant uniquement)

**Réponse 200** :
```json
{
  "id": 1,
  "nom": "Admin",
  "prenom": "Système",
  "email": "admin@sti.com",
  "date_creation": "2025-11-01T08:00:00",
  "derniere_connexion": "2025-11-16T10:00:00"
}
```

---

#### `PUT /gerant/<id>` - Modifier profil gérant

**Headers** : `Authorization: Bearer <token>` (gérant uniquement)

**Body (optionnels)** :
```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prénom"
}
```

**Réponse 200** :
```json
{
  "message": "Profil mis à jour",
  "gerant": {
    "id": 1,
    "nom": "Nouveau Nom",
    ...
  }
}
```

---

### 6. Expert

#### `GET /expert/<id>` - Profil expert

**Headers** : `Authorization: Bearer <token>` (expert ou gérant)

**Réponse 200** :
```json
{
  "id": 1,
  "nom": "Diallo",
  "prenom": "Amadou",
  "email": "amadou.diallo@hopital.com",
  "domaine_expertise": "cardiologie",
  "date_creation": "2025-11-01T08:00:00",
  "derniere_connexion": "2025-11-16T10:00:00"
}
```

**Erreurs** :
- `401` : Token manquant/invalide
- `403` : Accès non autorisé (autre expert, sauf gérant)
- `404` : Expert non trouvé

---

#### `PUT /expert/<id>` - Modifier profil expert

**Headers** : `Authorization: Bearer <token>` (expert propriétaire ou gérant)

**Body (tous optionnels)** :
```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prénom",
  "domaine_expertise": "neurologie"
}
```

**Note** : `domaine_expertise` doit être parmi les domaines valides (voir `/auth/domaines-expertise`).

**Réponse 200** :
```json
{
  "message": "Profil mis à jour",
  "expert": {
    "id": 1,
    "nom": "Nouveau Nom",
    "prenom": "Nouveau Prénom",
    "email": "amadou.diallo@hopital.com",
    "domaine_expertise": "neurologie",
    ...
  }
}
```

**Erreurs** :
- `400` : Aucun champ à mettre à jour ou domaine invalide
- `403` : Accès non autorisé
- `404` : Expert non trouvé

---

#### `GET /expert/all` - Liste tous les experts

**Headers** : `Authorization: Bearer <token>` (gérant uniquement)

**Réponse 200** :
```json
{
  "experts": [
    {
      "id": 1,
      "nom": "Diallo",
      "prenom": "Amadou",
      "email": "amadou.diallo@hopital.com",
      "domaine_expertise": "cardiologie"
    },
    {
      "id": 2,
      "nom": "Mbeki",
      "prenom": "Sarah",
      "email": "sarah.mbeki@hopital.com",
      "domaine_expertise": "neurologie"
    }
  ]
}
```

**Erreurs** :
- `403` : Accès réservé aux gérants

---

## 🔗 Intégration avec Tutor Agent

### Workflow session apprentissage

1. **Début session** :
   ```
   Frontend → POST /auth/login → Récupère token + profil apprenant
   Frontend → POST /tutor/start_session (avec apprenant_id)
   Tutor Agent → GET /apprenant/<id> → Récupère profil complet
   Tutor Agent → Crée session_temp.txt avec contexte
   ```

2. **Pendant session** :
   ```
   Tutor Agent consulte session_temp.txt (profil, notes tuteur, cas clinique)
   Tutor Agent adapte feedback selon niveau/langue/niveau_scolaire
   ```

3. **Fin session** :
   ```
   Tutor Agent → POST /apprenant/<id>/points (ajoute points gagnés)
   Tutor Agent → POST /apprenant/<id>/notes-tuteur/append (si observation importante)
   ```

### Variables d'environnement Tutor Agent

Ajouter dans `.env` du Tutor Agent :
```bash
LEARNER_AUTH_API_URL=http://localhost:5004
```

---

## 🛠️ Configuration

### `config/app_config.json`

```json
{
  "database": {
    "path": "data/learners.db",
    "echo": false
  },
  "jwt": {
    "expiration_days": 30,
    "algorithm": "HS256"
  },
  "niveaux": {
    "debutant1": {"min": 0, "max": 49},
    "debutant2": {"min": 50, "max": 99},
    "intermediaire1": {"min": 100, "max": 149},
    "intermediaire2": {"min": 150, "max": 199},
    "avance1": {"min": 200, "max": 249},
    "avance2": {"min": 250, "max": 999999}
  },
  "password": {
    "min_length": 6
  }
}
```

### Variables d'environnement

```bash
SECRET_KEY=votre-secret-key-production
JWT_SECRET_KEY=votre-jwt-secret-production
PORT=5004
```

---

## 🧪 Tests avec cURL

### Inscription
```bash
curl -X POST http://localhost:5004/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "age": 25,
    "niveau_scolaire": "licence",
    "email": "jean@test.com",
    "mot_de_passe": "password123",
    "sexe": "M",
    "langue": "francais"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:5004/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean@test.com",
    "mot_de_passe": "password123"
  }'
```

### Récupérer profil (avec token)
```bash
curl -X GET http://localhost:5004/apprenant/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Ajouter points (Tutor Agent)
```bash
curl -X POST http://localhost:5004/apprenant/1/points \
  -H "Content-Type: application/json" \
  -d '{"points": 15}'
```

### Ajouter note tuteur (Tutor Agent)
```bash
curl -X POST http://localhost:5004/apprenant/1/notes-tuteur/append \
  -H "Content-Type: application/json" \
  -d '{"notes": "Excellente progression sur les RED FLAGS"}'
```

---

## 📝 Codes d'erreur

| Code | Description |
|------|-------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Requête invalide (champ manquant/incorrect) |
| `401` | Non authentifié (token manquant/invalide) |
| `403` | Non autorisé (accès interdit) |
| `404` | Ressource non trouvée |
| `409` | Conflit (email déjà existant) |
| `500` | Erreur serveur |

---

## 🔒 Sécurité

- **Mots de passe** : Hashés avec Werkzeug (PBKDF2)
- **Tokens JWT** : Signés avec secret key (HS256)
- **Validation** : Email format, longueur mot de passe (min 6), valeurs enum
- **CORS** : Activé pour frontend Next.js
- **Protection routes** : Décorateurs `@token_required`, `@apprenant_only`, `@gerant_only`

---

## 📚 Architecture

```
Learner_Auth_API/
├── app.py                  # Point d'entrée Flask
├── requirements.txt        # Dépendances Python
├── Dockerfile             # Container Docker
├── config/
│   └── app_config.json    # Configuration niveaux/JWT/BD
├── models/
│   └── database.py        # Schéma SQLite + helpers
├── routes/
│   ├── auth.py           # Endpoints auth (register/login/reset)
│   ├── apprenant.py      # Endpoints profil apprenant (CRUD/stats)
│   ├── notes.py          # Endpoints notes tuteur
│   ├── points.py         # Endpoints points/niveau
│   └── gerant.py         # Endpoints gérant
├── utils/
│   └── auth.py           # JWT + hashing + décorateurs
└── data/
    └── learners.db       # Base SQLite (créée auto)
```

---

## 🤝 Support

Pour toute question ou problème :
- Vérifier les logs : `logs/`
- Tester la santé API : `GET /health`
- Consulter cette documentation

---

**Version** : 1.0.0  
**Auteur** : STI-MedTutor Team  
**Date** : Novembre 2025
