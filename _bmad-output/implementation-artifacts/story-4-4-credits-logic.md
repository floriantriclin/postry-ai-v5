# Story 4.4 : Compteur de Crédits & Hard Paywall (Logique)

**Parent Epic:** Epic 4 : Intelligence d'Expertise (Ancrage & Monétisation)

## Description

**En tant que** Product Owner,
**Je veux** bloquer la génération si l'utilisateur a consommé ses 5 crédits gratuits,
**Afin de** forcer la conversion vers le payant.

**Type :** Business Logic

## Critères d'Acceptation

1.  Champ `credits_count` décrémenté à chaque génération réussie.
2.   Les "Régénérations" (Equalizer) sur un *même* post coûtent 0 crédit 
3.  API Check : Si `credits_count <= 0`, l'API retourne une erreur 402 ou 403 "Quota Exceeded".
4.  Frontend : Affiche le solde restant (ex: "2/5 posts restants").
5.  Frontend : Si solde 0, bouton "Générer" désactivé et remplacé par "Passer Premium".
