import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminPassword = request.headers.get("X-Admin-Password") || "";

        // Forward query params
        const response = await fetch(`${API_URL}/api/admin/articles?${searchParams.toString()}`, {
            headers: {
                'X-Admin-Password': adminPassword
            }
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Articles proxy error:", error);
        return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const adminPassword = request.headers.get("X-Admin-Password") || "";

        const response = await fetch(`${API_URL}/api/admin/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': adminPassword
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Articles create proxy error:", error);
        return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
    }
}
