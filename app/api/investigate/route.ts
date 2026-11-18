import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import type { DirectDiagnosisRequest, DirectSolutionResponse } from '@/lib/types';

const SYSTEM_INSTRUCTION = `Você é o "Detetive de Problemas IA", um especialista rápido, direto e prático em resolver problemas cotidianos.

REGRAS DE RESPOSTA DIRETA E RÁPIDA:
1. Vá DIRETO AO PONTO sem perguntas prévias e sem introduções longas.
2. Seja conciso para entregar a resposta rapidamente:
   - "quickSummary": 1 frase curta (máx. 18 palavras) resumindo a causa e o ajuste principal.
   - "rootCause": 2 a 3 frases objetivas explicando O QUE ESTÁ OCASIONANDO O PROBLEMA.
   - "actionPlan": exatamente 3 a 4 mudanças práticas ordenadas da mais fácil ("Fácil") à mais avançada ("Avançado"), com títulos curtos ("step") e instruções diretas de 1 a 2 frases ("detail").
   - "preventionTip": 1 a 2 frases práticas de como evitar que volte.
3. Se houver "refinementNote", ajuste a causa e as mudanças considerando esse detalhe extra.
4. Responda sempre em Português do Brasil (pt-BR), de forma clara e acionável.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    caseTitle: {
      type: Type.STRING,
      description: 'Título curto e direto do diagnóstico (máx. 60 caracteres).',
    },
    quickSummary: {
      type: Type.STRING,
      description: 'Resumo curto em 1 frase.',
    },
    rootCause: {
      type: Type.STRING,
      description: 'Explicação concisa (2-3 frases) do que está ocasionando o problema.',
    },
    actionPlan: {
      type: Type.ARRAY,
      description: '3 a 4 mudanças práticas ordenadas do mais fácil ao mais avançado.',
      items: {
        type: Type.OBJECT,
        properties: {
          step: {
            type: Type.STRING,
            description: 'Título curto do que mudar agora (máx. 10 palavras).',
          },
          difficulty: {
            type: Type.STRING,
            description: 'Exatamente: Fácil, Moderado ou Avançado.',
          },
          detail: {
            type: Type.STRING,
            description: 'Instrução objetiva de 1 a 2 frases.',
          },
        },
      },
    },
    preventionTip: {
      type: Type.STRING,
      description: 'Dica breve de prevenção (1-2 frases).',
    },
  },
  required: ['caseTitle', 'quickSummary', 'rootCause', 'actionPlan', 'preventionTip'],
};

let cachedClient: { apiKey: string; ai: GoogleGenAI } | null = null;

function getGeminiClient(apiKey: string): GoogleGenAI {
  if (cachedClient && cachedClient.apiKey === apiKey) {
    return cachedClient.ai;
  }
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  cachedClient = { apiKey, ai };
  return ai;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json(
        {
          error: 'MISSING_API_KEY',
          message:
            'Nenhuma chave GEMINI_API_KEY foi configurada no servidor. Configure em Settings > Secrets ou utilize o Modo Demonstração para testar imediatamente.',
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as DirectDiagnosisRequest;
    const problem = body.problem?.trim();
    const refinementNote = body.refinementNote?.trim();

    if (!problem) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Descreva o problema para receber a solução.' },
        { status: 400 }
      );
    }

    const prompt = refinementNote
      ? `Problema: "${problem}"\nDetalhe extra: "${refinementNote}"\nDiga direto o que está causando e o que mudar.`
      : `Problema: "${problem}"\nDiga direto o que está causando e o que mudar.`;

    const ai = getGeminiClient(apiKey);

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      return NextResponse.json(
        {
          error: 'EMPTY_RESPONSE',
          message: 'A IA não retornou uma solução válida. Tente novamente.',
        },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText) as DirectSolutionResponse;

    parsed.actionPlan = (parsed.actionPlan ?? []).slice(0, 6).map((item, idx) => {
      const diff =
        item.difficulty === 'Fácil' ||
        item.difficulty === 'Moderado' ||
        item.difficulty === 'Avançado'
          ? item.difficulty
          : idx <= 1
            ? 'Fácil'
            : idx >= 3
              ? 'Avançado'
              : 'Moderado';
      return {
        id: `step-${idx + 1}`,
        step: item.step,
        difficulty: diff,
        detail: item.detail,
      };
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Erro na rota /api/investigate:', err);
    const message =
      err instanceof Error ? err.message : 'Erro inesperado ao consultar o Gemini.';
    return NextResponse.json(
      {
        error: 'GEMINI_API_ERROR',
        message: `Não foi possível gerar a solução com o Gemini: ${message}`,
      },
      { status: 500 }
    );
  }
}
