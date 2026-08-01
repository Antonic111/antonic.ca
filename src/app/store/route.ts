import { NextResponse } from 'next/server';

export async function GET() {
  const storeUrl = process.env.FOURTHWALL_STORE_URL || 'https://antonic.fourthwall.com';
  // Use temporary redirect (302) during development
  return NextResponse.redirect(storeUrl, { status: 302 });
}
