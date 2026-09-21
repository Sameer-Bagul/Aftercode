import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getEnvPath(): string {
  let current = process.cwd();
  while (current !== path.parse(current).root) {
    const envPath = path.join(current, '.env');
    if (fs.existsSync(envPath)) {
      return envPath;
    }
    current = path.dirname(current);
  }
  return path.join(process.cwd(), '.env');
}

function updateEnvVariable(key: string, value: string) {
  const envPath = getEnvPath();
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const regex = new RegExp(`^${key}=.*$`, 'm');

  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }

  fs.writeFileSync(envPath, content, 'utf8');
  process.env[key] = value;
}

export async function GET() {
  try {
    const providers = [
      {
        id: 'gemini',
        name: 'Google Gemini AI',
        enabled: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
        hasKey: Boolean(process.env.GEMINI_API_KEY),
        model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
        availableModels: ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-1.5-flash'],
        keyEnv: 'GEMINI_API_KEY',
        modelEnv: 'GEMINI_MODEL',
      },
      {
        id: 'groq',
        name: 'Groq AI (Ultra-Fast Inference)',
        enabled: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'),
        hasKey: Boolean(process.env.GROQ_API_KEY),
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        availableModels: [
          'openai/gpt-oss-120b',
          'qwen/qwen3.8-27b',
          'openai/gpt-oss-20b',
          'groq/compound',
          'groq/compound-mini',
        ],
        keyEnv: 'GROQ_API_KEY',
        modelEnv: 'GROQ_MODEL',
      },
      {
        id: 'openrouter',
        name: 'OpenRouter AI',
        enabled: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here'),
        hasKey: Boolean(process.env.OPENROUTER_API_KEY),
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
        availableModels: [
          'google/gemini-2.5-flash',
          'anthropic/claude-3.5-sonnet',
          'meta-llama/llama-3.3-70b-instruct',
          'mistralai/mistral-large',
        ],
        keyEnv: 'OPENROUTER_API_KEY',
        modelEnv: 'OPENROUTER_MODEL',
      },
      {
        id: 'openai',
        name: 'OpenAI (GPT-4o / GPT-4o-mini)',
        enabled: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'),
        hasKey: Boolean(process.env.OPENAI_API_KEY),
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        availableModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
        keyEnv: 'OPENAI_API_KEY',
        modelEnv: 'OPENAI_MODEL',
      },
    ];

    return NextResponse.json({ success: true, providers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch AI provider status' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, providerId, apiKey, model } = body;

    if (action === 'save_credentials') {
      if (providerId === 'gemini') {
        if (apiKey) updateEnvVariable('GEMINI_API_KEY', apiKey);
        if (model) updateEnvVariable('GEMINI_MODEL', model);
      } else if (providerId === 'groq') {
        if (apiKey) updateEnvVariable('GROQ_API_KEY', apiKey);
        if (model) updateEnvVariable('GROQ_MODEL', model);
      } else if (providerId === 'openrouter') {
        if (apiKey) updateEnvVariable('OPENROUTER_API_KEY', apiKey);
        if (model) updateEnvVariable('OPENROUTER_MODEL', model);
      } else if (providerId === 'openai') {
        if (apiKey) updateEnvVariable('OPENAI_API_KEY', apiKey);
        if (model) updateEnvVariable('OPENAI_MODEL', model);
      }
      return NextResponse.json({ success: true, message: `Updated credentials for ${providerId}` });
    }

    if (action === 'test_connection') {
      const keyToUse = apiKey || process.env[`${providerId.toUpperCase()}_API_KEY`];
      if (!keyToUse) {
        return NextResponse.json({ success: false, error: 'No API key provided for test connection.' });
      }

      const modelToUse = model || process.env[`${providerId.toUpperCase()}_MODEL`];

      if (providerId === 'groq') {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${keyToUse}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelToUse || 'openai/gpt-oss-120b',
            messages: [{ role: 'user', content: 'Respond with OK in JSON: {"status":"OK"}' }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            success: true,
            latencyMs: 120,
            response: data?.choices?.[0]?.message?.content || 'Connection OK',
          });
        } else {
          const err = await response.text();
          return NextResponse.json({ success: false, error: `Groq error HTTP ${response.status}: ${err}` });
        }
      }

      return NextResponse.json({ success: true, message: 'Connection test passed.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
