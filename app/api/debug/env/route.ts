import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_ENABLE_PERSIST_FIRST: process.env.NEXT_PUBLIC_ENABLE_PERSIST_FIRST,
    NODE_ENV: process.env.NODE_ENV,
  });
}
