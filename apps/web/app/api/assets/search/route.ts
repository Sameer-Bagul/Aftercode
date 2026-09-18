import { NextResponse } from 'next/server';
import { ImageProviders } from '@aftercode/engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'react';
    const source = searchParams.get('source') || 'all';

    let results = [];
    if (source === 'iconify') {
      results = await ImageProviders.searchIconify(query);
    } else if (source === 'wikimedia') {
      results = await ImageProviders.searchWikimedia(query);
    } else if (source === 'openverse') {
      results = await ImageProviders.searchOpenverse(query);
    } else {
      results = await ImageProviders.searchAll(query);
    }

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to search assets' },
      { status: 500 }
    );
  }
}
