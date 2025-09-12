# 🚀 Gestion de Projets

![Project Banner](https://img.shields.io/badge/Project-Gestion%20de%20Projets-blue)
![Python](https://img.shields.io/badge/Python-3.12.3-blue)
![Django](https://img.shields.io/badge/Django-5.2.6-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.10-blue)
![Docker](https://img.shields.io/badge/Docker-28.3.3-blue)

---

## 📄 Description

Application de **gestion de projets** permettant de créer et gérer :

- ✅ Projets (création, modification, transfert de propriété, suppression)
- ✅ Tâches avec statut, priorité, assignation et date limite
- 🔐 Authentification JWT
- 🖥 Frontend en **React + Chakra UI** avec drag & drop, filtres et modales

---

## 🛠 Prérequis

- **Node.js** : v22.19.0  
- **npm** : v10.9.3  
- **Python** : 3.12.3  
- **Django** : 5.2.6  
- **PostgreSQL** : 16.10  
- **Docker** : 28.3.3  

---

## ⚡ Installation

### 📦 Avec Docker

```bash
docker compose build
docker compose up -d
```
### Urls

[Backend](http://localhost:8000)
[Frontend](http://localhost:3000)


### 💻 En local

#### Backend

```bash
cd project_gestion
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
```

Modifier settings.py pour configurer l'host de la base de données, puis lancer :
```bash
python manage.py runserver
```

#### Frontend

```bash
cd front
npm install
npm run dev
```

Pour ajouter des données préfaites :
```bash
./project_gestion/scripts/seed_datas.sh
```


## 🔗 Backend

Authentification
- JWT via djangorestframework_simplejwt

### Routes
| Ressource     | Méthode | URL                                      | Description                                 |
| ------------- | ------- | ---------------------------------------- | ------------------------------------------- |
| Projet        | POST    | `/api/projects/`                         | Créer un projet                             |
| Projet        | PATCH   | `/api/projects/{id}/transfer_ownership/` | Transférer la propriété                     |
| Projet        | PATCH   | `/api/projects/{id}/`                    | Modifier un projet                          |
| Projet        | GET     | `/api/projects/`                         | Obtenir mes projets                         |
| Projet        | DELETE  | `/api/projects/{id}/`                    | Supprimer un projet                         |
| Tâche         | POST    | `/api/tasks/`                            | Créer une tâche                             |
| Tâche         | GET     | `/api/tasks/?filter`                     | Filtrer par statut/priorité/projet/assignee |
| Tâche         | GET     | `/api/tasks/{id}/`                       | Récupérer une tâche                         |
| Tâche         | PATCH   | `/api/tasks/{id}/`                       | Modifier une tâche                          |
| Tâche         | DELETE  | `/api/tasks/{id}/`                       | Supprimer une tâche                         |
| Utilisateur   | POST    | `/api/users/register/`                   | Création de compte                          |
| Utilisateur   | POST    | `/api/users/token/`                      | Login                                       |
| Utilisateur   | POST    | `/api/users/token/refresh/`              | Refresh token                               |
| Utilisateur   | GET     | `/api/users/`                            | Liste des utilisateurs                      |
| Utilisateur   | GET     | `/api/users/me/`                         | Infos du user courant                       |
| Documentation | GET     | `/api/docs/swagger/`                     | Swagger UI                                  |
| Documentation | GET     | `/api/docs/redoc/`                       | Redoc UI                                    |


## 🗄 Base de données

### Tables et Relations

### 1️⃣ `users`
| Colonne       | Type                       | Nullable | Description                       |
|---------------|----------------------------|----------|-----------------------------------|
| id            | integer                    | ❌       | Clé primaire, auto-increment      |
| password      | varchar(128)               | ❌       | Mot de passe hashé                |
| last_login    | timestamp with time zone   | ✅       | Dernière connexion                |
| is_superuser  | boolean                    | ❌       | Super-utilisateur                 |
| username      | varchar(150)               | ❌       | Nom d’utilisateur                 |
| first_name    | varchar(150)               | ❌       | Prénom                             |
| last_name     | varchar(150)               | ❌       | Nom de famille                     |
| email         | varchar(254)               | ❌       | Email                               |
| is_staff      | boolean                    | ❌       | Accès admin                        |
| is_active     | boolean                    | ❌       | Compte actif                       |
| date_joined   | timestamp with time zone   | ❌       | Date d’inscription                 |

---

### 2️⃣ `project`
| Colonne       | Type                       | Nullable | Description                       |
|---------------|----------------------------|----------|-----------------------------------|
| id            | bigint                     | ❌       | Clé primaire                      |
| created_at    | timestamp with time zone   | ❌       | Date de création                  |
| updated_at    | timestamp with time zone   | ❌       | Date de modification              |
| name          | varchar(200)               | ❌       | Nom du projet                     |
| description   | text                       | ❌       | Description                       |
| owner_id      | integer                    | ❌       | FK → `users.id` (propriétaire)    |

---

### 3️⃣ `project_member`
| Colonne       | Type                       | Nullable | Description                       |
|---------------|----------------------------|----------|-----------------------------------|
| id            | bigint                     | ❌       | Clé primaire                      |
| role          | varchar(20)                | ❌       | Rôle dans le projet (member/owner)|
| project_id    | bigint                     | ❌       | FK → `project.id`                 |
| user_id       | integer                    | ❌       | FK → `users.id`                   |

---

### 4️⃣ `task`
| Colonne       | Type                       | Nullable | Description                       |
|---------------|----------------------------|----------|-----------------------------------|
| id            | bigint                     | ❌       | Clé primaire                      |
| created_at    | timestamp with time zone   | ❌       | Date de création                  |
| updated_at    | timestamp with time zone   | ❌       | Date de modification              |
| title         | varchar(200)               | ❌       | Titre de la tâche                 |
| description   | text                       | ❌       | Description                       |
| status        | varchar(20)                | ❌       | Statut (ex: todo, in-progress)   |
| priority      | varchar(20)                | ❌       | Priorité (ex: low, medium, high) |
| due_date      | date                       | ✅       | Date limite                        |
| completed_at  | timestamp with time zone   | ✅       | Date de complétion                 |
| created_by_id | integer                    | ✅       | FK → `users.id`                   |
| project_id    | bigint                     | ❌       | FK → `project.id`                 |

---

### 5️⃣ `task_assignees`
| Colonne       | Type                       | Nullable | Description                       |
|---------------|----------------------------|----------|-----------------------------------|
| id            | bigint                     | ❌       | Clé primaire                      |
| task_id       | bigint                     | ❌       | FK → `task.id`                    |
| user_id       | integer                    | ❌       | FK → `users.id`                   |

---

## 🔗 Relations principales

```text
users.id ───< project.owner_id
users.id ───< project_member.user_id
project.id ───< project_member.project_id
project.id ───< task.project_id
users.id ───< task.created_by_id
task.id ───< task_assignees.task_id
users.id ───< task_assignees.user_id
```


## 🖥 Frontend

- Framework: React + TypeScript + Vite
- UI : Chakra UI
- Architecture :
```bash
src/
├─ api/         # appels axios pour projects/tasks
├─ components/  # modales, formulaires, UI
├─ context/     # auth context
├─ pages/       # Dashboard, ProjectDetail, Login, Register
├─ routes/      # PrivateRoute, AppRoutes
├─ theme/       # theme Chakra UI
├─ types/       # TS types
```

### 🔧 Points techniques

- Drag & drop des tâches par status
- Filtres par priorité
- Assignation multi-users avec liste déroulante (React Select)
- Modales de création et édition de projets et tâches
- Utilisation de Chakra UI pour cohérence du thème et composants


## ⚙ Commandes utiles

### Backend

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
npm install
npm run dev
```

### Docker

```bash
docker compose build
docker compose up -d
docker compose down
```
