import { NextResponse } from 'next/server';
import { fetchRepositoriesFromGitHub } from '@aftercode/engine';
import dotenv from 'dotenv';
import path from 'path';

// Ensure root .env is loaded if token is missing
if (!process.env.GITHUB_TOKEN) {
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

export async function GET() {
  try {
    const owner = process.env.GITHUB_OWNER || 'Sameer-Bagul';
    const token = process.env.GITHUB_TOKEN;
    const repos = await fetchRepositoriesFromGitHub(owner, token);
    return NextResponse.json({ success: true, totalRepositories: repos.length, repos });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
