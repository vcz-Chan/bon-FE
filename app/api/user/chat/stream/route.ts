import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
    try {
        console.log(`[Proxy] Connecting to Backend: ${API_URL}/api/user/chat/stream`);

        const body = await request.json();
        const userPassword = request.headers.get("X-User-Password") || "";

        console.log(`[Proxy] Request Body:`, JSON.stringify(body));
        console.log(`[Proxy] Headers (Pwd length):`, userPassword.length);

        const response = await fetch(`${API_URL}/api/user/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Password': userPassword,
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify(body),
        });

        console.log(`[Proxy] Backend Response Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Backend Error Body: ${errorText}`);
            return NextResponse.json({ ok: false, message: errorText || "Backend Error" }, { status: response.status });
        }

        if (!response.body) {
            console.error(`[Proxy] Error: No Response Body`);
            return NextResponse.json({ ok: false, message: "No response body" }, { status: 500 });
        }

        console.log(`[Proxy] Starting Stream Forwarding...`);

        // Forward the stream
        return new NextResponse(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error: any) {
        console.error("Chat stream proxy error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ ok: false, message: `Proxy Error: ${errorMessage}` }, { status: 500 });
    }
}
