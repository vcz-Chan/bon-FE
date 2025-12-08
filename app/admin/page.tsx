"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Folder, FileText, ChevronRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Category } from "@/types"
import { PreviewChatModal } from "@/components/admin/preview-chat-modal"

export default function AdminDashboard() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [previewOpen, setPreviewOpen] = useState(false)

    useEffect(() => {
        // Check Auth
        const auth = sessionStorage.getItem("bon_auth")
        if (!auth) {
            router.replace("/")
            return
        }
        const { role } = JSON.parse(auth)
        if (role !== 'admin') {
            alert("관리자만 접근 가능합니다.")
            router.replace("/")
            return
        }

        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const auth = JSON.parse(sessionStorage.getItem("bon_auth") || "{}")
            const res = await fetch("/api/admin/categories", {
                headers: { "X-Admin-Password": auth.password || "" }
            })
            const json = await res.json()
            if (json.ok) {
                setCategories(json.data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-xl shadow-xl min-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
                <header className="bg-white/50 border-b border-slate-200 px-4 py-4 md:px-6 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                    <h1 className="text-lg md:text-xl font-bold text-slate-900">관리자 대시보드</h1>
                    <div className="flex gap-2">
                        <button className="text-xs md:text-sm text-slate-500 hover:text-slate-900 px-2 py-1 md:px-3">
                            로그아웃
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
                    <section className="mb-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">카테고리 관리</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {loading ? (
                                <p className="text-slate-500">로딩 중...</p>
                            ) : categories.map((cat) => (
                                <Card
                                    key={cat.id}
                                    className="p-6 cursor-pointer hover:shadow-md transition-shadow group bg-white border-slate-200"
                                    onClick={() => router.push(`/admin/articles?category=${cat.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-bon-burgundy/10 group-hover:text-bon-burgundy transition-colors">
                                            <Folder className="w-6 h-6 text-slate-600 group-hover:text-bon-burgundy" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                            {cat.code}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">
                                        {cat.description || "설명 없음"}
                                    </p>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <FileText className="w-4 h-4 mr-1" />
                                        <span>문서 {cat.doc_count || 0}개</span>
                                        <ChevronRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-slate-900" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Placeholder for Preview Chat or other widgets */}
                    <section>
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 text-white flex justify-between items-center shadow-lg">
                            <div>
                                <h3 className="text-xl font-bold mb-2">프리뷰 챗</h3>
                                <p className="text-slate-300 mb-4">관리자 권한으로 답변 품질을 점검해보세요.</p>
                            </div>
                            <button
                                onClick={() => setPreviewOpen(true)}
                                className="bg-white text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                            >
                                챗봇 시작하기
                            </button>
                        </div>
                    </section>
                </main>

                <PreviewChatModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />
            </div>
        </div>
    )
}
