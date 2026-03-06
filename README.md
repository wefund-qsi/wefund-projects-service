# Projet 1 : Microservice Projets & Campagnes — WeFund POC

Ce dépôt contient le code du microservice responsable de la gestion des projets et des campagnes de financement pour la plateforme WeFund. 

## Informations générales

| Propriété      | Valeur                                                                |
|----------------|-----------------------------------------------------------------------|
| Base URL (dev) | `http://localhost:3000/api`                                           |
| Spécifications | [Voir le contrat d'API détaillé (API_CONTRACT.md)](./API_CONTRACT.md) |

## Authentification & Rôles

L'authentification est déléguée au **microservice utilisateurs (Projet 2)**.
Toutes les routes marquées 🔒 nécessitent un token JWT valide dans le header :
`Authorization: Bearer <TOKEN>`

Les routes `GET` publiques (liste et détail des projets/campagnes) sont accessibles sans token.

### Rôles pris en charge

| Rôle           | Description                                   |
|----------------|-----------------------------------------------|
| `PORTEUR`      | Crée et gère ses propres projets et campagnes |
| `CONTRIBUTEUR` | Consulte les campagnes                        |
| `ADMIN`        | Valide ou refuse les campagnes                |
| `VISITEUR`     | Accès lecture seule, sans authentification    |

### Fonctionnalités (User Stories)

#### Gestion des projets
[ ] US1 — Créer un projet
[ ] US4 — Consulter les projets (liste + détail)

#### Gestion des campagnes
[ ] US2 — Créer une campagne de financement
[ ] US3 — Modifier une campagne (brouillon uniquement)
[ ] US4 — Consulter les campagnes
[ ] US5 — Clôture automatique d'une campagne à échéance 
[ ] US6 — Publier des actualités sur une campagne
[ ] US7 — Consulter les statistiques d'une campagne
[ ] US8 — Dupliquer une campagne terminée

#### Modération (Admin)
[ ] Valider une campagne (EN_ATTENTE → ACTIVE)
[ ] Refuser une campagne (EN_ATTENTE → REFUSEE)

### Règles de gestion
[ ] RG1 — Une campagne possède au minimum : titre, description, objectif financier, date de fin, porteur identifié
[ ] RG2 — Un projet possède au minimum : titre, description, photo
[ ] RG3 — Une campagne ne peut plus être modifiée après publication
[ ] RG4 — Statuts possibles : BROUILLON, EN_ATTENTE, ACTIVE, REUSSIE, ECHOUEE, REFUSEE


## Récapitulatif des endpoints

*Pour le détail des payloads (corps de requêtes) et des réponses, veuillez consulter le [Contrat d'API](./API_CONTRACT.md).*

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



