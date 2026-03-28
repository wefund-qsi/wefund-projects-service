# Projet 1 : Microservice Projets & Campagnes — WeFund POC

Ce dépôt contient le code du microservice responsable de la gestion des projets et des campagnes de financement pour la plateforme WeFund.

## Informations générales

| Propriété      | Valeur                                                               |
|----------------|----------------------------------------------------------------------|
| Base URL (dev) | `http://localhost:3000/api`                                          |
| Spécifications | [Voir le contrat d'API détaillé (API_CONTRAT.md)](./API_CONTRAT.md) |

---

## Authentification & Rôles

L'authentification est déléguée au **microservice utilisateurs (Projet 2)**.
Toutes les routes marquées 🔒 nécessitent un token JWT valide dans le header :

```
Authorization: Bearer <TOKEN>
```

Les routes `GET` publiques (liste et détail des projets/campagnes) sont accessibles sans token.



## Fonctionnalités (User Stories)

#### Gestion des projets

- [x] **US1 — Créer un projet** 
- [x] **US4 — Consulter les projets (liste + détail)**

#### Gestion des campagnes

- [x] **US2 — Créer une campagne de financement** 
- [x] **US3 — Modifier une campagne (brouillon uniquement)**
- [x] **US4 — Consulter les campagnes**
- [x] **US5 — Clôture automatique d'une campagne à échéance**
- [x] **US6 — Publier des actualités sur une campagne**
- [x] **US7 — Consulter les statistiques d'une campagne**
- [x] **US8 — Dupliquer une campagne terminée**

---

## Règles de gestion

- [x] **RG1 — Une campagne possède au minimum : titre, description, objectif financier, date de fin, porteur identifié** 
- [x] **RG2 — Un projet possède au minimum : titre, description, photo** 
- [ ] RG3 — Une campagne ne peut plus être modifiée après publication
- [x] RG4 — Statuts possibles : `BROUILLON`, `EN_ATTENTE`, `ACTIVE`, `REUSSIE`, `ECHOUEE`, `REFUSEE`

---

##  Installation et Lancement

Le projet est entièrement dockerisé pour faciliter le déploiement et garantir la cohérence de l'environnement.

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et lancé.
- [Postman](https://www.postman.com/downloads/) pour tester les endpoints.

### Démarrage rapide

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/votre-repo/wefund-projects-service.git
   cd wefund-projects-service
   ```

2. **Lancer l'infrastructure :**

   ```bash
   docker-compose up --build
   ```

### Services disponibles

- **API NestJS** : accessible sur `http://localhost:3000/api`
- **PostgreSQL** : tourne sur le port `5433` (externe) / `5432` (interne)
- **pgAdmin** : disponible pour la gestion de la base de données

---

##  Vérification

Une fois les conteneurs lancés, ouvrez votre navigateur et accédez à `http://localhost:3000/api`. Vous devriez recevoir une réponse confirmant que l'API est opérationnelle.

---

##  Tests avec Postman

Un dossier `/postman` est inclus à la racine du dépôt. Il contient les collections permettant de tester l'ensemble des endpoints du microservice.

### Procédure de test

1. **Ouvrir Postman** (Desktop Agent ou Application).
2. **Importer la collection** : Fichier > Import > Sélectionner le fichier `.json` présent dans le dossier `/postman`.
3. **Configurer l'environnement** : Assurez-vous que l'URL pointe vers `http://localhost:3000/api`.
4. **Exécuter les requêtes** : Les requêtes sont organisées par User Stories (US). Vous pouvez tester la création, la lecture et la validation des données en un clic.

---

##  Structure du Projet

Le microservice suit une architecture modulaire NestJS, séparant les responsabilités par domaine :

```plaintext
wefund-projects-service/
├── postman/                         # Collections Postman pour les tests
│   ├── US_Campagne.json
│   └── US_Creation_Projet.json
├── src/
│   ├── campagnes/                   # Module de gestion des Campagnes
│   │   ├── application/             # Logique métier
│   │   │   └── campagnes.service.ts
│   │   ├── domain/                  # Entités métier
│   │   │   └── campagne.entity.ts
│   │   ├── dto/                     # DTOs et validation
│   │   │   └── create-campagne.dto.ts
│   │   │   └── update-campagne.dto.ts
│   │   ├── infrastructure/          # Contrôleurs / points d’entrée
│   │   │   └── campagne.controller.ts
│   │   └── campagnes.module.ts
│   ├── projects/                    # Module de gestion des Projets
│   │   ├── application/             # Logique métier
│   │   │   └── projects.service.ts
│   │   ├── domain/                  # Entités métier
│   │   │   └── project.entity.ts
│   │   ├── dto/                     # DTOs et validation
│   │   │   └── create-project.dto.ts
│   │   ├── infrastructure/          # Contrôleurs / points d’entrée
│   │   │   └── projects.controller.ts
│   │   └── projects.module.ts
│   ├── app.module.ts                # Module racine et configuration globale
│   └── main.ts                      # Point d’entrée de l’application
├── .env                             # Variables d’environnement
├── docker-compose.yml               # Orchestration Docker (si présent)
├── Dockerfile                       # Image Docker de l’API (si présent)
└── README.md                        # Documentation du projet
```

---

##  Récapitulatif des endpoints

Pour le détail des payloads (corps de requêtes) et des réponses, veuillez consulter le [Contrat d'API](./API_CONTRAT.md).

| Méthode | Route                          | Description                                             |
|---------|--------------------------------|-------------------------------------------------------- |                    
| `POST`  | `/projets`                     | Créer un projet                                         |
| `GET`   | `/projets`                     | Lister les projets                                      |
| `GET`   | `/projets/:id`                 | Détail d'un projet                                      |
| `DELETE`| `/projets/:id`                 | Supprimer un projet                                     |
| `POST`  | `/campagnes`                   | Créer une campagne                                      |
| `GET`   | `/campagnes`                   | Lister les campagnes                                    |
| `GET`   | `/campagnes/:id`               | Détail d'une campagne                                   |
| `PATCH` | `/campagnes/:id`               | Modifier une campagne (brouillon)                       |
| `POST`  | `/campagnes/:id/dupliquer`     | Dupliquer une campagne terminée                         |
| `POST`  | `/campagnes/:id/actualites`    | Publier une actualité                                   |
| `GET`   | `/campagnes/:id/actualites`    | Lister les actualités                                   |
| `GET`   | `/campagnes/:id/stats`         | Statistiques d'une campagne                             |
| `PATCH  |`/campagnes/:id/moderation` 🔒  | Valider/Refuser une campagne(Admin)                     |
| `POST`  |`	/campagnes/:id/soumettre`	 | Soumettre une campagne (Passe de BROUILLON à EN_ATTENTE)|
