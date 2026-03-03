# 🚀 WeFund — Microservice Projets & Campagnes

> POC WeFund — Projet 1  
> Gestion du cycle de vie des projets et campagnes de financement participatif.  
> Date cible POC : fin mars 2026  
> MVP : septembre 2026

---

# 📖 Contexte

WeFund est une plateforme de financement participatif inspirée de solutions comme Ulule ou KissKissBankBank.

Ce microservice gère :

- La création et gestion des projets
- La gestion des campagnes de financement
- La modération des campagnes
- Les statistiques et actualités
- Les événements inter-services via RabbitMQ

Conforme au cahier des charges officiel du POC WeFund.

---

# 🏗️ Architecture

Architecture recommandée :

- ✅ Architecture hexagonale (domain / application / infrastructure)
- ✅ Approche contract-first (OpenAPI)
- ✅ Communication REST synchrone
- ✅ Communication asynchrone via RabbitMQ
- ✅ Séparation controller → use cases → repository

---

# 📦 Stack technique

| Couche | Technologie |
|--------|------------|
| Langage | TypeScript (strict) |
| Runtime | Node.js 24 |
| Framework | NestJS (recommandé) / Express / Fastify |
| Base de données | PostgreSQL |
| ORM | Prisma ou TypeORM |
| Message broker | RabbitMQ |
| Conteneurisation | Docker |
| Déploiement | Render.com (recommandé) |

---

# 👥 Rôles fonctionnels

- Porteur de projet
- Contributeur
- Administrateur
- Visiteur anonyme

---

# ✅ User Stories couvertes

- US1 — Créer un projet
- US2 — Créer une campagne
- US3 — Modifier une campagne (si non validée)
- US4 — Consulter les campagnes
- US5 — Clôture automatique à échéance
- US6 — Publier des actualités
- US7 — Consulter les statistiques
- US8 — Dupliquer une campagne

---

# 📜 Règles de gestion

## RG1 — Une campagne possède au minimum :

- titre
- description
- objectif financier
- date de fin
- porteur identifié

## RG2 — Un projet possède :

- titre
- description
- photo

## RG3 — Une campagne ne peut plus être modifiée après publication.

## RG4 — Statuts possibles :

- BROUILLON
- EN_ATTENTE
- ACTIVE
- REUSSIE
- ECHOUEE
- REFUSEE

---

# 🌐 Informations générales API

Base URL (dev):
