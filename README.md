# 🏗️ BeeConstruct – Frontend

BeeConstruct est une application web destinée au domaine de la construction, permettant la gestion des clients, des offres, des employés et des chantiers au sein d’une plateforme centralisée.
Ce dépôt contient la partie **frontend**, développée avec **Angular**, qui offre une interface utilisateur moderne, ergonomique et responsive pour l’ensemble des acteurs du système.



## 🧩 Pile technologique

- Framework : Angular 
- Langage : TypeScript  
- Templates : HTML  
- Styling : CSS 
- Gestion des dépendances : npm  
- Communication avec l’API : HTTP REST (via `HttpClient`) vers les microservices backend
- Format d’échange : JSON 

L’architecture Angular suit une organisation par **modules**, **composants**, **services**, **directives** et **pipes**, en respectant les bonnes pratiques de séparation des responsabilités.


## ✨ Fonctionnalités principales côté interface

Le frontend BeeConstruct permet notamment :

- Authentification et gestion du profil utilisateur (selon les rôles définis).  
- Gestion des clients : consultation, création, modification et suppression via l’interface web.  
- Gestion des offres : visualisation, création et suivi des offres de services.  
- Gestion des employés : gestion des informations des ressources humaines liées aux chantiers.  
- Gestion des chantiers :
  - consultation des chantiers
  -  création et mise à jour des informations
  -  suivi de l’avancement
  -  gestion des marchandises
  -  gestion de pointage des employés
  -  calcul des salaires
- Navigation unifiée via une **API Gateway** côté backend, consommée par Angular. 
