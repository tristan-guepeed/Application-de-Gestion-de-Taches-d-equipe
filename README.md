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
[Frontend](http://localhost:5173)


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

```text
┌────────────┐          ┌───────────────┐
│  auth_user │          │    project    │
│────────────│          │───────────────│
│ id (PK)    │◄────┐    │ id (PK)       │
│ username   │     │    │ name          │
│ email      │     │    │ description   │
│ password   │     │    │ owner_id (FK) │────┐
│ is_staff   │     │    │ created_at    │    │
│ is_active  │     │    │ updated_at    │    │
└────────────┘     │    └───────────────┘    │
                   │                         │
                   │                         │
                   │                         │
                   │    ┌───────────────────┐│
                   │    │ project_member    ││
                   │    │───────────────────││
                   │    │ id (PK)           ││
                   │    │ project_id (FK)───┘│
                   │    │ user_id (FK)───────┘
                   │    │ role               │
                   │    └───────────────────┘
                   │
                   │    ┌───────────────┐
                   │    │     task      │
                   │    │───────────────│
                   │    │ id (PK)       │
                   └───▶│ project_id (FK)│
                        │ title          │
                        │ description    │
                        │ status         │
                        │ priority       │
                        │ created_by_id(FK)
                        │ due_date       │
                        │ completed_at   │
                        │ created_at     │
                        │ updated_at     │
                        └───────────────┘
                              │
                              │ ManyToMany
                              ▼
                        ┌───────────────┐
                        │ task_assignees│
                        │───────────────│
                        │ id (PK)       │
                        │ task_id (FK)  │
                        │ user_id (FK)  │
                        └───────────────┘
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
