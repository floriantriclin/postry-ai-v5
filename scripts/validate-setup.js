const fs = require('fs');
const path = require('path');

function checkFileExists(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath} exists`);
    return true;
  } else {
    console.error(`❌ ${filePath} is missing`);
    return false;
  }
}

function validatePackageJson() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const checks = [
    { name: 'next', version: 'canary' },
    { name: 'typescript', version: '^5.0.0' },
    { name: 'tailwindcss', version: 'next' },
    { name: 'lucide-react', version: 'latest' },
    { name: 'zod', version: 'latest' }
  ];

  let allOk = true;
  checks.forEach(check => {
    if (deps[check.name]) {
      const currentVersion = deps[check.name];
      const expectedVersion = check.version;
      
      let match = false;
      if (expectedVersion === 'canary') {
        match = currentVersion.includes('canary') || currentVersion.startsWith('16');
      } else if (expectedVersion === 'next') {
        match = currentVersion === 'next' || currentVersion.includes('alpha') || currentVersion.startsWith('4') || currentVersion.startsWith('^4');
      } else if (expectedVersion === 'latest') {
        match = currentVersion === 'latest' || /^\^?\d+/.test(currentVersion);
      } else {
        match = currentVersion === expectedVersion;
      }

      if (match) {
        console.log(`✅ Dependency ${check.name} version matches (${currentVersion})`);
      } else {
        console.warn(`⚠️ Dependency ${check.name} version mismatch: expected ${expectedVersion}, found ${currentVersion}`);
        allOk = false;
      }
    } else {
      console.error(`❌ Dependency ${check.name} missing`);
      allOk = false;
    }
  });
  return allOk;
}

function validateTsConfig() {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.strict === true) {
    console.log(`✅ tsconfig.json has strict: true`);
    return true;
  } else {
    console.error(`❌ tsconfig.json missing strict: true`);
    return false;
  }
}

async function validateEnv() {
  const content = fs.readFileSync('lib/env.ts', 'utf8');
  const hasOptional = content.includes('.optional()');
  const hasDefault = content.includes('.default(');
  
  if (hasOptional && hasDefault) {
    console.log(`✅ lib/env.ts validated (contains optional/default markers)`);
    return true;
  } else {
    console.error(`❌ lib/env.ts might crash with empty env vars`);
    return false;
  }
}

async function main() {
  console.log('--- Starting Setup Validation ---');
  const filesOk = [
    checkFileExists('README.md'),
    checkFileExists('.gitignore'),
    checkFileExists('app/page.tsx'),
    checkFileExists('app/layout.tsx'),
    checkFileExists('lib/env.ts')
  ].every(Boolean);

  const pkgOk = validatePackageJson();
  const tsOk = validateTsConfig();
  const envOk = await validateEnv();

  if (filesOk && pkgOk && tsOk && envOk) {
    console.log('\n✨ All integration checks passed!');
  } else {
    console.error('\n💥 Some checks failed.');
    process.exit(1);
  }
}

main();
