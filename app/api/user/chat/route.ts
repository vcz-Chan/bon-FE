import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const userPassword = request.headers.get("X-User-Password") || "";

        const response = await fetch(`${API_URL}/api/user/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Password': userPassword
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("Chat proxy error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ ok: false, message: `Proxy Error: ${errorMessage}` }, { status: 500 });
    }
}
