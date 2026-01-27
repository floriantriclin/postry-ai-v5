# 02. Exigences

### Exigences Fonctionnelles (FR)

- **FR1 (Moteur de Quiz)** : Le système doit présenter un parcours de découverte composé de questions de "Mapping" et d'"Affinement", générées dynamiquement par un LLM pour cerner l'archétype de l'utilisateur.
- **FR2 (Génération et Aperçu Flouté)** : À partir du thème saisi par l'utilisateur et de ses réponses, le système génère un post. Pour les visiteurs non connectés, ce résultat s'affiche immédiatement dans un état "Flouté" (structure visible mais texte illisible) afin de susciter l'intérêt.
- **FR3 (Gate de Conversion)** : Le système doit exiger la saisie d'un email valide (vérifié via OTP ou Magic Link) pour "déflouter" le contenu, révéler le texte final et créer le compte utilisateur.
- **FR4 (Equalizer de Style)** : Le Dashboard met à disposition des curseurs de réglage (ex : Ton, Longueur, Densité). Une fois les ajustements souhaités effectués, le système permet de régénérer le post pour refléter ces nouvelles nuances.
- **FR5 (Ancre CV / RAG)** : Le système doit permettre aux utilisateurs connectés d'uploader un CV (PDF/TXT). Le moteur analyse ce document pour extraire les expériences clés et injecter les faits pertinents dans la génération (RAG léger).
- **FR6 (Système de Crédits)** : Le système gère un compteur visible appliquant une limite stricte de 5 générations gratuites, bloquant toute création supplémentaire au-delà (Hard Paywall).
- **FR7 (Paiement)** : Une intégration Stripe Checkout permet la souscription à l'offre Premium pour débloquer l'usage illimité.

### Exigences Non-Fonctionnelles (NFR)

- **NFR1 (Performance)** : Le chargement des étapes du quiz doit s'effectuer en moins de 10 secondes. La génération complète d'un post doit s'exécuter en moins de 15 secondes pour garantir une expérience fluide.
- **NFR2 (Sécurité des Données)** : Les CV, accessibles uniquement aux utilisateurs identifiés, sont des données sensibles et doivent être chiffrés au repos.
- **NFR3 (Gestion de Session)** : Les données de session des visiteurs anonymes (réponses au quiz, thème) doivent être purgées automatiquement après 24h d'inactivité.
- **NFR4 (Expérience Mobile)** : L'ensemble du parcours utilisateur (du Quiz au Dashboard) doit être conçu en priorité pour mobile ("Mobile First").
- **NFR5 (Architecture Stateless)** : L'orchestration LLM privilégie une approche "Stateless" pour supporter la charge sans nécessiter de fine-tuning par utilisateur.

### Exigences de Compatibilité (CR)

- **CR1** : Le format de sortie du texte doit respecter strictement les contraintes de mise en forme LinkedIn (sauts de ligne, listes, caractères spéciaux).
