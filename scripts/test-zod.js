const { z } = require('zod');

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
});

console.log('Test 1: undefined');
console.log(envSchema.safeParse({}).success ? '✅ Success' : '❌ Failed');

console.log('Test 2: empty string');
console.log(envSchema.safeParse({ NEXT_PUBLIC_SUPABASE_URL: '' }).success ? '✅ Success' : '❌ Failed');
