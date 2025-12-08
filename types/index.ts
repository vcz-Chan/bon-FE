export type UserRole = 'admin' | 'user';

export interface Category {
    id: number;
    code: string;
    name: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    doc_count?: number; // UI convenience
}

export interface Article {
    id: number;
    category_id: number;
    title: string;
    content: string;
    summary?: string;
    priority: number;
    requires_sm: boolean;
    is_published: boolean;
}

export interface Message {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    references?: Array<{
        article_id: number;
        category_code: string;
        title?: string;
    }>;
}
