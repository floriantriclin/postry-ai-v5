# Recommandation : Stabilisation des Tests E2E du Dashboard

**Date :** 26 Janvier 2026
**Sujet :** Correction des régressions visuelles et des instabilités de déconnexion dans `dashboard.spec.ts`.

## Contexte
Les tests E2E ont révélé des échecs systématiques dans le fichier `e2e/dashboard.spec.ts` sur les navigateurs Firefox et WebKit, ainsi que des divergences visuelles sur tous les navigateurs.

## Objectif
Stabiliser la suite de tests `dashboard.spec.ts` pour garantir que l'expérience utilisateur du tableau de bord est cohérente et fonctionnelle sur tous les navigateurs supportés.

## Plan d'Action pour le Développeur

### ⚠️ Instruction Importante
Pour gagner du temps et réduire le bruit, **n'exécutez que les tests du fichier concerné** pendant la phase de correction.

**Commande de travail :**
```bash
npx playwright test e2e/dashboard.spec.ts
```
Une fois (et seulement une fois) que ces tests passent au vert sur les 3 navigateurs, lancez la suite complète pour vérification finale :
```bash
npm run test:e2e
```

---

### 1. Correction des Régressions Visuelles
**Problème :** Le test `should match the visual snapshot` échoue avec une différence de pixels de ~8%. Cela est dû à des changements récents de l'UI qui n'ont pas été enregistrés dans les snapshots de référence.

**Action Requise :**
1.  Vérifiez visuellement que le tableau de bord s'affiche correctement (en lançant l'app localement ou via le mode `--ui` de Playwright).
2.  Si l'affichage est conforme aux attentes, mettez à jour les snapshots de référence :
    ```bash
    npx playwright test e2e/dashboard.spec.ts --update-snapshots
    ```
3.  Vérifiez les diffs générés pour vous assurer que seuls les changements attendus sont capturés.

### 2. Correction de la Déconnexion (Firefox/WebKit)
**Problème :** Le test `should logout the user` échoue sur Firefox et WebKit. L'URL reste sur `/dashboard` au lieu de rediriger vers `/`. Cela indique une "race condition" où la navigation ou l'action de clic n'est pas correctement attendue ou traitée.

**Action Requise :**
Modifiez le test pour renforcer la robustesse de l'action de déconnexion.

**Suggestion de Code (dans `e2e/dashboard.spec.ts`) :**
```typescript
test("should logout the user", async ({ page }) => {
  // Attendre que le bouton soit stable avant de cliquer
  const logoutBtn = page.getByTestId("logout-button");
  await expect(logoutBtn).toBeVisible();
  
  // Optionnel : Ajouter un petit délai si l'hydratation est lente sur FF
  // await page.waitForTimeout(500); 

  await logoutBtn.click();
  
  // Augmenter légèrement le timeout pour la redirection si nécessaire, 
  // ou utiliser waitForURL pour une attente explicite
  await page.waitForURL("**/"); // Attend n'importe quelle URL finissant par /
  await expect(page).toHaveURL("/");
});
```

---

## Note sur les Tests Ignorés (Skipped)
Vous remarquerez que 2 tests sont marqués comme "skipped" dans le rapport final.
- **Test concerné :** `should copy the post content to clipboard`
- **Raison :** Ce test contient une condition `if (browserName !== "chromium") test.skip();`.
- **Justification :** La gestion des permissions du presse-papier (`clipboard-write`, `clipboard-read`) via l'API d'automatisation est historiquement instable ou non supportée de la même manière sur Firefox et WebKit en mode headless. Il est donc délibérément restreint à Chromium pour éviter des "flaky tests" (faux positifs).
