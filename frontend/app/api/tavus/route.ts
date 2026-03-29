import { NextResponse } from 'next/server';

export async function POST() {
  const TAVUS_API_KEY = process.env.VITE_TAVUS_API_KEY;
  const REPLICA_ID = process.env.VITE_REPLICA_ID;
  const PERSONA_ID = process.env.VITE_PERSONA_ID;

  if (!TAVUS_API_KEY) {
    return NextResponse.json({ error: "Missing Tavus API Key" }, { status: 500 });
  }

  try {
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        replica_id: REPLICA_ID,
        persona_id: PERSONA_ID,
        conversational_context: "You are an AI financial analyst for the ET Edge platform. Provide high-level technical analysis and market insights."
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Tavus API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
