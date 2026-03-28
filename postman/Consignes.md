## Contenu du dossier

Ce dossier contient :

- `WeFund-Tests-Microservice Projets & Campagnes Copy 2.postman_collection.json` : la collection Postman regroupant l’ensemble des tests de ce microservice projets-campagnes(MS1).
- `Captures` : les captures d’écran montrant la génération du token dans JWT.io, le lancement de MS1 avec Docker, ainsi que la bonne exécution des tests dans Postman.

## Base URL

La `baseUrl` utilisée pour les tests est :  
`http://localhost:3000/api`

## Important

Les identifiants utilisés dans les requêtes doivent être renseignés de manière cohérente afin que les tests fonctionnent correctement.

Par exemple :

- l’`id` du projet doit correspondre à un projet appartenant à l’utilisateur associé au token JWT utilisé ;
- l’`id` de la campagne doit correspondre à une campagne liée à ce projet ;

