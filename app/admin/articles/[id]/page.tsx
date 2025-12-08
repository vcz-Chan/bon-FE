"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Category, Article } from "@/types"

export default function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const isNew = id === 'new';
    const router = useRouter();

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<Article>>({
        title: "",
        content: "",
        summary: "",
        category_id: 1,
        priority: 0,
        requires_sm: false,
        is_published: true
    });

    useEffect(() => {
        // Check Auth
        const auth = sessionStorage.getItem("bon_auth")
        if (!auth) router.replace("/")

        fetchCategories();
        if (!isNew) {
            fetchArticle();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const auth = JSON.parse(sessionStorage.getItem("bon_auth") || "{}")
            const res = await fetch("/api/admin/categories", {
                headers: { "X-Admin-Password": auth.password || "" }
            })
            const json = await res.json()
            if (json.ok) setCategories(json.data)
        } catch (e) { }
    };

    const fetchArticle = async () => {
        try {
            const auth = JSON.parse(sessionStorage.getItem("bon_auth") || "{}")
            const res = await fetch(`/api/admin/articles/${id}`, {
                headers: { "X-Admin-Password": auth.password || "" }
            })
            const json = await res.json()
            if (json.ok) {
                setFormData(json.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) return alert("제목과 내용은 필수입니다.");

        setSaving(true);
        try {
            const auth = JSON.parse(sessionStorage.getItem("bon_auth") || "{}")
            const method = isNew ? "POST" : "PUT";
            const url = isNew ? "/api/admin/articles" : `/api/admin/articles/${id}`;

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Password": auth.password || ""
                },
                body: JSON.stringify(formData)
            });

            const json = await res.json();
            if (json.ok) {
                alert("저장되었습니다.");
                router.push("/admin/articles");
            } else {
                alert(json.message || "저장 실패");
            }
        } catch (e) {
            alert("오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">로딩 중...</div>;

    return (
        <div className="min-h-screen p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-xl shadow-xl min-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
                <header className="bg-white/50 border-b border-slate-200 px-4 py-4 md:px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                        <h1 className="text-lg md:text-xl font-bold text-slate-900">
                            {isNew ? "새 문서 작성" : "문서 수정"}
                        </h1>
                    </div>
                    <div className="flex gap-1 md:gap-2">
                        {!isNew && (
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs md:text-sm px-2 md:px-4">
                                <Trash2 className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">삭제</span>
                            </Button>
                        )}
                        <Button variant="gradient" onClick={handleSave} disabled={saving} className="min-w-[80px] md:min-w-[100px] text-xs md:text-sm">
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? "저장 중..." : "저장"}
                        </Button>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 md:p-6 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">카테고리</label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-bon-green-start outline-none"
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">우선순위 (Priority)</label>
                                <Input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">제목</label>
                            <Input
                                placeholder="문서 제목을 입력하세요"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">본문 내용</label>
                            <textarea
                                className="w-full min-h-[300px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-bon-green-start outline-none resize-y"
                                placeholder="본문 내용을 입력하세요..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">요약 (선택)</label>
                            <textarea
                                className="w-full min-h-[80px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-bon-green-start outline-none resize-none"
                                placeholder="문서 요약..."
                                value={formData.summary || ""}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-6 pt-4 border-t border-slate-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-4 h-4 text-bon-green-start border-gray-300 rounded focus:ring-bon-green-start"
                                />
                                <span className="text-sm font-medium text-slate-700">공개 게시</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.requires_sm}
                                    onChange={(e) => setFormData({ ...formData, requires_sm: e.target.checked })}
                                    className="w-4 h-4 text-bon-green-start border-gray-300 rounded focus:ring-bon-green-start"
                                />
                                <span className="text-sm font-medium text-slate-700">SM 확인 필요 여부</span>
                            </label>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}
