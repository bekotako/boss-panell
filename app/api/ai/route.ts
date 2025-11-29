import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Gizli anahtarı sunucudan al
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Sunucu tarafında API anahtarı eksik.' }, { status: 500 });
    }

    // 2. Frontend'den gelen veriyi oku
    const { prompt } = await req.json();

    // 3. Groq AI'a istek at (Server-to-Server)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    // 4. Cevabı Frontend'e geri yolla
    return NextResponse.json({ content: data.choices[0].message.content });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}