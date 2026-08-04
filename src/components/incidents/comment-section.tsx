"use client";

import { useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { MessageSquare, Trash2, Send, ShieldAlert, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { submitComment, deleteComment } from "@/actions/comments";
import { Link } from "@/i18n/routing";
import { formatRelativeTime } from "@/lib/utils";
import Image from "next/image";

export interface CommentUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
}

export interface IncidentComment {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
  users?: CommentUser | null;
}

export function CommentSection({
  incidentId,
  comments: initialComments,
  currentUserId,
  isAuthenticated,
}: {
  incidentId: string;
  comments: IncidentComment[];
  currentUserId: string | null;
  isAuthenticated: boolean;
}) {
  const locale = useLocale();
  const [comments, setComments] = useState<IncidentComment[]>(initialComments);
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Simple localized helpers
  const textTitle = locale === "tr" ? "Topluluk Tartışması" : "Community Discussion";
  const textNoComments =
    locale === "tr"
      ? "Henüz yorum yapılmamış. Tartışmayı siz başlatın!"
      : "No comments yet. Start the discussion!";
  const textPlaceholder =
    locale === "tr"
      ? "Düşüncelerinizi paylaşın... (Kişisel veriler otomatik maskelenir)"
      : "Share your thoughts... (Personal info will be auto-masked)";
  const textSubmit = locale === "tr" ? "Gönder" : "Send";
  const textSubmitting = locale === "tr" ? "Gönderiliyor..." : "Sending...";
  const textAuthRequired =
    locale === "tr"
      ? "Tartışmaya katılmak için giriş yapmalısınız."
      : "You must sign in to join the discussion.";
  const textSignIn = locale === "tr" ? "Giriş Yap" : "Sign In";
  const textDelete = locale === "tr" ? "Yorumu Sil" : "Delete Comment";

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    startTransition(async () => {
      const res = await submitComment(incidentId, commentText);
      if (res.ok) {
        toast.success(locale === "tr" ? "Yorum yayınlandı!" : "Comment posted!");
        setCommentText("");
        // Optimistic / Local update for rapid feedback
        const newComment: IncidentComment = {
          id: res.commentId ?? Math.random().toString(),
          comment_text: commentText,
          created_at: new Date().toISOString(),
          user_id: currentUserId || "",
          users: {
            id: currentUserId || "",
            full_name: locale === "tr" ? "Siz" : "You",
            username: "you",
            avatar_url: null,
            role: "user",
          },
        };
        setComments((prev) => [...prev, newComment]);
      } else {
        toast.error(
          res.error || (locale === "tr" ? "Yorum gönderilemedi." : "Failed to post comment."),
        );
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (
      !window.confirm(
        locale === "tr"
          ? "Bu yorumu silmek istediğinize emin misiniz?"
          : "Are you sure you want to delete this comment?",
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteComment(commentId, incidentId);
      if (res.ok) {
        toast.success(locale === "tr" ? "Yorum silindi." : "Comment deleted.");
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        toast.error(
          res.error || (locale === "tr" ? "Silme işlemi başarısız." : "Failed to delete."),
        );
      }
    });
  };

  return (
    <section id="comments" className="space-y-6">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <MessageSquare className="text-brand-400 h-5 w-5" />
        <h3 className="text-fg-primary text-xl font-bold tracking-tight">{textTitle}</h3>
        <span className="bg-brand-500/10 text-brand-400 border-brand-500/20 rounded-full border px-2.5 py-0.5 text-xs font-bold">
          {comments.length}
        </span>
      </div>

      {comments.length === 0 ? (
        <div className="bg-bg-secondary/20 rounded-xl border border-dashed border-white/10 py-10 text-center">
          <MessageSquare className="text-fg-disabled mx-auto mb-3 h-8 w-8" />
          <p className="text-fg-secondary text-sm font-medium">{textNoComments}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = comment.user_id === currentUserId;
            const userObj = comment.users;
            const displayName =
              userObj?.full_name ||
              userObj?.username ||
              (locale === "tr" ? "Anonim Kullanıcı" : "Anonymous User");
            const avatarUrl = userObj?.avatar_url;
            const isMod = userObj?.role === "admin" || userObj?.role === "moderator";

            return (
              <div
                key={comment.id}
                className="border-border-subtle bg-bg-secondary/40 hover:bg-bg-secondary/60 flex gap-4 rounded-xl border p-4 transition-all duration-200"
              >
                <div className="bg-bg-tertiary relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="text-fg-muted h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-fg-primary text-sm font-extrabold">{displayName}</span>
                      {isMod && (
                        <span className="bg-danger-500/10 text-danger-400 border-danger-500/25 py-0.2 rounded-md border px-1.5 text-[10px] font-bold tracking-wider uppercase">
                          {locale === "tr" ? "Moderatör" : "Mod"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-fg-muted flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(new Date(comment.created_at), locale)}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-fg-muted hover:text-danger-400 p-1 transition-colors"
                          title={textDelete}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-fg-secondary text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.comment_text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment Editor */}
      <Card className="border-border-subtle bg-bg-secondary/30">
        <CardContent className="p-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={textPlaceholder}
                className="bg-bg-primary/50 focus:border-brand-500 placeholder:text-fg-disabled focus:ring-brand-500 min-h-24 w-full rounded-lg border border-white/10 p-3 text-sm focus:ring-1 focus:outline-none"
                maxLength={1000}
                disabled={isPending}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handlePostComment}
                  disabled={isPending || !commentText.trim()}
                  leftIcon={isPending ? undefined : <Send className="h-3.5 w-3.5" />}
                >
                  {isPending ? textSubmitting : textSubmit}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ShieldAlert className="text-fg-muted mb-2 h-7 w-7" />
              <p className="text-fg-secondary mb-4 text-sm font-medium">{textAuthRequired}</p>
              <Link href="/auth/signin">
                <Button size="sm" variant="outline">
                  {textSignIn}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
