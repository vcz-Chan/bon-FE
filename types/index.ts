export type UserRole = 'admin' | 'user';

export interface Category {
    id: string;
    code: string;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    article_count: string;
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
