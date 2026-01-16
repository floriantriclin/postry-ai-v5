import { env } from '../lib/env';

console.log('--- Environment Verification ---');
console.log('NEXT_PUBLIC_BASE_URL:', env.NEXT_PUBLIC_BASE_URL);
console.log('Is valid?', Object.keys(env).length > 0 ? '✅ Yes' : '❌ No (Empty object returned)');

if (env.NEXT_PUBLIC_BASE_URL === 'http://localhost:3000') {
  console.log('✅ Default value for BASE_URL applied.');
} else {
  console.log('❌ Default value NOT applied.');
}
