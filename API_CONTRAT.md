# Contrat API — Microservice Projets & Campagnes

## Ressource : Projets

### `POST /projets` 🔒
> Crée un nouveau projet. **Rôle requis : PORTEUR**

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
  "porteurId": "cm9x8y7z6w5v4u3t2s1r0q",
  "createdAt": "2026-03-03T10:30:00.000Z",
  "updatedAt": "2026-03-03T10:30:00.000Z"
}
```

**Erreurs possibles**
- `400`, Champ manquant ou invalide 
- `401`, Token absent ou expiré     

### `GET /projets`
> Liste tous les projets. **Public — pas d'authentification requise**

**Réponse `200 OK`**

```json
[
  {
    "id": "cm1q2r3s4t5u6v7w8x9y0z1a2",
    "titre": "Ma campagne innovante",
    "description": "Description détaillée...",
    "photo": "https://example.com/photo.jpg",
    "porteurId": "cm9x8y7z6w5v4u3t2s1r0q",
    "createdAt": "2026-03-03T10:30:00.000Z",
    "updatedAt": "2026-03-03T10:30:00.000Z"
  }
]
```

### `GET /projets/:id`
> Détail d'un projet. **Public**

**Réponse `200 OK`**

```json
{
  "id": "cm1q2r3s4t5u6v7w8x9y0z1a2",
  "titre": "Ma campagne innovante",
  "description": "Description détaillée de mon projet...",
  "photo": "https://example.com/photo.jpg",
  "porteurId": "cm9x8y7z6w5v4u3t2s1r0q",
  "createdAt": "2026-03-03T10:30:00.000Z",
  "updatedAt": "2026-03-03T10:30:00.000Z"
}
```

**Erreurs possibles**
- `404`, Projet introuvable — `"Projet avec l'id xxx non trouvé"` |

### `PATCH /projets/:id` 🔒
> Modifie un projet existant. **Rôle requis : PORTEUR (propriétaire uniquement)**

**Corps de la requête** — tous les champs sont optionnels

```json
{
  "titre": "Nouveau titre",
  "description": "Nouvelle description...",
  "photo": "https://example.com/nouvelle-photo.jpg"
}
```

**Réponse `200 OK`** — projet mis à jour (même structure que `GET /projets/:id`)

**Erreurs possibles**
- `400`, Champ invalide             
- `401`, Non authentifié            
- `403`, Non propriétaire du projet 
- `404`, Projet introuvable         

### `DELETE /projets/:id` 🔒
> Supprime un projet. **Rôle requis : PORTEUR (propriétaire uniquement)**

**Réponse `204 No Content`**

**Erreurs possibles**
- `401`, Non authentifié                                                
- `403`, Non propriétaire                                               
- `404`, Projet introuvable                                             
- `409`, Le projet possède une campagne active — suppression impossible 

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

**Corps de la requête**

```json
{
  "titre": "Financement pour mon projet innovant",  // string, requis, 3–100 caractères
  "description": "Aidez-nous à lancer notre produit...", // string, requis, 10–2000 caractères
  "objectif": 5000,                                 // number, requis, > 0
  "dateFin": "2026-06-30T23:59:59.999Z",            // string, requis, date future ISO 8601
  "projetId": "cm1q2r3s4t5u6v7w8x9y0z1a2"          // string, requis, ID projet du porteur
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
  "porteurId": "cm9x8y7z6w5v4u3t2s1r0q",
  "projetId": "cm1q2r3s4t5u6v7w8x9y0z1a2",
  "createdAt": "2026-03-03T11:00:00.000Z",
  "updatedAt": "2026-03-03T11:00:00.000Z"
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
    "porteurId": "cm9x8y7z6w5v4u3t2s1r0q",
    "projetId": "cm1q2r3s4t5u6v7w8x9y0z1a2",
    "projet": {
      "titre": "Ma campagne innovante"
    },
    "tauxCompletion": 65,
    "createdAt": "2026-03-03T11:00:00.000Z",
    "updatedAt": "2026-03-05T14:30:00.000Z"
  }
]
```

---

### `GET /campagnes/:id`
> Détail complet d'une campagne. **Public**

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
  "porteurId": "cm9x8y7z6w5v4u3t2s1r0q",
  "projetId": "cm1q2r3s4t5u6v7w8x9y0z1a2",
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
  "createdAt": "2026-03-03T11:00:00.000Z",
  "updatedAt": "2026-03-05T14:30:00.000Z"
}
```

**Erreurs possibles**
- `404`, Campagne introuvable 

### `PATCH /campagnes/:id` 🔒
> Modifie une campagne. **Uniquement si statut = `BROUILLON`. Rôle requis : PORTEUR (propriétaire)**

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

### `POST /campagnes/:id/soumettre` 🔒
> Soumet la campagne à la validation admin. **Statut : `BROUILLON` → `EN_ATTENTE`**  
> **Rôle requis : PORTEUR (propriétaire)**

**Corps de la requête** — vide `{}`

**Réponse `200 OK`**

```json
{
  "id": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "statut": "EN_ATTENTE",
  "updatedAt": "2026-03-04T09:00:00.000Z"
}
```

**Erreurs possibles**
- `401`, Non authentifié       
- `403`, Non propriétaire      
- `404`, Campagne introuvable   
- `409`, Statut != `BROUILLON` 

### `POST /campagnes/:id/dupliquer` 🔒
> Duplique une campagne terminée en un nouveau brouillon.  
> **Rôle requis : PORTEUR (propriétaire)**

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
  "campagneId": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "titre": "On a atteint 50% !",
  "contenu": "Bonjour à tous ! Nous avons atteint 50% de notre objectif. Merci pour votre soutien !",
  "publishedAt": "2026-03-05T10:00:00.000Z"
}
```

**Erreurs possibles**
- `400`, Champ manquant ou invalide      
- `401`, Non authentifié 
- `403`, Non propriétaire de la campagne 
- `404`, Campagne introuvable 

### `GET /campagnes/:campagneId/actualites`
> Liste les actualités d'une campagne. **Public**

**Réponse `200 OK`**

```json
{
  "id": "cm7a8b9c0d1e2f3g4h5i6j7k8",
  "campagneId": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "titre": "On a atteint 50% !",
  "contenu": "Bonjour à tous ! Nous avons atteint 50%...",
  "publishedAt": "2026-03-05T10:00:00.000Z"
}
```

## Ressource : Statistiques

### `GET /campagnes/:id/stats` 🔒
> Statistiques détaillées d'une campagne. **Rôle requis : PORTEUR (propriétaire) ou ADMIN**

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

## Ressource : Administration

> Toutes les routes `/admin/*` nécessitent le rôle `ADMIN`. 🔒

### `POST /admin/campagnes/:id/valider`
> Valide une campagne. **Statut : `EN_ATTENTE` → `ACTIVE`**

**Corps de la requête** — vide `{}`

**Réponse `200 OK`**

```json
{
  "id": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "statut": "ACTIVE",
  "updatedAt": "2026-03-06T08:00:00.000Z"
}
```

**Erreurs possibles**
- `401`, Non authentifié 
- `403`, Rôle non admin 
- `404`, Campagne introuvable 
- `409`, Statut != `EN_ATTENTE` 

### `POST /admin/campagnes/:id/refuser`
> Refuse une campagne. **Statut : `EN_ATTENTE` → `REFUSEE`**

**Corps de la requête** — vide `{}`

**Réponse `200 OK`**
```json
{
  "id": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "statut": "REFUSEE",
  "updatedAt": "2026-03-06T08:30:00.000Z"
}
```

**Erreurs possibles**
- `401`, Non authentifié 
- `403`, Rôle non admin 
- `404`, Campagne introuvable 
- `409`, Statut != `EN_ATTENTE` 

## Événements RabbitMQ émis

> Ce microservice **publie** des événements sur RabbitMQ. Le microservice contributions/paiements (Projet 2) et le Dashboard (Projet 4) doivent **écouter** ces événements.

| Exchange    | Routing Key          | Déclencheur                    |
|-------------|----------------------|--------------------------------|
| `campaigns` | `campaign.activated` | Admin valide une campagne      |
| `campaigns` | `campaign.closed`    | Clôture automatique (cron job) |
| `campaigns` | `campaign.refused`   | Admin refuse une campagne      |

### Payload `campaign.activated`

```json
{
  "campaignId": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "projectId": "cm1q2r3s4t5u6v7w8x9y0z1a2",
  "porteurId": "cm9x8y7z6w5v4u3t2s1r0q",
  "objectif": 5000,
  "dateFin": "2026-06-30T23:59:59.999Z"
}
```

### Payload `campaign.closed`

```json
{
  "campaignId": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "statut": "REUSSIE",
  "montantCollecte": 5250
}
```

> Le Projet 2 utilise ce payload pour déclencher le **versement des fonds** (`REUSSIE`) ou les **remboursements** (`ECHOUEE`).

### Payload `campaign.refused`

```json
{
  "campaignId": "cm3d4e5f6g7h8i9j0k1l2m3n4",
  "porteurId": "cm9x8y7z6w5v4u3t2s1r0q"
}
```



