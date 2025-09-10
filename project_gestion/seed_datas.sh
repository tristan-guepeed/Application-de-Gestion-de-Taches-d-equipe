#!/bin/bash

BASE_URL="http://localhost:8000/api"
REGISTER_URL="$BASE_URL/users/register/"
TOKEN_URL="$BASE_URL/users/token/"
PROJECTS_URL="$BASE_URL/projects/"
TASKS_URL="$BASE_URL/tasks/"

# -----------------------
# 1. Création des users
# -----------------------
USERS=("toto" "tata" "tutu" "test")
for USER in "${USERS[@]}"; do
  echo "Création de l'utilisateur: $USER"
  curl -s -X POST "$REGISTER_URL" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USER\", \"password\": \"$USER\"}" > /dev/null
done

# -----------------------
# 2. Récupération tokens
# -----------------------
declare -A TOKENS
for USER in "${USERS[@]}"; do
  TOKEN=$(curl -s -X POST "$TOKEN_URL" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USER\", \"password\": \"$USER\"}" \
    | jq -r '.access')
  TOKENS[$USER]=$TOKEN
  echo "Token récupéré pour $USER"
done

# -----------------------
# 3. Projet de Toto
# -----------------------
echo "Création du projet de toto..."
PROJECT1=$(curl -s -X POST "$PROJECTS_URL" \
  -H "Authorization: Bearer ${TOKENS[toto]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Projet de Toto\",
    \"description\": \"Projet créé par Toto\",
    \"members\": [
      {\"id\": 3, \"role\": \"manager\"},
      {\"id\": 4, \"role\": \"member\"}
    ]
  }")

PROJECT1_ID=$(echo $PROJECT1 | jq -r '.id')
echo "Projet de Toto créé avec ID $PROJECT1_ID"

# Ajout de tâches
echo "Ajout de tâches au projet de Toto..."
curl -s -X POST "$TASKS_URL" \
  -H "Authorization: Bearer ${TOKENS[toto]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"project\": $PROJECT1_ID,
    \"title\": \"Configurer le repo\",
    \"description\": \"Initialiser le projet sur GitHub\",
    \"status\": \"TODO\",
    \"priority\": \"HIGH\",
    \"assignees\": [3],
    \"due_date\": \"2025-09-20\"
  }" > /dev/null

curl -s -X POST "$TASKS_URL" \
  -H "Authorization: Bearer ${TOKENS[toto]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"project\": $PROJECT1_ID,
    \"title\": \"Écrire la doc\",
    \"description\": \"Documentation du projet\",
    \"status\": \"TODO\",
    \"priority\": \"MEDIUM\",
    \"assignees\": [4],
    \"due_date\": \"2025-09-22\"
  }" > /dev/null


# -----------------------
# 4. Projet de Tutu
# -----------------------
echo "Création du projet de tutu..."
PROJECT2=$(curl -s -X POST "$PROJECTS_URL" \
  -H "Authorization: Bearer ${TOKENS[tutu]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Projet de Tutu\",
    \"description\": \"Projet créé par Tutu\",
    \"members\": [
      {\"id\": 2, \"role\": \"member\"},
      {\"id\": 1, \"role\": \"member\"}
    ]
  }")

PROJECT2_ID=$(echo $PROJECT2 | jq -r '.id')
echo "Projet de Tutu créé avec ID $PROJECT2_ID"

# Ajout de tâches
echo "Ajout de tâches au projet de Tutu..."
curl -s -X POST "$TASKS_URL" \
  -H "Authorization: Bearer ${TOKENS[tutu]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"project\": $PROJECT2_ID,
    \"title\": \"Créer le backlog\",
    \"description\": \"Lister toutes les fonctionnalités\",
    \"status\": \"TODO\",
    \"priority\": \"CRITICAL\",
    \"assignees\": [2],
    \"due_date\": \"2025-09-18\"
  }" > /dev/null

curl -s -X POST "$TASKS_URL" \
  -H "Authorization: Bearer ${TOKENS[tutu]}" \
  -H "Content-Type: application/json" \
  -d "{
    \"project\": $PROJECT2_ID,
    \"title\": \"Setup CI/CD\",
    \"description\": \"Mettre en place l’intégration continue\",
    \"status\": \"TODO\",
    \"priority\": \"HIGH\",
    \"assignees\": [1],
    \"due_date\": \"2025-09-25\"
  }" > /dev/null


echo "Population terminée ✅"
