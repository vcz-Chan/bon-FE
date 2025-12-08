import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(`${API_URL}/api/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        // Handle non-JSON responses from backend gracefully
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        } else {
            const text = await response.text();
            console.error("Backend returned non-JSON:", text);
            return NextResponse.json({ ok: false, message: "Backend Error: " + text }, { status: response.status });
        }

    } catch (error) {
        console.error("Auth proxy error:", error);
        return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
    }
}
