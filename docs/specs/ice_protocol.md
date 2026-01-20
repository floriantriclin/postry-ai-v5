**Nom** : **ICE Protocol Specification (Identity Calibration Engine)**

Nom de fichier : ice_protocol.md

**Version :** 3.0

**Confidentialité :** Interne / Strict

**Objet :** Spécification du moteur de profilage stylistique et de l'algorithme de génération dynamique.

| **Version** | **Date** | **Auteur** | **Modifications / Notes** |
| --- | --- | --- | --- |
| **1.0** | 13/01/2026 | T. Tech | Création du méta-modèle à 9 dimensions et définition des 15 Archétypes. |
| **2.0** | 13/01/2026 | T. Tech | Ajout de la logique "Dynamic Theming" et du calcul de distance de Hamming pondérée. |
| **2.1** | 13/01/2026 | M. Analyst | Validation de la génération dynamique des questions (Blueprint Phase 1) via le Prompt Engineering. |
| 2.2 | 13/01/2026 | FTR | Changement de variable dans le prompt final {{MICRO_PROMPT}}—> {{RME_CONTEXT_PAYLOAD}} |
| 2.3 | 15/01/2026 | FTR | Mise à jour du super prompt |
| 3.0 | 17/01/2026 | FTR | Refonte pour adaptation à la v5 de postry.ai |
| 3.1 | 19/01/2026 | PO | Clarification de la logique de calcul (Phase 2) et ajout d'un exemple détaillé. |
| 3.2 | 20/01/2026 | PO | Mise à jour des schémas JSON et synchronisation avec la Story 1.5. |

---

# Section 1 : Le Méta-Modèle (Le Vecteur `$Vstyle$`)

Le modèle décompose l'écriture en **9 dimensions orthogonales**. Chaque dimension est un curseur allant de **0 à 100**. Le point **50** représente la neutralité absolue (style "Wikipédia" ou "IA par défaut").

## 1.1 Groupe A : LE SON (La Forme / The Shape)

*Ce groupe définit la structure physique du texte : sa respiration, sa complexité et son architecture.*

### 1. **CADENCE (CAD)** : Rythme et Respiration

- **0 (Haché / Staccato)** : Phrases ultra-courtes (sujet-verbe-point). Suppression des connecteurs. Effet de percussion et d'urgence.
    - *Ex : "C’est fait. On avance. Pas d’excuse."*
- **100 (Fluide / Legato)** : Phrases longues, subordonnées, usage riche de la ponctuation (virgules, point-virgules). Recherche de musicalité.
    - *Ex : "Bien que le projet ait connu des heurts, nous avons finalement réussi, par un effort collectif soutenu, à franchir la ligne d'arrivée."*

### 2. **DENSITÉ (DEN)** : Complexité Lexicale

- **0 (Vulgarisé / Simple)** : Vocabulaire de base (niveau collège). Analogies quotidiennes. Zéro jargon technique.
    - *Ex : "C'est comme changer une roue de voiture."*
- **100 (Expert / Technique)** : Terminologie précise, acronymes métier, concepts avancés supposant un lecteur initié.
    - *Ex : "L'implémentation d'une architecture micro-services nécessite une orchestration Kubernetes optimisée."*

### 3. **STRUCTURE (STR)** : Organisation de la Pensée

- **0 (Organique / Flux)** : Style conversationnel. Digressions assumées. Pas de plan apparent (stream of consciousness).
    - *Ex : "Je pensais à ça l'autre jour, et puis en marchant, je me suis dit que peut-être..."*
- **100 (Logique / Carré)** : Plan visible. Listes à puces. Connecteurs logiques (D'abord, Ensuite, Enfin). Raisonnement déductif.
    - *Ex : "Voici les 3 leviers de croissance : 1. Le SEO, 2. La Pub, 3. Le CRM."*

---

## 1.2 Groupe B : L'ÂME (Le Ton / The Tone)

*Ce groupe définit la posture sociale et émotionnelle de l'auteur vis-à-vis de son audience.*

### 4. **POSTURE (POS)** : Hiérarchie Sociale

- **0 (Humble / Pair)** : L'auteur se met au même niveau. Partage d'erreurs, utilisation du "Je", vulnérabilité.
    - *Ex : "J'ai longtemps lutté avec ce problème avant de comprendre..."*
- **100 (Guru / Vertical)** : L'auteur parle depuis une position d'autorité. Injonctions ("Faites ceci"), vérité générale, utilisation du "Vous".
    - *Ex : "Voici la seule méthode qui fonctionne. Arrêtez de perdre votre temps."*

### 5. **TEMPÉRATURE (TEM)** : Charge Émotionnelle

- **0 (Froid / Clinique)** : Distanciation. Analyse factuelle. Absence d'adjectifs émotionnels. Ton journalistique ou scientifique.
    - *Ex : "Les résultats indiquent une hausse de 12% des conversions."*
- **100 (Chaud / Viscéral)** : Passion, enthousiasme ou colère. Utilisation d'interjections et d'une ponctuation expressive (!, ?!).
    - *Ex : "C'est une victoire monumentale ! On a enfin brisé le plafond de verre !"*

### 6. **REGISTRE (REG)** : Couleur et Esprit

- **0 (Sérieux / Solennel)** : Sobriété totale. Premier degré. Respect strict des codes professionnels traditionnels.
    - *Ex : "L'intégrité de nos processus garantit la qualité de nos services."*
- **100 (Ludique / Décalé)** : Humour, ironie, sarcasme, références pop-culture, usage d'emojis. Ton "cool" ou provocateur.
    - *Ex : "Spoiler alert : notre serveur a rendu l'âme. Oups 💀."*

---

## 1.3 Groupe C : LE FOND (La Substance / The Substance)

*Ce groupe définit l'angle d'attaque du sujet et la nature de l'information transmise.*

### 7. **INFLEXION (INF)** : Mode Narratif

- **0 (Factuel / Reportage)** : Focus sur les données, les dates, les chiffres. Description brute de la réalité.
    - *Ex : "300 personnes étaient présentes au salon de l'immobilier à Paris."*
- **100 (Narratif / Storytelling)** : Mise en scène. Dramaturgie. Transformation d'une info en histoire avec héros et obstacles.
    - *Ex : "Il était 8h, le café était froid, et mon écran affichait une erreur fatale. C'est là que l'aventure a commencé."*

### 8. **PRISME (PRI)** : Vision du Monde

- **0 (Optimiste / Constructif)** : Focus sur l'opportunité, la solution, le progrès. "Le verre à moitié plein".
    - *Ex : "Chaque crise est une occasion de se réinventer."*
- **100 (Critique / Sceptique)** : Focus sur le risque, le piège, la dénonciation. "Le verre à moitié vide".
    - *Ex : "Attention au mirage de l'IA, beaucoup vont y laisser des plumes."*

### 9. **ANCRAGE (ANC)** : Niveau d'Abstraction

- **0 (Abstrait / Conceptuel)** : Théorie, vision, philosophie, systèmes globaux. Pourquoi on fait les choses.
    - *Ex : "La transformation digitale est un changement de paradigme culturel."*
- **100 (Concret / Pragmatique)** : Pratique, outils, actions immédiates, terrain. Comment on fait les choses.
    - *Ex : "Installez cette extension Chrome et cliquez sur le bouton bleu."*

## 1.4 La Justification de l'Orthogonalité

Pour que le système fonctionne avec Gemini, chaque curseur doit être indépendant.

- *Validation :* On peut être **Guru (POS:100)** tout en étant **Humble (POS:20)** ? Non, c'est l'axe.
- *Validation :* On peut être **Expert (DEN:100)** tout en étant **Ludique (REG:100)** ? Oui, c'est l'expert qui fait des blagues de geek.
- *Validation :* On peut être **Narratif (INF:100)** tout en étant **Froid (TEM:0)** ? Oui, c'est le style clinique des polars ou des rapports médicaux romancés.

**C'est cette indépendance qui permet de créer des millions de combinaisons stylistiques uniques.**

# Section 2 : La Matrice des 15 Archétypes

Les 15 archétypes sont répartis en **4 Familles**. Chaque archétype est défini par un vecteur $Vbase$

unique.

## 2.1 Tableaux Maîtres par Familles

**Légende de la Signature Binaire (6 bits) :**

POS (Posture) | TEM (Température) | DEN (Densité) | PRI (Prisme) | CAD (Cadence) | REG (Registre)

### FAMILLE A : LES RATIONNELS (Système + Logique)

*Focus : Processus, données et analyse. L'émotion est un bruit parasite.*

| **Archétype** | **Sig. Binaire** | **Signature** | **Définition (40 mots env.)** | **Vecteur de Base 

`[CAD,DEN,STR,POS,TEM,REG,INF,PRI,ANC]`** |
| --- | --- | --- | --- | --- |
| **1. L'Ingénieur** | 001000 | Pragmatique & Sec | Expert focalisé sur la résolution technique. Il utilise un jargon précis et une structure logique. Son écriture est dépourvue d'artifices, visant l'efficacité brute et la transmission de savoir-faire opérationnel sans fioritures marketing ni autorité surjouée. | [30, 85, 80, 40, 20, 20, 20, 50, 90] |
| **2. L'Architecte** | 101010 | Visionnaire Systémique | Penseur de haut niveau analysant les structures globales. Son ton est docte, utilisant un vocabulaire conceptuel pour dessiner les plans de l'avenir. Il privilégie la hauteur de vue, l'abstraction stratégique et une autorité froide et posée. | [50, 75, 90, 70, 25, 20, 30, 50, 30] |
| **3. Le Stratège** | 101100 | Décideur Tranchant | Leader analytique évaluant les risques avec froideur. Son style est percutant, structuré pour la décision. Il utilise des faits denses pour asseoir une autorité naturelle et orienter l'action vers un objectif critique avec un scepticisme protecteur. | [25, 65, 85, 85, 30, 15, 20, 60, 60] |
| **4. L'Analyste** | 001011 | Observateur Curieux | Chercheur de vérité qui décortique les mécanismes complexes. Son ton est neutre et fluide, mais il s'autorise une pointe d'esprit (ludique) pour rendre les données digestes. Il lie les causes et effets avec une clarté pédagogique et objective. | [70, 60, 75, 30, 30, 60, 40, 50, 70] |

### FAMILLE B : LES ÉMOTIONNELS (Humain + Relation)

*Focus : Empathie, vulnérabilité et connexion directe.*

| **Archétype** | **Sig. Binaire** | **Signature** | **Définition (40 mots env.)** | **Vecteur de Base** |
| --- | --- | --- | --- | --- |
| **5. Le Confident** | 010010 | Doux & Inclusif | Accompagnateur bienveillant créant un espace de sécurité. Son langage est simple, empathique et centré sur le ressenti. Il privilégie la proximité et le soutien, utilisant le "je" pour partager une humanité commune et rassurante, sans autorité verticale. | [65, 30, 30, 20, 75, 30, 60, 40, 50] |
| **6. Le Mentor** | 110010 | Sage & Bienveillant | Figure d'autorité protectrice transmettant les leçons de l'expérience. Son style est fluide, parsemé de conseils avisés et de chaleur. Il guide son audience avec une assurance paternelle, transformant le savoir en sagesse de vie accessible et inspirante. | [55, 45, 60, 70, 65, 25, 75, 30, 40] |
| **7. L'Écorché** | 010100 | Brut & Authentique | Écrivain sans filtre exposant ses échecs avec une honnêteté radicale. Son style est haché, viscéral, fuyant les structures lisses. Il cherche une connexion profonde par le partage brut des épreuves, adoptant une posture de pair vulnérable et critique. | [20, 25, 20, 25, 90, 15, 85, 60, 75] |
| **8. Le Tribun** | 110000 | Charismatique & Vocal | Leader passionné haranguant les foules pour défendre une vision. Son ton est épique et affirmatif. Il inspire l'action collective par un discours vibrant, orienté vers la mission et le combat, avec une énergie débordante et une autorité assumée. | [45, 40, 50, 85, 85, 40, 70, 30, 30] |

### FAMILLE C : LES CRÉATIFS (Forme + Imaginaire)

*Focus : Style, narration et décalage.*

| **Archétype** | **Sig. Binaire** | **Signature** | **Définition (40 mots env.)** | **Vecteur de Base** |
| --- | --- | --- | --- | --- |
| **9. L'Explorateur** | 000011 | Curieux & Narratif | Esprit libre voyageant à travers les idées de façon organique. Son style est fluide, ludique et humble. Il raconte ses découvertes avec enthousiasme, sans jargon d'expert, invitant le lecteur à explorer de nouveaux horizons avec une simplicité rafraîchissante. | [80, 25, 30, 30, 60, 80, 85, 40, 50] |
| **10. Le Visionnaire** | 111011 | Futuriste & Tech | Pionnier vendant le monde de demain avec une excitation contagieuse. Son style mélange expertise technique et lyrisme. Il utilise des images fortes pour dépeindre des ruptures technologiques avec autorité, orientant le regard vers des opportunités optimistes et grandioses. | [70, 55, 55, 75, 75, 45, 60, 20, 25] |
| **12. Le Satirique** | 101111 | Ironique & Brillant | Observateur cynique utilisant l'humour noir pour souligner les absurdités. Son style est expert, piquant et provocateur. Il manie l'ironie avec précision pour dire des vérités dérangeantes, adoptant une posture d'autorité intellectuelle qui déconstruit les conventions avec esprit. | [65, 65, 60, 60, 45, 90, 40, 85, 60] |

### FAMILLE D : LES IMPACTANTS (Efficacité + Action)

*Focus : Vitesse, polarisation et résultats.*

| **Archétype** | **Sig. Binaire** | **Signature** | **Définition (40 mots env.)** | **Vecteur de Base** |
| --- | --- | --- | --- | --- |
| **13. Le Sniper** | 100100 | Minimaliste & Clivant | Provocateur utilisant des phrases courtes comme des impacts. Il va droit au but, élimine le superflu et polarise pour susciter une réaction. Son style est sec, froid, affirmatif et redoutablement efficace pour percer le bruit ambiant. | [15, 30, 40, 85, 50, 30, 20, 75, 85] |
| **14. Le Manifeste** | 111000 | Solennel & Puissant | Auteur de déclarations d'intention denses et sérieuses. Son style est expert, structuré et très autoritaire. Il ne cherche pas à plaire mais à poser des piliers idéologiques et des vérités universelles avec une gravité professionnelle et optimiste. | [40, 75, 90, 90, 30, 10, 30, 20, 40] |
| **15. Le Motivateur** | 110001 | Énergique & Coach | Leader survolté misant sur l'énergie pure et le passage à l'action. Son langage est simple, parsemé d'exclamations et de décalages ludiques. Il cherche à briser l'inertie par un enthousiasme débordant et des mantras courts axés sur la réussite. | [35, 20, 30, 70, 85, 60, 40, 20, 40] |
| **16. Le Contrarian** | 101101 | Rebelle & Brillant | Intellectuel prenant systématiquement le contre-pied de la pensée dominante. Son style est dense, hautain et haché. Il utilise des paradoxes pour prouver sa supériorité analytique, défiant la majorité avec un scepticisme piquant et une autorité provocatrice. | [45, 85, 70, 85, 40, 55, 30, 90, 65] |

---

## 2.5 Le Pont Binaire : Logique de la Phase 1 (Questions 1 à 6)

L'objectif de la Phase 1 n'est pas la nuance, mais la **polarisation**. Pour identifier l'un des 15 archétypes, le système doit générer un **Code Binaire à 6 bits** (ex: 101100).

Bien que le modèle comporte 9 dimensions, la Phase 1 se concentre sur les **6 axes les plus discriminants** (ceux qui créent les ruptures de style les plus nettes).

### Séquence Ordonnée des Tests (Le "Criblage")

Les questions doivent être posées dans cet ordre précis pour construire progressivement l'identité :

1. **Q1 - L'Axe de POSTURE (Bit 1) :**
    - *Test :* L'utilisateur se voit-il comme un apprenant/partageur (0) ou comme un sachant/guide (1) ?
    - *Impact :* Définit la verticalité du texte.
2. **Q2 - L'Axe de TEMPÉRATURE (Bit 2) :**
    - *Test :* L'utilisateur privilégie-t-il l'analyse clinique (0) ou l'engagement émotionnel (1) ?
    - *Impact :* Définit la "chaleur" et la proximité.
3. **Q3 - L'Axe de DENSITÉ (Bit 3) :**
    - *Test :* L'utilisateur veut-il être compris par tous (0) ou reconnu par ses pairs/experts (1) ?
    - *Impact :* Définit le niveau de complexité lexicale.
4. **Q4 - L'Axe de PRISME (Bit 4) :**
    - *Test :* L'utilisateur est-il naturellement porté vers l'opportunité (0) ou vers la vigilance/critique (1) ?
    - *Impact :* Définit la polarité de la vision du monde.
5. **Q5 - L'Axe de CADENCE (Bit 5) :**
    - *Test :* L'utilisateur préfère-t-il l'impact de la brièveté (0) ou le souffle de la narration (1) ?
    - *Impact :* Définit le rythme respiratoire du texte.
6. **Q6 - L'Axe de REGISTRE (Bit 6) :**
    - *Test :* L'utilisateur souhaite-t-il rester dans la solennité pro (0) ou utiliser l'humour/le décalage (1) ?
    - *Impact :* Définit la "couleur" finale du profil.

### Requête 1 : Génération de la Phase 1 (Polarisation)

**Payload Backend → Gemini 2.5 Flash :**

```json
{
  "system_instruction": "Tu es le moteur de calibration de postry.ai. Ta mission est de générer 6 questions binaires A/B pour identifier l'identité scripturale d'un utilisateur. Tu dois impérativement respecter les dimensions stylistiques du protocole ICE.",
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "ACTION : Génère 6 questions A/B de polarisation pour le thème : {{THEME_CHOISI}}.\n\n### RÉFÉRENTIEL DES DIMENSIONS (PHASE 1)\n\nQ1 : POSTURE (Hiérarchie)\n- Borne 0 (Humble/Pair) : Partage d'expérience, doute, 'Je', vulnérabilité. Ex: 'J'ai fait cette erreur au début.'\n- Borne 100 (Guru/Vertical) : Affirmation, vérité générale, 'Vous', autorité. Ex: 'Voici la seule méthode qui fonctionne.'\n\nQ2 : TEMPÉRATURE (Émotion)\n- Borne 0 (Froid/Clinique) : Constat objectif, neutre, sans adjectif émotionnel. Ex: 'Le résultat est de 12%.'\n- Borne 100 (Chaud/Viscéral) : Passion, exclamation, ressenti fort, tripes. Ex: 'C'est une victoire incroyable !'\n\nQ3 : DENSITÉ (Complexité)\n- Borne 0 (Simple/Vulgarisé) : Mots courants, analogies accessibles, zéro jargon. Ex: 'C'est comme un moteur de vélo.'\n- Borne 100 (Expert/Technique) : Jargon précis, acronymes, niveau professionnel. Ex: 'L'architecture micro-services permet la scalabilité.'\n\nQ4 : PRISME (Vision)\n- Borne 0 (Optimiste/Opportunité) : Focus sur le positif, l'avenir, la solution. Ex: 'L'IA est une chance pour nous.'\n- Borne 100 (Critique/Sceptique) : Focus sur le risque, le danger, la mise en garde. Ex: 'L'IA est une menace pour l'emploi.'\n\nQ5 : CADENCE (Rythme)\n- Borne 0 (Haché/Percutant) : Phrases très courtes. Sujet-Verbe-Point. Impact. Ex: 'C'est fait. On avance.'\n- Borne 100 (Fluide/Lié) : Phrases longues, virgules, connecteurs, musicalité. Ex: 'Une fois la tâche finie, nous progressons sereinement.'\n\nQ6 : REGISTRE (Couleur)\n- Borne 0 (Sérieux/Pro) : Gravité, sobriété, premier degré, respect des codes. Ex: 'Il faut respecter les délais.'\n- Borne 100 (Ludique/Décalé) : Humour, second degré, emojis, décalage. Ex: 'Houston, on a un (petit) problème 🚀.'\n\n### CONSIGNES DE GÉNÉRATION\n1. Reste strictement dans le thème : {{THEME_CHOISI}}.\n2. Chaque paire A/B doit traiter du MÊME sujet thématique (ex: Q1 sur l'apprentissage, Q2 sur un résultat, etc.).\n3. Les options doivent être claires, contrastées mais crédibles (pas de caricature grossière).\n4. Longueur maximale par option : 15 mots.\n\nFORMAT DE RÉPONSE ATTENDU :\nUn tableau JSON d'objets : [{\"id\": \"Q1\", \"dimension\": \"POSTURE\", \"option_A\": \"...\", \"option_B\": \"...\"}, ...]"
        }
      ]
    }
  ],
  "generation_config": {
    "response_mime_type": "application/json"
  }
}
```

### Résultat : La Signature Binaire

À chaque réponse, le système incrémente la chaîne binaire.

- *Exemple :* Un utilisateur qui répond (Guru, Froid, Expert, Critique, Haché, Sérieux) génère le code **101100**.

### Le "Mapping" vers l'Archétype

Le code obtenu est comparé aux **Codes Idéaux** des 15 archétypes (voir tableau de la section 2.1).

- Si le code est identique à un archétype → **Match Parfait**.
- Si le code est inédit → **Calcul de Distance de Hamming** (le système choisit l'archétype qui a le moins de bits de différence).

**Exemple de Match :**

Le code 101100 correspond à l'archétype du stratège.

- *Action immédiate :* Le système initialise le vecteur de l'utilisateur avec les valeurs par défaut du Stratège: [CAD:25, DEN:65, STR:85, POS:85, TEM:30, REG:15, INF:20, PRI:60, ANC:60].

# Section 3 : Mécanismes d'Interaction & Batch Generation

Le protocole ICE utilise une transition "invisible" entre la classification binaire et l'affinage stylistique.

## 3.1 Fin de Phase 1 : Analyse et Sélection des Cibles

Dès que la 6ème réponse de la Phase 1 est enregistrée :

1. **Initialisation du Vecteur $V6$** : Le système charge les valeurs de l'Archétype détecté.
2. **Sélection des 5 Dimensions Cibles** : Le système choisit les 5 axes à tester en Phase 2 selon une hiérarchie stricte :
    - **Priorité 1 (Les 3 Incontournables)** : Dimensions non testées en Phase 1 : **STRUCTURE (STR), INFLEXION (INF), ANCRAGE (ANC)**.
    - **Priorité 2 (Les 2 Floues)** : Les deux dimensions parmi les 6 autres dont le score actuel est le plus proche de 50 (Indice d'ambiguïté maximal).
    - ***Règle de départage (Tie-Breaking)*** *: En cas d'égalité (par exemple, plusieurs dimensions avec un score de 40), le système sélectionnera les deux premières dimensions rencontrées dans l'ordre de test de la Phase 1 : `POS`, `TEM`, `DEN`, `PRI`, `CAD`, `REG`.*
    3. **Appel Batch Gemini** : Le Backend demande à Gemini de générer le bloc des 5 questions de nuance.
    
    ### 3.1.1 Schéma de Requête (POST /api/quiz/generate)
    
    Pour la Phase 2, le backend attend un `context` structuré :
    
    ```json
    {
      "phase": 2,
      "topic": "Intelligence Artificielle",
      "context": {
        "archetypeName": "Le Stratège",
        "archetypeVector": {
          "CAD": 25, "DEN": 65, "STR": 85, "POS": 85, "TEM": 30, "REG": 15, "INF": 20, "PRI": 60, "ANC": 60
        },
        "targetDimensions": ["STR", "INF", "ANC", "POS", "TEM"]
      }
    }
    ```
    
    ---
    
    ## 3.2 L'Algorithme d'Affinage (Phase 2)

Chaque réponse à ces 5 questions fait varier le vecteur $V$par attraction.

### La Formule :

$$
Vnouveau=Vactuel+(Cible−Vactuel)×0.3
$$

- **Cible** : 0 (Option A) ou 100 (Option B).
- **Force (k)** : 0.3 (Permet une dérive de 30% vers l'extrémité choisie).

### Exemple Concret d'Application de la Formule

Pour clarifier le mécanisme, voici un cas pratique :

1.  **Contexte** : Le système teste la dimension **STRUCTURE (STR)** en Phase 2. L'archétype de base est le **Stratège**, dont le vecteur initial contient `STR: 85`.
2.  **Question** : L'utilisateur doit choisir entre :
    *   Option A (style Organique/Flux, Cible = 0)
    *   Option B (style Logique/Carré, Cible = 100)
3.  **Cas 1 : L'utilisateur choisit l'Option A.**
    *   `Vactuel` pour STR = 85.
    *   `Cible` = 0.
    *   Calcul : `Vnouveau = 85 + (0 - 85) * 0.3`
    *   `Vnouveau = 85 - 25.5`
    *   `Vnouveau = 59.5` (arrondi à 60).
    *   La nouvelle valeur pour STR dans le vecteur est **60**.
4.  **Cas 2 : L'utilisateur choisit l'Option B.**
    *   `Vactuel` pour STR = 85.
    *   `Cible` = 100.
    *   Calcul : `Vnouveau = 85 + (100 - 85) * 0.3`
    *   `Vnouveau = 85 + 4.5`
    *   `Vnouveau = 89.5` (arrondi à 90).
    *   La nouvelle valeur pour STR dans le vecteur est **90**.

**Conclusion pour l'implémentation** : Le backend doit simplement associer la réponse 'A' à une `Cible` de 0 et la réponse 'B' à une `Cible` de 100, puis appliquer la formule pour chaque question de la Phase 2 afin de calculer le vecteur final `V11`.

---

## 3.3 Exploitation de Gemini : La "Batch Request" (Phase 2)

L'API Gemini 2.5 Flash génère le set de questions durant le "Reveal Intermédiaire" (l'écran qui présente l'archétype à l'utilisateur).

### Payload de la Requête (Backend → Gemini)

```json
{
  "system_instruction": "Tu es le moteur de nuance de postry.ai. Ta mission est de générer 5 questions binaires d'affinage pour un utilisateur dont le profil de base est : {{NOM_ARCHETYPE}}.",
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "ACTION : Génère 5 questions A/B d'affinage pour le thème : {{THEME_CHOISI}}.\n\n### RÉFÉRENTIEL COMPLET DES 9 DIMENSIONS (ICE PROTOCOL)\n\n1. CADENCE (CAD) : 0 (Haché, impactant) vs 100 (Fluide, musical). Ex: 'C'est fait. On avance.' vs 'Une fois terminé, nous progressons.'\n2. DENSITÉ (DEN) : 0 (Simple, vulgarisé) vs 100 (Expert, jargon). Ex: 'On change la roue.' vs 'On remplace l'unité pneumatique.'\n3. STRUCTURE (STR) : 0 (Organique, flux libre) vs 100 (Logique, carré). Ex: 'Je pensais à ça...' vs 'Voici les 3 points :'\n4. POSTURE (POS) : 0 (Humble, partage) vs 100 (Guru, autorité). Ex: 'J'apprends encore.' vs 'Faites comme ceci.'\n5. TEMPÉRATURE (TEM) : 0 (Froid, clinique) vs 100 (Chaud, viscéral). Ex: 'Le CA monte de 5%.' vs 'Quelle fierté de voir ce résultat !'\n6. REGISTRE (REG) : 0 (Sérieux, solennel) vs 100 (Ludique, décalé). Ex: 'C'est crucial.' vs 'Houston, petit souci 🚀.'\n7. INFLEXION (INF) : 0 (Factuel, chiffres) vs 100 (Narratif, histoire). Ex: '50 inscrits hier.' vs 'Quand j'ai ouvert la liste, j'ai vu...'\n8. PRISME (PRI) : 0 (Optimiste, opportunité) vs 100 (Critique, sceptique). Ex: 'L'IA est une chance.' vs 'Attention aux dérives de l'IA.'\n9. ANCRAGE (ANC) : 0 (Abstrait, vision) vs 100 (Concret, pragmatique). Ex: 'Le futur est digital.' vs 'Installez cet outil.'\n\n### CONTEXTE UTILISATEUR\n- Archétype détecté : {{NOM_ARCHETYPE}}\n- Vecteur actuel (V6) : {{VECTEUR_JSON}}\n- Dimensions à tester impérativement : {{LISTE_DES_5_DIMENSIONS_CIBLES}}\n\n### CONSIGNES DE GÉNÉRATION\n1. Pour chaque dimension listée, génère une paire A/B. \n2. L'option A doit correspondre à la borne 0, l'option B à la borne 100.\n3. **Nuance cruciale** : Ne sois pas caricatural. Les phrases doivent refléter le style de l'archétype {{NOM_ARCHETYPE}}. \n4. Chaque paire doit traiter d'un sujet différent lié au thème {{THEME_CHOISI}} pour éviter la répétition.\n5. Longueur maximale par option : 15 mots.\n\nFORMAT DE RÉPONSE ATTENDU :\nUn tableau JSON d'objets : [{\"id\": \"Q7\", \"dimension\": \"...\", \"option_A\": \"...\", \"option_B\": \"...\"}, ...]"
        }
      ]
    }
  ],
  "generation_config": {
    "response_mime_type": "application/json"
  }
}
```

### Format de Réponse (JSON Array)

Gemini renvoie les 5 questions que le Backend stocke pour une diffusion immédiate.

```json
[
  { "id": "Q7", "dimension": "STR", "option_A": "...", "option_B": "..." },
  { "id": "Q8", "dimension": "INF", "option_A": "...", "option_B": "..." },
  { "id": "Q9", "dimension": "ANC", "option_A": "...", "option_B": "..." },
  { "id": "Q10", "dimension": "DIM_FLOU_1", "option_A": "...", "option_B": "..." },
  { "id": "Q11", "dimension": "DIM_FLOU_2", "option_A": "...", "option_B": "..." }
]
```

---

## 3.4 Workflow de l'Interaction (UX)

1. **Phase 1 (6 clics)** : Polarisation rapide. Pas de réflexion intense.
2. **Le Pivot (Temps Masqué)** :
    - Affichage : "Profil détecté : **Le Stratège**".
    - En arrière-plan : Gemini génère les 5 questions de la Phase 2.
3. **Phase 2 (5 clics)** : Nuances et affinage. L'utilisateur sent que les questions deviennent plus subtiles.
4. **Verrouillage du Vecteur $V11$** : À la 11ème réponse, le profil est complet. Le système possède désormais assez de données pour paramétrer le moteur de rédaction de posts.

# Section 4 : Le Reveal du Profil Augmenté

C’est l'étape de transformation où le vecteur mathématique $V11$ devient une identité de marque personnelle. Le système génère un profil "non-standard" qui combine l'archétype de base avec une nuance qualificative unique.

## 4.1 La Requête de Synthèse (Backend → Gemini 2.5 Flash)

Cette requête est envoyée dès la validation de la 11ème question. Elle inclut tout le savoir du protocole pour garantir la cohérence entre les chiffres et le texte.

**Payload de la requête :**

```json
{
  "system_instruction": "Tu es un expert en psychométrie et en personal branding. Ton rôle est de traduire un vecteur de données stylistiques en une identité rédactionnelle prestigieuse et inspirante.",
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "ACTION : Génère le Profil Augmenté de l'utilisateur.\n\n### RÉFÉRENTIEL DES 9 DIMENSIONS (POUR ANALYSE)\n1. CADENCE (CAD) : 0 (Haché, percutant) vs 100 (Fluide, musical).\n2. DENSITÉ (DEN) : 0 (Simple, vulgarisé) vs 100 (Expert, jargon).\n3. STRUCTURE (STR) : 0 (Organique, flux libre) vs 100 (Logique, carré).\n4. POSTURE (POS) : 0 (Humble, partage) vs 100 (Guru, autorité).\n5. TEMPÉRATURE (TEM) : 0 (Froid, clinique) vs 100 (Chaud, viscéral).\n6. REGISTRE (REG) : 0 (Sérieux, solennel) vs 100 (Ludique, décalé).\n7. INFLEXION (INF) : 0 (Factuel, chiffres) vs 100 (Narratif, histoire).\n8. PRISME (PRI) : 0 (Optimiste, opportunité) vs 100 (Critique, sceptique).\n9. ANCRAGE (ANC) : 0 (Abstrait, vision) vs 100 (Concret, pragmatique).\n\n### DONNÉES UTILISATEUR\n- Archétype de base détecté : {{NOM_ARCHETYPE}}\n- Vecteur Final V11 : {{VECTEUR_V11_JSON}}\n\n### MISSIONS DE GÉNÉRATION\n1. **Le Label Final** : Crée un titre composé : [{{NOM_ARCHETYPE}}] + [Adjectif Qualificatif Flatteur]. L'adjectif doit refléter la dérive la plus marquée du vecteur par rapport à l'archétype standard (ex: 'Le Stratège Lumineux', 'L'Ingénieur Intuitif', 'Le Mentor Radical').\n2. **La Définition** : Rédige une définition de **50 à 60 mots exactement**. Elle doit expliquer la force unique de ce mélange stylistique. Valorise la manière dont l'utilisateur équilibre sa technicité et son humanité pour impacter son audience.\n\n### DIRECTIVES DE NUANCE\n- Si une dimension est à l'extrême (<15 ou >85), elle doit devenir le cœur de la définition.\n- Le ton doit être prestigieux, profond et révélateur. Évite les platitudes.\n\n### FORMAT DE SORTIE ATTENDU\n{\n  \"label_final\": \"...\",\n  \"definition_longue\": \"...\"\n}"
        }
      ]
    }
  ],
  "generation_config": {
    "response_mime_type": "application/json"
  }
}
```

## 4.2 Exemple de Rendu du Profil Augmenté

Si l'utilisateur a un profil de base "Analyste" mais a fini avec une température très haute (Chaud) et une inflexion narrative (Storytelling) :

- **Label Final** : **L'Analyste Vibrant**
- **Définition (56 mots)** :
    
    "Votre identité transcende la simple rigueur de l'expert pour devenir une force d'inspiration narrative. Tout en conservant une précision chirurgicale dans vos données, vous habillez chaque analyse d'une humanité vibrante qui captive votre audience. Cette capacité rare à transformer des chiffres froids en récits habités fait de vous un leader d'opinion dont la parole est aussi crédible que mémorable."
    

## 4.3 Exploitation du Profil

Le **Label Final** et la **Définition** sont les éléments centraux de la page de résultat. Ils sont présentés à l'utilisateur comme une "révélation" de son style qu'il ignorait peut-être, créant un fort engagement émotionnel avec le produit.