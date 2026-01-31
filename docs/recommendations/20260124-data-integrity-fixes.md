# Correctifs d'Intégrité des Données et Révélation (Story 2.6)

Ce document détaille les modifications techniques nécessaires pour résoudre les problèmes de persistance de données (Hook/Content manquants) et d'affichage dans le Dashboard/Reveal.

## 1. Problème Identifié

Actuellement, lors de la conversion (pré-persistance), seul le corps du texte (`content`) du post généré est envoyé à l'API. Les éléments structurés (`hook`, `cta`, `style_analysis`) sont perdus.
Cela entraîne :
- Un affichage potentiellement tronqué ou mal formaté dans le Dashboard.
- Une incapacité à reconstruire l'état exact "Post Généré" après le login (Magic Link).
- L'utilisation de textes de repli ("Analyse retrouvée...") au lieu des vraies données.

## 2. Modifications Requises

### A. Backend: `app/api/quiz/pre-persist/route.ts`

**Objectif :** Accepter et sauvegarder les composants structurés du post dans les métadonnées (`equalizer_settings`), tout en gardant une version concaténée pour le champ `content`.

1.  Mettre à jour `PrePersistSchema` pour inclure les champs optionnels : `hook`, `cta`, `style_analysis`.
2.  Mettre à jour la construction de `metaData` pour inclure ces champs dans un sous-objet `generated_components`.

```typescript
// Modification du Schema
const PrePersistSchema = z.object({
  // ... champs existants
  hook: z.string().optional(),
  cta: z.string().optional(),
  style_analysis: z.string().optional()
});

// Modification de la logique POST
// ...
const { 
  // ... existants
  hook, cta, style_analysis 
} = validation.data;

const metaData = {
  vector: stylistic_vector,
  profile: profile,
  archetype: archetype,
  // AJOUT
  generated_components: {
    hook,
    cta,
    style_analysis
  }
};
```

### B. Frontend: `components/feature/final-reveal.tsx`

**Objectif :** Envoyer l'intégralité des données lors de l'appel à `pre-persist`.

1.  Dans le callback `onPreAuth` de `AuthModal`, modifier le corps de la requête fetch.
2.  Concaténer le contenu complet pour le champ `post_content` (pour affichage simple).
3.  Passer les champs individuels pour la sauvegarde structurée.

```typescript
// Dans AuthModal onPreAuth
body: JSON.stringify({
  email,
  stylistic_vector: vector,
  profile: profile,
  archetype: archetype,
  theme: topic,
  // MODIFICATION : Concaténation pour le fallback texte
  post_content: `${generatedPost.hook}\n\n${generatedPost.content}\n\n${generatedPost.cta}`,
  // AJOUTS
  hook: generatedPost.hook,
  cta: generatedPost.cta,
  style_analysis: generatedPost.style_analysis,
  quiz_answers: { ... }
})
```

### C. Frontend: `app/quiz/reveal/page.tsx`

**Objectif :** Restaurer l'état du quiz (Magic Link return) avec les données exactes.

1.  Lors de la reconstruction de `restoredState`, vérifier si `meta.generated_components` existe.
2.  Si oui, utiliser ces valeurs. Sinon, garder la logique de fallback actuelle (pour rétrocompatibilité).

```typescript
// Extraction
const components = meta.generated_components || {};

const restoredState: QuizState = {
    // ...
    generatedPost: {
        hook: components.hook || post.content.split('\n')[0].substring(0, 50) + "...",
        content: components.content || post.content, // Note: post.content est maintenant tout le texte si concaténé
        cta: components.cta || "En savoir plus",
        style_analysis: components.style_analysis || "Analyse retrouvée depuis votre sauvegarde."
    },
    // ...
};
```
*Note : Si `post.content` contient tout le texte concaténé, il faudra peut-être ajuster la logique de fallback si `components` est absent, mais pour les nouveaux posts, cela sera correct.*

### D. Frontend: `app/dashboard/post-reveal-view.tsx`

**Objectif :** Améliorer l'affichage dans le Dashboard pour utiliser la structure si disponible.

1.  Si `post.equalizer_settings` contient `generated_components`, afficher le post avec la mise en forme (Hook en gras, etc.).
2.  Sinon, afficher `post.content` (comportement actuel).

```typescript
// Pseudo-code pour le rendu
const meta = post.equalizer_settings as any;
const components = meta?.generated_components;

if (components) {
  return (
    // ... container
    <div className="font-bold text-xl mb-4">{components.hook}</div>
    <div className="whitespace-pre-wrap font-sans">{components.content}</div> // Attention : components.content ici est le BODY
    <div className="mt-4 italic">{components.cta}</div>
    // ... copy button
  );
}

// Rendu standard actuel
```

## 3. Validation

Après application de ces correctifs :
1.  Générer un nouveau post.
2.  S'inscrire (Magic Link).
3.  Vérifier que la redirection `/quiz` restaure bien l'analyse de style et le hook.
4.  Aller sur le Dashboard et vérifier que le post s'affiche complet (Hook + Content + CTA).
