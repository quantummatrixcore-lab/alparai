"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { addSuggestionComment, upvoteSuggestion } from "@/actions/community/suggestions";
import { toast } from "sonner";
import { ThumbsUp, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { useLocale } from "next-intl";

export interface CommentType {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string | null;
  users: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

export function SuggestionCommentList({
  suggestionId,
  initialComments,
}: {
  suggestionId: string;
  initialComments: CommentType[];
}) {
  const t = useTranslations("suggestions");
  const locale = useLocale();
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("suggestionId", suggestionId);
    formData.append("commentText", commentText);

    const result = await addSuggestionComment({ ok: false }, formData);
    setIsSubmitting(false);

    if (result.ok) {
      toast.success(t("comment_added", { defaultValue: "Comment added successfully!" }));
      setCommentText("");
    } else {
      toast.error(result.error || t("comment_failed", { defaultValue: "Failed to add comment." }));
    }
  };

  const handleUpvote = async () => {
    setIsUpvoting(true);
    const result = await upvoteSuggestion(suggestionId);
    setIsUpvoting(false);

    if (result.ok) {
      toast.success(t("upvoted", { defaultValue: "Upvote recorded!" }));
    } else {
      toast.error(result.error || t("upvote_failed", { defaultValue: "Failed to upvote." }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-border-subtle flex items-center justify-between border-b pb-4">
        <h3 className="text-fg-primary text-xl font-bold">
          {t("comments", { defaultValue: "Comments" })} ({initialComments.length})
        </h3>
        <Button
          onClick={handleUpvote}
          disabled={isUpvoting}
          variant="outline"
          className="text-brand-400 hover:text-brand-300 border-brand-500/30 font-bold transition-all"
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          {t("upvote", { defaultValue: "Upvote" })}
        </Button>
      </div>

      <div className="space-y-6">
        {initialComments.length === 0 ? (
          <p className="text-fg-muted text-sm italic">
            {t("no_comments", {
              defaultValue: "No comments yet. Be the first to share your thoughts!",
            })}
          </p>
        ) : (
          initialComments.map((comment) => (
            <Card key={comment.id} className="bg-bg-secondary/40 border-border-subtle">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="border-border-subtle h-10 w-10 border">
                    <AvatarImage src={comment.users?.avatar_url || undefined} />
                    <AvatarFallback className="bg-bg-tertiary text-fg-muted">
                      {comment.users?.full_name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-fg-primary text-sm font-semibold">
                          {comment.users?.full_name || t("anon", { defaultValue: "Anonymous" })}
                        </span>
                        {comment.users?.role === "admin" && (
                          <span className="bg-brand-500/20 text-brand-400 border-brand-500/30 rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-fg-muted text-xs">
                        {formatRelativeTime(new Date(comment.created_at), locale)}
                      </span>
                    </div>
                    <p className="text-fg-secondary pt-2 text-sm whitespace-pre-wrap">
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-border-subtle space-y-4 border-t pt-4">
        <Textarea
          placeholder={t("write_comment_placeholder", {
            defaultValue: "Write your comment here...",
          })}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="bg-bg-secondary/40 border-border-subtle focus-visible:ring-brand-500 min-h-[100px] resize-y"
          maxLength={3000}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="bg-brand-500 hover:bg-brand-400 text-white"
          >
            <Send className="mr-2 h-4 w-4" />
            {t("submit_comment", { defaultValue: "Submit Comment" })}
          </Button>
        </div>
      </form>
    </div>
  );
}
