import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Sunucudaki Anahtarı Kontrol Et
    const apiKey = process.env.GROQ_API_KEY;
    
    // Konsola durum raporu yaz (Şifrenin tamamını göstermez, sadece var mı yok mu der)
    console.log("API Key Durumu:", apiKey ? "✅ Mevcut" : "❌ EKSİK!");

    if (!apiKey) {
      return NextResponse.json(
        { error: "Sunucu hatası: API Anahtarı bulunamadı. Lütfen .env.local dosyasını kontrol edin." }, 
        { status: 500 }
      );
    }

    // 2. Frontend'den gelen mesajı al
    const body = await req.json();
    const { prompt } = body;

    // 3. Groq'a İstek Gönder
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

    if (data.error) {
      console.error("Groq Hatası:", data.error);
      throw new Error(data.error.message);
    }

    // 4. Cevabı Döndür
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Sunucu Hatası:", error);
    return NextResponse.json({ error: error.message || "Bilinmeyen bir hata oluştu." }, { status: 500 });
  }
}