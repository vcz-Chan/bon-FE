"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, Bot, User, FileText, ChevronRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Message } from "@/types"
import { useToast } from "@/components/ui/toast"

export default function ChatPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Check auth
        const auth = sessionStorage.getItem("bon_auth")
        if (!auth) {
            router.replace("/")
            return
        }
        const { role } = JSON.parse(auth)
        if (role !== 'user') {
            showToast("접근 권한이 없습니다.", "error")
            router.replace("/")
        }

        // Initial greeting
        setMessages([
            { role: 'assistant', content: '안녕하세요 사장님, 무엇을 도와드릴까요? 매장 운영에 관해 궁금한 점을 물어보세요.' }
        ])
    }, [router])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setLoading(true)

        // Create empty assistant message
        const assistantMsgId = Date.now().toString()
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '',
            id: assistantMsgId
        }])

        try {
            const auth = JSON.parse(sessionStorage.getItem("bon_auth") || "{}")
            const response = await fetch("/api/user/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Password": auth.password || ""
                },
                body: JSON.stringify({ question: userMsg.content }),
            })

            if (!response.ok) throw new Error("Network error")
            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })

                // Process lines properly including potential incomplete chunks
                const lines = buffer.split('\n\n')
                buffer = lines.pop() || '' // Keep the last incomplete chunk in buffer

                for (const line of lines) {
                    const trimmedLine = line.trim()
                    if (!trimmedLine) continue

                    if (trimmedLine.startsWith('event:')) {
                        const [eventLine, dataLine] = trimmedLine.split('\n')
                        const eventType = eventLine.replace('event: ', '').trim()

                        // Robust data extraction
                        let dataStr = ''
                        if (dataLine && dataLine.startsWith('data: ')) {
                            dataStr = dataLine.replace('data: ', '').trim()
                        } else {
                            // Fallback if split didn't catch data line properly or weird format
                            const parts = trimmedLine.split('data: ')
                            if (parts.length > 1) dataStr = parts[1].trim()
                        }

                        if (dataStr) {
                            if (eventType === 'meta') {
                                try {
                                    console.log("[Meta Event]", dataStr) // Debug log
                                    const meta = JSON.parse(dataStr)
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === assistantMsgId ? { ...msg, references: meta.references } : msg
                                    ))
                                } catch (e) {
                                    console.error("Failed to parse meta", e)
                                }
                            } else if (eventType === 'chunk') {
                                // ... (chunk logic same as before)
                                try {
                                    const chunk = JSON.parse(dataStr)
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === assistantMsgId ? { ...msg, content: msg.content + (chunk.text || '') } : msg
                                    ))
                                } catch (e) { console.error(e) }
                            } else if (eventType === 'error') {
                                throw new Error(dataStr)
                            }
                        }
                    }
                }
            }

            // Flush remaining buffer
            if (buffer.trim()) {
                const lines = buffer.split('\n\n')
                for (const line of lines) {
                    const trimmedLine = line.trim()
                    if (!trimmedLine) continue
                    if (trimmedLine.startsWith('event:')) {
                        const [eventLine, dataLine] = trimmedLine.split('\n')
                        const eventType = eventLine.replace('event: ', '').trim()
                        let dataStr = ''
                        if (dataLine && dataLine.startsWith('data: ')) {
                            dataStr = dataLine.replace('data: ', '').trim()
                        } else {
                            const parts = trimmedLine.split('data: ')
                            if (parts.length > 1) dataStr = parts[1].trim()
                        }

                        if (dataStr) {
                            if (eventType === 'meta') {
                                try {
                                    console.log("[Meta Event Flush]", dataStr)
                                    const meta = JSON.parse(dataStr)
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === assistantMsgId ? { ...msg, references: meta.references } : msg
                                    ))
                                } catch (e) { console.error(e) }
                            } else if (eventType === 'chunk') {
                                try {
                                    const chunk = JSON.parse(dataStr)
                                    setMessages(prev => prev.map(msg =>
                                        msg.id === assistantMsgId ? { ...msg, content: msg.content + (chunk.text || '') } : msg
                                    ))
                                } catch (e) { console.error(e) }
                            }
                        }
                    }
                }
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => prev.map(msg =>
                msg.id === assistantMsgId ? { ...msg, content: msg.content + '\n\n[오류가 발생했습니다. 잠시 후 다시 시도해주세요.]' } : msg
            ))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen md:p-8 flex items-center justify-center">
            {/* Mobile: Full Screen, Desktop: Centered Card */}
            <div className="w-full h-[100dvh] md:h-[80vh] md:max-w-3xl bg-white/90 md:bg-white/90 md:backdrop-blur-sm md:rounded-xl md:shadow-2xl overflow-hidden flex flex-col relative">
                {/* Header */}
                <header className="flex-none flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-slate-200 z-10">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-500" />
                        </Button>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">운영 매뉴얼 챗봇</h2>
                    </div>

                    <span className="text-sm px-3 py-1 rounded-full border border-slate-200 text-slate-600 font-bold bg-slate-50">
                        사장님 모드
                    </span>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200' : 'bg-bon-burgundy/10'}`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-bon-burgundy" />}
                                </div>

                                <div className={`space-y-2`}>
                                    <div className={`p-4 rounded-2xl text-base leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-bon-green-start to-bon-green-end text-white rounded-tr-none'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                        {msg.role === 'assistant' && msg.content === '' && loading && (
                                            <div className="flex space-x-1 h-6 items-center">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        )}
                                        {/* Content rendered above, closing tag removed here to merge with references below */}

                                        {/* References UI Redesign */}
                                        {msg.references && msg.references.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                <p className="text-sm text-slate-500 mb-2 font-semibold flex items-center gap-1">
                                                    <FileText className="w-4 h-4" /> 참고 문서
                                                </p>
                                                <div className="flex flex-col gap-2">
                                                    {msg.references.map((ref, i) => (
                                                        <div
                                                            key={i}
                                                            className="group flex items-center justify-between p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                                                            onClick={() => {
                                                                // Could open modal or expand later
                                                                // For now just visual interactivity
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div className="px-1 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-bon-green-start font-bold text-xs shadow-sm group-hover:border-bon-green-start group-hover:text-bon-green-end transition-colors">
                                                                    {ref.category_code}
                                                                </div>
                                                                <div className="truncate">
                                                                    <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate">
                                                                        {ref.title}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex-none p-4 bg-white border-t border-slate-200 pb-8 md:pb-4">
                    <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    // Prevent submission during IME composition (Korean)
                                    if (e.nativeEvent.isComposing) return;
                                    handleSend(e);
                                }
                            }}
                            placeholder="궁금한 내용을 입력하세요..."
                            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-bon-green-start min-h-[50px] max-h-[150px]"
                            rows={1}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            variant="gradient"
                            className="w-12 h-auto rounded-xl shrink-0"
                            disabled={!input.trim() || loading}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div >
    )
}
