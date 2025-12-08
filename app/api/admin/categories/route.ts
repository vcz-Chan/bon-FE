import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(request: Request) {
    try {
        const adminPassword = request.headers.get("X-Admin-Password") || "";

        const response = await fetch(`${API_URL}/api/admin/categories`, {
            headers: {
                'X-Admin-Password': adminPassword
            }
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Categories proxy error:", error);
        return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
    }
}
