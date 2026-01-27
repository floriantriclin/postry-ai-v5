#!/usr/bin/env node

/**
 * Script de génération du PRD complet
 * 
 * Usage:
 *   node generate-complete-prd.js
 * 
 * Output:
 *   PRD-Complete-v4.0.md (document consolidé)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PRD_VERSION = '4.0';
const OUTPUT_FILE = `PRD-Complete-v${PRD_VERSION}.md`;
const SECTIONS_ORDER = [
  '01-objectifs-et-contexte.md',
  '02-exigences.md',
  '03-objectifs-de-design-de-linterface-utilisateur.md',
  '04-hypotheses-techniques.md',
  '05-liste-des-epics.md',
  '06-details-de-lepic-1-fondation-et-tunnel-public.md',
  '07-details-de-lepic-2-conversion-et-identite.md',
  '08-details-de-lepic-3-dashboard-et-personnalisation.md',
  '09-details-de-lepic-4-intelligence-dexpertise.md',
  '10-definition-of-done.md',
  '11-testing-strategy.md',
  '12-error-handling-strategy.md',
  '13-analytics-and-kpis.md',
  '14-security-and-compliance.md',
  '15-deployment-and-rollout.md'
];

// Header du document complet
const HEADER = `---
title: Product Requirements Document - postry.ai
version: ${PRD_VERSION}
date: ${new Date().toISOString().split('T')[0]}
status: Complete
confidentiality: Internal / Strict
---

# Product Requirements Document (PRD)
## postry.ai - Plateforme IA-Miroir pour LinkedIn

**Version** : ${PRD_VERSION}  
**Date** : ${new Date().toLocaleDateString('fr-FR')}  
**Confidentialité** : Interne / Strict  
**Objet** : Document des Exigences Produit Complet

---

## Table des Matières

1. [Objectifs et Contexte](#01-objectifs-et-contexte)
2. [Exigences](#02-exigences)
3. [Objectifs de Design de l'Interface Utilisateur](#03-objectifs-de-design-de-linterface-utilisateur)
4. [Hypothèses Techniques](#04-hypotheses-techniques)
5. [Liste des Epics](#05-liste-des-epics)
6. [Détails de l'Epic 1 : Fondation & Tunnel Public](#06-détails-de-lepic-1--fondation--tunnel-public)
7. [Détails de l'Epic 2 : Conversion & Identité](#07-détails-de-lepic-2--conversion--identité)
8. [Détails de l'Epic 3 : Dashboard & Personnalisation](#08-détails-de-lepic-3--dashboard--personnalisation)
9. [Détails de l'Epic 4 : Intelligence d'Expertise](#09-détails-de-lepic-4--intelligence-dexpertise)
10. [Definition of Done](#10-definition-of-done)
11. [Testing Strategy](#11-testing-strategy)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Analytics & KPIs](#13-analytics--kpis)
14. [Security & Compliance](#14-security--compliance)
15. [Deployment & Rollout](#15-deployment--rollout)

---

`;

// Footer du document
const FOOTER = `

---

## Fin du Document

**Document généré automatiquement le** : ${new Date().toLocaleString('fr-FR')}  
**Version** : ${PRD_VERSION}  
**Script** : \`generate-complete-prd.js\`

Pour mettre à jour ce document, éditez les fichiers sources dans \`prd/\` puis relancez :

\`\`\`bash
node generate-complete-prd.js
\`\`\`

---

© 2026 postry.ai - Tous droits réservés
`;

// Fonction principale
function generateCompletePRD() {
  console.log('🚀 Génération du PRD complet...\n');

  let completeContent = HEADER;
  let totalSections = 0;

  SECTIONS_ORDER.forEach((filename, index) => {
    const filepath = path.join(__dirname, filename);

    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️  Section ${filename} introuvable, ignorée.`);
      return;
    }

    console.log(`📄 Ajout de la section ${index + 1}: ${filename}`);

    let content = fs.readFileSync(filepath, 'utf-8');

    // Nettoyer le contenu (retirer le premier # si présent)
    content = content.replace(/^# .*\n\n?/, '');

    // Ajouter séparateur entre sections
    completeContent += `\n\n---\n\n# ${filename.replace('.md', '').replace(/-/g, ' ').toUpperCase()}\n\n`;
    completeContent += content;

    totalSections++;
  });

  completeContent += FOOTER;

  // Écrire le fichier
  const outputPath = path.join(__dirname, OUTPUT_FILE);
  fs.writeFileSync(outputPath, completeContent, 'utf-8');

  console.log(`\n✅ Document complet généré avec succès!`);
  console.log(`📊 ${totalSections} sections consolidées`);
  console.log(`📁 Fichier: ${outputPath}`);
  console.log(`📏 Taille: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);
}

// Exécution
try {
  generateCompletePRD();
} catch (error) {
  console.error('❌ Erreur lors de la génération:', error.message);
  process.exit(1);
}
