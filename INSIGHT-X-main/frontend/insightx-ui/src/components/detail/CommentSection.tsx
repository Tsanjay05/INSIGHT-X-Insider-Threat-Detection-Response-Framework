/**
 * Comment section for detail pages
 */

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatTimeAgo } from '@/lib/utils';

interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    isInternal?: boolean;
}

interface CommentSectionProps {
    comments: Comment[];
    onAddComment: (content: string) => void;
    isSubmitting?: boolean;
    placeholder?: string;
    className?: string;
}

export function CommentSection({
    comments,
    onAddComment,
    isSubmitting = false,
    placeholder = 'Add a comment...',
    className,
}: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(newComment.trim());
        setNewComment('');
    };

    return (
        <div className={className}>
            {/* Comment list */}
            <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                    <p className="text-sm text-text-tertiary text-center py-4">No comments yet</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                                {comment.author.charAt(0).toUpperCase()}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-primary">{comment.author}</span>
                                    <span className="text-xs text-text-tertiary">{formatTimeAgo(comment.createdAt)}</span>
                                    {comment.isInternal && (
                                        <span className="text-xs px-1.5 py-0.5 bg-warning-400/10 text-warning-400 rounded">Internal</span>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add comment form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 h-10 px-3 bg-bg-elevated border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 transition-colors"
                />
                <Button
                    type="submit"
                    size="icon"
                    loading={isSubmitting}
                    disabled={!newComment.trim() || isSubmitting}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
