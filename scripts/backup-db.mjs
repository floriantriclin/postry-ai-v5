#!/usr/bin/env node

/**
 * Database Backup Script
 * Story 2.11b (BMA-48) - Manual backup for Supabase Free plan
 * 
 * Usage: npm run db:backup
 * 
 * Prerequisites:
 * 1. Supabase CLI installed: npm install -g supabase
 * 2. Logged in: supabase login
 * 3. Project linked: supabase link --project-ref hoomcbsfqunrkeapxbvh
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Create backups directory if it doesn't exist
const backupsDir = join(projectRoot, 'supabase', 'backups');
if (!existsSync(backupsDir)) {
  mkdirSync(backupsDir, { recursive: true });
  console.log(`✅ Created backups directory: ${backupsDir}`);
}

// Generate timestamp
const now = new Date();
const timestamp = now.toISOString()
  .replace(/[-:]/g, '')
  .replace('T', '_')
  .split('.')[0]; // Format: YYYYMMDD_HHMMSS

const backupFile = join(backupsDir, `backup_${timestamp}.sql`);

console.log('🔄 Starting database backup...');
console.log(`📁 Output: ${backupFile}`);

try {
  // Check if Supabase CLI is installed
  try {
    execSync('supabase --version', { stdio: 'ignore' });
  } catch (error) {
    throw new Error('❌ Supabase CLI not installed. Run: npm install -g supabase');
  }

  // Execute backup using Supabase CLI with linked project (remote mode)
  console.log('⏳ Running backup (this may take 30s-2min)...');
  console.log('📌 Using linked project: hoomcbsfqunrkeapxbvh');
  console.log('🌐 Remote mode (no Docker required)');
  
  const command = `supabase db dump --remote -f "${backupFile}"`;
  execSync(command, { 
    cwd: projectRoot,
    shell: 'powershell.exe',
    stdio: 'inherit' 
  });

  console.log('✅ Backup completed successfully!');
  console.log(`📦 File: ${backupFile}`);
  
  // Get file size
  const stats = statSync(backupFile);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  console.log(`📊 Size: ${fileSizeKB} KB`);

  // Cleanup old backups (keep last 7)
  console.log('\n🧹 Cleaning up old backups (keeping last 7)...');
  const files = readdirSync(backupsDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.sql'))
    .map(f => ({
      name: f,
      path: join(backupsDir, f),
      time: statSync(join(backupsDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > 7) {
    const toDelete = files.slice(7);
    toDelete.forEach(file => {
      unlinkSync(file.path);
      console.log(`  🗑️  Deleted: ${file.name}`);
    });
    console.log(`✅ Cleanup complete (removed ${toDelete.length} old backups)`);
  } else {
    console.log(`✅ No cleanup needed (${files.length} backups total)`);
  }

  console.log('\n🎯 Next steps:');
  console.log('  1. Verify backup file exists and is > 10 KB');
  console.log('  2. Optionally commit to Git: git add supabase/backups/');
  console.log('  3. Proceed with migration');
  console.log('\n💡 To restore: See RUNBOOK-EMERGENCY-RESTORE.md');

} catch (error) {
  console.error('\n❌ Backup failed!');
  console.error(error.message);
  console.error('\n📚 Troubleshooting:');
  console.error('  1. Install Supabase CLI: npm install -g supabase');
  console.error('  2. Login: supabase login');
  console.error('  3. Link project: supabase link --project-ref hoomcbsfqunrkeapxbvh');
  console.error('  4. Check network connection');
  console.error('\n💡 Alternative: Export manually from Supabase Dashboard');
  console.error('   Dashboard → SQL Editor → Run: pg_dump commands');
  process.exit(1);
}
