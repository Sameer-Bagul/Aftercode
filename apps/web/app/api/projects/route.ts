import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const metadataDir = path.join(projectRoot, 'output', 'metadata');
    let projects: any[] = [];

    if (fs.existsSync(metadataDir)) {
      const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith('.json'));
      projects = files.map((f) => JSON.parse(fs.readFileSync(path.join(metadataDir, f), 'utf-8')));
    }

    return NextResponse.json(projects);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
