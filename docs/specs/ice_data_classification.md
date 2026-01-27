# Classification des Données du Protocole ICE

Ce document a pour but de distinguer les données qui doivent être considérées comme des constantes immuables du système et celles qui sont dynamiques et doivent être "mockées" (simulées) pour les besoins de développement et de test.

---

## 1. Données à Hardcoder (Constantes)

Ces données forment le cœur du modèle ICE. Elles sont stables et ne devraient changer que lors d'une mise à jour majeure du protocole. Elles doivent être centralisées et exportées comme des constantes pour garantir la cohérence dans toute l'application.

### 1.1. Le Méta-Modèle (Dimensions)
- **Les 9 Dimensions** : La liste des 9 dimensions avec leurs noms complets, leurs codes (CAD, DEN, etc.), et les descriptions de leurs bornes 0 et 100.
    - `CADENCE (CAD)`
    - `DENSITÉ (DEN)`
    - `STRUCTURE (STR)`
    - `POSTURE (POS)`
    - `TEMPÉRATURE (TEM)`
    - `REGISTRE (REG)`
    - `INFLEXION (INF)`
    - `PRISME (PRI)`
    - `ANCRAGE (ANC)`

### 1.2. Les Archétypes
- **Les 15 Archétypes** : La liste complète des 15 archétypes. Pour chaque archétype, les données suivantes sont des constantes :
    - **Nom** (ex: "L'Ingénieur")
    - **Signature Binaire** (ex: "001000")
    - **Vecteur de Base** (ex: `[30, 85, 80, 40, 20, 20, 20, 50, 90]`)
- **Les 4 Familles** : Les noms des 4 familles d'archétypes (LES RATIONNELS, LES ÉMOTIONNELS, etc.).

### 1.3. Logique du Quiz
- **Ordre des 6 Dimensions de Phase 1** : La séquence ordonnée des 6 axes utilisés pour la polarisation est une constante fondamentale.
    - `POS`, `TEM`, `DEN`, `PRI`, `CAD`, `REG`
- **Règles de Sélection de Phase 2** : La logique de sélection des 5 dimensions pour la phase 2 est fixe :
    - **Priorité 1** : `STR`, `INF`, `ANC`.
    - **Priorité 2** : Les 2 dimensions les plus proches de 50, avec la règle de départage sur l'ordre de Phase 1.
- **Formule d'Affinage** : La formule mathématique pour la Phase 2 est une constante, y compris le facteur `k` de `0.3`.
    - `Vnouveau = Vactuel + (Cible - Vactuel) * 0.3`

### 1.4. Prompts Gemini
- **Les `system_instruction`** : Les instructions système pour les 3 appels à Gemini sont des constantes.
- **La structure des prompts** : Le squelette des prompts, incluant les consignes et les descriptions des dimensions, est fixe. Les seules parties variables sont les placeholders (ex: `{{THEME_CHOISI}}`).

---

## 2. Données à Mocker (Dynamiques)

Ces données varient à chaque exécution du quiz. Pour tester l'UI et la logique applicative sans dépendre des appels réels à l'API Gemini, nous devons créer des générateurs de mocks pour ces données.

### 2.1. Entrées Utilisateur
- **`{{THEME_CHOISI}}`** : Le thème fourni par l'utilisateur au début du processus. C'est la principale source de variabilité.
    - *Exemples de mocks : "le futur du travail", "l'intelligence artificielle", "la cuisine végétarienne".*
- **Les 11 réponses de l'utilisateur** : La séquence des choix (A/B) de l'utilisateur tout au long des deux phases.
    - *Exemples de mocks : Un tableau de 11 choix, ex: `['A', 'B', 'A', 'A', 'B', 'B', 'A', 'B', 'A', 'A', 'B']`.*

### 2.2. Données Générées par Gemini
- **Les Questions de Phase 1 et 2** : Le contenu textuel des options A et B pour les 11 questions. Ces données sont générées dynamiquement par Gemini.
    - *Mocks : On doit créer des exemples de JSON de questions/réponses conformes au format attendu, pour chaque phase.*
- **Le Profil Augmenté Final** : Le résultat de la dernière requête Gemini.
    - **`label_final`** (ex: "L'Analyste Vibrant")
    - **`definition_longue`** (La description de 50-60 mots)

### 2.3. Données d'État Intermédiaire
- **Le Vecteur de Style de l'utilisateur** (`V6` et `V11`) : Le vecteur de l'utilisateur qui évolue après chaque réponse de la Phase 2.
    - *Mocks : On peut simuler l'état du vecteur après la Phase 1 (en se basant sur un archétype) et son état final après la Phase 2.*
- **L'Archétype Détecté** : Le nom de l'archétype identifié à la fin de la Phase 1.
- **La liste des 5 dimensions cibles** pour la Phase 2 : Cette liste est déduite de l'archétype détecté et doit être simulée.
