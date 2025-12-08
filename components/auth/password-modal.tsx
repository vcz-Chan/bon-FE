"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserRole } from "@/types"
import { useToast } from "@/components/ui/toast"

interface PasswordModalProps {
    isOpen: boolean
    onClose: () => void
    role: UserRole | null
}

export function PasswordModal({ isOpen, onClose, role }: PasswordModalProps) {
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!role || !password) return

        setIsLoading(true)

        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mode: role, password }),
            })

            const data = await res.json()

            if (!res.ok || !data.ok) {
                const errorMsg = data.message || "인증에 실패했습니다."
                showToast(errorMsg, "error")
                throw new Error(errorMsg)
            }

            // Save to sessionStorage
            // Storing role and password to use in headers later
            sessionStorage.setItem("bon_auth", JSON.stringify({ role, password }))

            // Show success toast
            showToast(role === 'admin' ? "관리자 인증 완료" : "사장님 인증 완료", "success")

            // Redirect
            if (role === 'admin') {
                router.push("/admin")
            } else {
                router.push("/chat")
            }

            onClose()
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "오류가 발생했습니다."
            showToast(errorMsg, "error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {role === 'admin' ? '관리자 인증' : '사장님 인증'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {role === 'admin'
                            ? '관리자 비밀번호를 입력해주세요.'
                            : '매장 코드를 입력해주세요'}
                    </p>
                </div>
                <div className="space-y-2">
                    <label className="text-base font-medium text-slate-700">
                        {role === 'admin' ? '비밀번호' : '매장 코드'}
                    </label>
                    <Input
                        type="password"
                        placeholder={role === 'admin' ? "관리자 비밀번호를 입력하세요" : "매장 코드를 입력하세요"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-12 text-lg"
                    />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="text-base px-6 h-12">
                        취소
                    </Button>
                    <Button type="submit" variant="gradient" disabled={isLoading} className="text-base px-6 h-12">
                        {isLoading ? "확인 중..." : "확인"}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
