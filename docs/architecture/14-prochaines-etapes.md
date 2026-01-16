# 14. Prochaines Étapes

## Plan d'Action Immédiat

L'architecture est définie. Voici les étapes séquentielles pour lancer le développement :

1. **Initialisation du Repo :**
    - Créer le projet Next.js (npx create-next-app).
    - Installer les dépendances (@supabase/ssr, lucide-react, zod, pdf-parse, google-generative-ai).
    - Configurer Tailwind et le linter.
2. **Mise en place Infrastructure :**
    - Créer le projet Supabase.
    - Exécuter le script SQL (Section 8) pour créer les tables.
    - Connecter le repo à Vercel et configurer les variables d'environnement.
3. **Développement Epic 1 (Acquisition) :**
    - Coder les composants UI "Brut" (components/ui).
    - Implémenter l'API Quiz (api/quiz/route.ts) connectée à Gemini.
    - Créer la page Landing et le flux Quiz -> Blurred Preview.
4. **Développement Epic 2 (Conversion) :**
    - Implémenter le flux Auth Magic Link.
    - Gérer la persistance "Anonyme -> Authentifié".
5. **Développement Epic 3 & 4 (Core Product) :**
    - Dashboard, Upload CV, et Intégration Stripe.

## Handoff aux Agents

Ce document sert de référence (Source of Truth).

- **Pour l'Architecte Frontend :** Utilisez la Section 9 (Structure) et 12 (Standards) pour générer les prompts de composants.
- **Pour le Développeur Backend :** Utilisez la Section 8 (SQL) et 6 (APIs) pour coder la logique serveur.
- **Pour le QA :** Utilisez la Section 13 (Tests) pour valider les livrables.

## Conclusion

L'architecture proposée pour **postry.ai** est **pragmatique, sécurisée et évolutive**. Elle évite la complexité inutile (pas de Docker, pas de Microservices, pas de Vector DB complexe) pour se concentrer sur la valeur utilisateur : une expérience fluide de découverte de soi via l'IA. La séparation nette entre le client (UI riche) et le serveur (Logique IA/Data) via Next.js garantit une maintenabilité à long terme.
