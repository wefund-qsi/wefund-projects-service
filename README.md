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

### Rôles pris en charge

| Rôle           | Description                                   |
|----------------|-----------------------------------------------|
| `PORTEUR`      | Crée et gère ses propres projets et campagnes |
| `CONTRIBUTEUR` | Consulte les campagnes                        |
| `ADMIN`        | Valide ou refuse les campagnes                |
| `VISITEUR`     | Accès lecture seule, sans authentification    |

---

## Fonctionnalités (User Stories)

#### Gestion des projets

- [x] **US1 — Créer un projet** [Réalisé]
- [x] **US4 — Consulter les projets (liste + détail)** [Réalisé]

#### Gestion des campagnes

- [x] **US2 — Créer une campagne de financement** [Réalisé]
- [ ] US3 — Modifier une campagne (brouillon uniquement)
- [ ] US4 — Consulter les campagnes
- [ ] US5 — Clôture automatique d'une campagne à échéance
- [ ] US6 — Publier des actualités sur une campagne
- [ ] US7 — Consulter les statistiques d'une campagne
- [ ] US8 — Dupliquer une campagne terminée

#### Modération (Admin)

- [ ] Valider une campagne (`EN_ATTENTE` → `ACTIVE`)
- [ ] Refuser une campagne (`EN_ATTENTE` → `REFUSEE`)

---

## Règles de gestion

- [x] **RG1 — Une campagne possède au minimum : titre, description, objectif financier, date de fin, porteur identifié**
- [x] **RG2 — Un projet possède au minimum : titre, description, photo** (Implémenté)
- [ ] RG3 — Une campagne ne peut plus être modifiée après publication
- [ ] RG4 — Statuts possibles : `BROUILLON`, `EN_ATTENTE`, `ACTIVE`, `REUSSIE`, `ECHOUEE`, `REFUSEE`

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
├── postman/                # Collection Postman pour les tests
├── src/
│   ├── projects/           # Module de gestion des Projets
│   │   ├── domain/         # Entités TypeORM (Project.entity.ts)
│   │   ├── application/    # Logique métier (Services)
│   │   ├── infrastructure/ # Points d'entrée (Controllers)
│   │   ├── dto/            # Data Transfer Objects (Validation)
│   │   └── projects.module.ts
│   ├── app.module.ts       # Module racine et config TypeORM
│   └── main.ts             # Initialisation de l'application
├── docker-compose.yml      # Orchestration (API + DB + pgAdmin)
├── Dockerfile              # Image Docker de l'API
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

| Méthode | Route                          | Auth             | Description                       |
|---------|--------------------------------|------------------|-----------------------------------|
| `POST`  | `/projets`                     | 🔒 PORTEUR       | Créer un projet                   |
| `GET`   | `/projets`                     | Public           | Lister les projets                |
| `GET`   | `/projets/:id`                 | Public           | Détail d'un projet                |
| `PATCH` | `/projets/:id`                 | 🔒 PORTEUR       | Modifier un projet                |
| `DELETE`| `/projets/:id`                 | 🔒 PORTEUR       | Supprimer un projet               |
| `POST`  | `/campagnes`                   | 🔒 PORTEUR       | Créer une campagne                |
| `GET`   | `/campagnes`                   | Public           | Lister les campagnes              |
| `GET`   | `/campagnes/:id`               | Public           | Détail d'une campagne             |
| `PATCH` | `/campagnes/:id`               | 🔒 PORTEUR       | Modifier une campagne (brouillon) |
| `POST`  | `/campagnes/:id/soumettre`     | 🔒 PORTEUR       | Soumettre à validation            |
| `POST`  | `/campagnes/:id/dupliquer`     | 🔒 PORTEUR       | Dupliquer une campagne terminée   |
| `POST`  | `/campagnes/:id/actualites`    | 🔒 PORTEUR       | Publier une actualité             |
| `GET`   | `/campagnes/:id/actualites`    | Public           | Lister les actualités             |
| `GET`   | `/campagnes/:id/stats`         | 🔒 PORTEUR/ADMIN | Statistiques d'une campagne       |
| `POST`  | `/admin/campagnes/:id/valider` | 🔒 ADMIN         | Valider une campagne              |
| `POST`  | `/admin/campagnes/:id/refuser` | 🔒 ADMIN         | Refuser une campagne              |
