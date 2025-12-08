import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const adminPassword = request.headers.get("X-Admin-Password") || "";

        const response = await fetch(`${API_URL}/api/admin/articles/${id}`, {
            headers: {
                'X-Admin-Password': adminPassword
            }
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Article detail proxy error:", error);
        return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const adminPassword = request.headers.get("X-Admin-Password") || "";

        const response = await fetch(`${API_URL}/api/admin/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': adminPassword
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Article update proxy error:", error);
        return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const adminPassword = request.headers.get("X-Admin-Password") || "";

        const response = await fetch(`${API_URL}/api/admin/articles/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Admin-Password': adminPassword
            }
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Article delete proxy error:", error);
        return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
    }
}
