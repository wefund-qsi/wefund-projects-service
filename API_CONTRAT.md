# Contrat API — Microservice Projets & Campagnes

## Ressource : Projets

### `PUT /projets` 🔒
> Crée un nouveau projet. **Rôle requis : PORTEUR**
> Story 1 : En tant que porteur de projet, je peux créer un projet.

**Corps de la requête**

```json
{
  "titre": "Ma campagne innovante",                   // string, requis, 3–100 caractères
  "description": "Description détaillée de mon projet...", // string, requis, 10–2000 caractères
  "photo": "https://example.com/photo.jpg"            // string, requis, URL valide
}
```

**Réponse `201 Created`**

```json
{
  "id": "cm1q2r3s4t5u6v7w8x9y0z1a2",
  "titre": "Ma campagne innovante",
  "description": "Description détaillée de mon projet...",
  "photo": "https://example.com/photo.jpg",
  "idPorteur": "cm9x8y7z6w5v4u3t2s1r0q",
  "dateCreation": "2026-03-03T10:30:00.000Z",
  "dateMiseAJour": "2026-03-03T10:30:00.000Z"
}
```

**Erreurs possibles**
- `400`, Champ manquant ou invalide 
- `401`, Token absent ou expiré     

## Ressource : Campagnes

### Statuts possibles

| Valeur       | Description                                     |
|--------------|-------------------------------------------------|
| `BROUILLON`  | Campagne en cours de rédaction, modifiable      |
| `EN_ATTENTE` | Soumise à validation par l'administrateur       |
| `ACTIVE`     | Validée et ouverte aux contributions            |
| `REUSSIE`    | Objectif atteint à échéance                     |
| `ECHOUEE`    | Échéance dépassée sans avoir atteint l'objectif |
| `REFUSEE`    | Refusée par l'administrateur                    |

### `POST /campagnes` 🔒
> Crée une campagne pour un projet existant. **Rôle requis : PORTEUR**
> Story 2 : En tant que porteur de projet, je peux créer une campagne de financement.

**Corps de la requête**

```json
{
  "titre": "Financement pour mon projet innovant",  // string, requis, 3–100 caractères
  "description": "Aidez-nous à lancer notre produit...", // string, requis, 10–2000 caractères
  "objectif": 5000,                                 // number, requis, > 0
  "dateFin": "2026-06-30T23:59:59.999Z",            // string, requis, date future ISO 8601
  "idProjet": "cm1q2r3s4t5u6v7w8x9y0z1a2"          // string, requis, ID projet du porteur
}
```

**Réponse `201 Created`**

```json
{
  "id": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "titre": "Financement pour mon projet innovant",
  "description": "Aidez-nous à lancer notre produit...",
  "objectif": 5000,
  "montantCollecte": 0,
  "dateFin": "2026-06-30T23:59:59.999Z",
  "statut": "BROUILLON",
  "idPorteur": "cm9x8y7z6w5v4u3t2s1r0q",
  "idProjet": "cm1q2r3s4t5u6v7w8x9y0z1a2",
  "dateCreation": "2026-03-03T11:00:00.000Z",
  "dateMiseAJour": "2026-03-03T11:00:00.000Z"
}
```

**Erreurs possibles**
- `400`, Champ manquant ou invalide       
- `401`, Non authentifié                  
- `403`, Le projet ne vous appartient pas 
- `404`,  Projet introuvable               

---

### `GET /campagnes`
> Liste les campagnes. **Public**
> Story 4 : En tant qu'utilisateur, je peux consulter les campagnes.

**Query params optionnels**
- `?idProjet=cm1q2r3s4t5u6v7w8x9y0z1a2` - Filtrer par projet
- `?statut=ACTIVE` - Filtrer par statut

**Réponse `200 OK`**

```json
[
  {
    "id": "cm3d4e5f6g7h8i9j0k1l2m3n4",
    "titre": "Financement pour mon projet innovant",
    "objectif": 5000,
    "montantCollecte": 3250,
    "dateFin": "2026-06-30T23:59:59.999Z",
    "statut": "ACTIVE",
    "idPorteur": "cm9x8y7z6w5v4u3t2s1r0q",
    "idProjet": "cm1q2r3s4t5u6v7w8x9y0z1a2",
    "projet": {
      "titre": "Ma campagne innovante"
    },
    "tauxCompletion": 65,
    "dateCreation": "2026-03-03T11:00:00.000Z",
    "dateMiseAJour": "2026-03-05T14:30:00.000Z"
  }
]
```

---

### `GET /campagnes/:id`
> Détail complet d'une campagne. **Public**
> Story 4 : En tant qu'utilisateur, je peux consulter les campagnes.

**Réponse `200 OK`**

```json
{
  "id": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "titre": "Financement pour mon projet innovant",
  "description": "Aidez-nous à lancer notre produit...",
  "objectif": 5000,
  "montantCollecte": 3250,
  "dateFin": "2026-06-30T23:59:59.999Z",
  "statut": "ACTIVE",
  "idPorteur": "cm9x8y7z6w5v4u3t2s1r0q",
  "idProjet": "cm1q2r3s4t5u6v7w8x9y0z1a2",
  "projet": {
    "titre": "Ma campagne innovante",
    "description": "Description détaillée...",
    "photo": "https://example.com/photo.jpg"
  },
  "statistiques": {
    "nombreContributeurs": 42,
    "tauxCompletion": 65,
    "tempsRestant": "28 jours"
  },
  "dateCreation": "2026-03-03T11:00:00.000Z",
  "dateMiseAJour": "2026-03-05T14:30:00.000Z"
}
```

**Erreurs possibles**
- `404`, Campagne introuvable 

### `PATCH /campagnes/:id` 🔒
> Modifie une campagne. **Uniquement si statut = `BROUILLON`. Rôle requis : PORTEUR (propriétaire)**
> Story 3 : En tant que porteur de projet, je peux modifier une campagne tant qu'elle n'est pas validée.

**Corps de la requête** — tous les champs sont optionnels

```json
{
  "titre": "Nouveau titre",   // string, 3–100 caractères
  "description": "Nouvelle description...", // string, 10–2000 caractères
  "objectif": 8000,                // number, > 0
  "dateFin": "2026-09-30T23:59:59.999Z"  // string ISO 8601, date future
}
```

> Le champ `statut` ne peut **pas** être modifié via cette route.

**Réponse `200 OK`** — campagne complète mise à jour (même structure que `GET /campagnes/:id`)

**Erreurs possibles**
- `400`, Champ invalide                                           
- `401`, Non authentifié                                          
- `403`, Non propriétaire **ou** campagne hors statut `BROUILLON` 
- `404`, Campagne introuvable                                     

### `POST /campagnes/:id/dupliquer` 🔒
> Duplique une campagne terminée en un nouveau brouillon.  
> **Rôle requis : PORTEUR (propriétaire)**
> Story 8 : En tant que porteur de projet, je peux dupliquer une campagne terminée.

**Conditions :** la campagne doit être en statut `REUSSIE` ou `ECHOUEE`.

**Corps de la requête** — vide `{}`

**Comportement**

| Champ                                          | Comportement                                              |
|------------------------------------------------|-----------------------------------------------------------|
| `titre`, `description`, `objectif`, `projetId` | Copiés depuis la campagne originale                       |
| `montantCollecte`                              | Réinitialisé à `0`                                        |
| `statut`                                       | Réinitialisé à `BROUILLON`                                |
| `dateFin`                                      | Réinitialisé à `null` — **à renseigner avant soumission** |

**Réponse `201 Created`** — nouvelle campagne complète avec `statut: "BROUILLON"`

**Erreurs possibles**
- `401`, Non authentifié                  
- `403`, Non propriétaire                 
- `404`, Campagne introuvable             
- `409`, Statut != `REUSSIE` ou `ECHOUEE` 

## Ressource : Actualités

### `POST /campagnes/:campagneId/actualites` 🔒
> Publie une actualité sur une campagne. **Rôle requis : PORTEUR (propriétaire)**
> Story 6 : En tant que porteur de projet, je peux publier des actualités sur ma campagne.

**Corps de la requête**

```json
{
  "titre": "On a atteint 50% !",        // string, requis, 3–150 caractères
  "contenu": "Bonjour à tous !..."      // string, requis, 10–5000 caractères
}
```

**Réponse `201 Created`**

```json
{
  "id": "cm7a8b9c0d1e2f3g4h5i6j7k8",
  "idCampagne": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "titre": "On a atteint 50% !",
  "contenu": "Bonjour à tous ! Nous avons atteint 50% de notre objectif. Merci pour votre soutien !",
  "datePublication": "2026-03-05T10:00:00.000Z"
}
```

**Erreurs possibles**
- `400`, Champ manquant ou invalide      
- `401`, Non authentifié 
- `403`, Non propriétaire de la campagne 
- `404`, Campagne introuvable 

### `GET /actualites?idCampagne={idCampagne}`
> Liste les actualités d'une campagne. **Public**
> Story 6 : Informer les contributeurs (consultation).

**Query params obligatoire**
- `?idCampagne=cm3d4e5f6g7h8i9j0k1l2m3n4` - Filtrer par campagne

**Réponse `200 OK`**

```json
[
  {
    "id": "cm7a8b9c0d1e2f3g4h5i6j7k8",
    "idCampagne": "cm3d4e5f6g7h8i9j0k1l2m3n4",
    "titre": "On a atteint 50% !",
    "contenu": "Bonjour à tous ! Nous avons atteint 50%...",
    "datePublication": "2026-03-05T10:00:00.000Z"
  }
]
```

## Ressource : Statistiques

### `GET /statistiques/campagnes/:id` 🔒
> Statistiques détaillées d'une campagne. **Rôle requis : PORTEUR (propriétaire) ou ADMIN**
> Story 7 : En tant que porteur de projet, je peux consulter les statistiques de ma campagne.

**Réponse `200 OK`**

```json
{
  "campagneId": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "objectif": 5000,
  "montantCollecte": 3250,
  "tauxCompletion": 65,
  "nombreContributeurs": 42,
  "contributionMoyenne": 77.38,
  "tempsRestant": "28 jours",
  "evolutionJournaliere": [
    { "date": "2026-03-01", "montant": 500 },
    { "date": "2026-03-02", "montant": 1200 },
    { "date": "2026-03-03", "montant": 3250 }
  ],
  "statut": "ACTIVE"
}
```

**Erreurs possibles**
- `401`, Non authentifié 
- `403`, Non propriétaire et non admin 
- `404`, Campagne introuvable 


### POST /system/cloturer-campagnes
> Clôture automatiquement les campagnes dont la date de fin est dépassée.
> Appel interne (cron job)
> Story 5 : En tant que système, je peux clôturer automatiquement une campagne

**Réponse `200 OK`**

```json
{
  "traitees": 5,
  "reussies": 2,
  "echouees": 3,
  "details": [
    {
      "id": "cm3d4e5f6g7h8i9j0k1l2m3n4",
      "statut": "REUSSIE",
      "montantCollecte": 5250
    },
    {
      "id": "cm5f6g7h8i9j0k1l2m3n4o5p6",
      "statut": "ECHOUEE",
      "montantCollecte": 3200
    }
  ]
}
```




