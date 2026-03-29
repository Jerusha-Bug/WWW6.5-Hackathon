"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Globe, Shield, Star, X } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RingChart, ScoreBar } from "@/components/common/ring-chart";
import { MOCK_MENTOR_DETAIL, getMentorReviews } from "@/data/detail-mock";
import type { ReviewItem } from "@/data/detail-mock";
import { cn } from "@/lib/utils";

type PageProps = {
  params: { id: string };
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function addr(address: string) {
  return address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
}

const DIM_LABELS: Record<string, string> = {
  communication: "沟通能力",
  technical: "技术深度",
  responsiveness: "响应速度",
};

function countTags(reviews: ReviewItem[]) {
  const counts: Record<string, number> = {};
  reviews.forEach((r) => r.tags.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; }));
  return counts;
}

function getTagCloud(tags: Record<string, number>) {
  return Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

export default function MentorDetailPage({ params }: PageProps) {
  const id = decodeURIComponent(params.id);
  const mentor = MOCK_MENTOR_DETAIL[id];
  const allReviews = getMentorReviews(id);
  const [filter, setFilter] = useState<"all" | "verified">("all");
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>(allReviews);

  // Form state
  const [formRating, setFormRating] = useState(0);
  const [formTags, setFormTags] = useState("");
  const [formComment, setFormComment] = useState("");

  if (!mentor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Mentor 未找到</h1>
        <p className="mt-2 text-muted-foreground">ID: {id}</p>
        <Link href="/mentors">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="h-4 w-4" />
            返回榜单
          </Button>
        </Link>
      </div>
    );
  }

  const verifiedCount = reviews.filter((r) => r.txHash).length;
  const tagCounts = countTags(reviews);
  const tagCloud = getTagCloud(tagCounts);
  const maxCount = tagCloud[0]?.count ?? 1;

  const displayedReviews = filter === "verified" ? reviews.filter((r) => r.txHash) : reviews;

  function handleSubmitReview() {
    if (formRating === 0 || formComment.trim() === "") return;

    const tagList = formTags.split(",").map((t) => t.trim()).filter(Boolean);
    const today = new Date().toISOString().split("T")[0];

    const newReview: ReviewItem = {
      id: `new-${Date.now()}`,
      author: "You",
      authorAddress: "0x0000...0001",
      rating: formRating,
      date: today,
      comment: formComment,
      tags: tagList,
    };

    setReviews([newReview, ...reviews]);
    setShowModal(false);
    setFormRating(0);
    setFormTags("");
    setFormComment("");
    setFilter("all");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Back */}
      <div className="mb-6">
        <Link href="/mentors">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardContent className="p-5">
                {/* Profile */}
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 border-2 border-accent/30 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-accent/30 to-accent/10 text-lg font-bold text-accent">
                      {initials(mentor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="mt-3 text-lg font-semibold">{mentor.name}</h1>
                  <p className="mt-0.5 text-sm text-muted-foreground">{mentor.title}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {mentor.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ring Chart */}
                <div className="mt-5 flex justify-center">
                  <RingChart value={mentor.rating} size={120} strokeWidth={8} showLabel label="综合评分" />
                </div>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  基于 {reviews.length} 条评价
                </p>

                {/* Bio */}
                <div className="mt-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{mentor.bio}</p>
                </div>

                {/* Social Links */}
                <div className="mt-4 flex items-center justify-center gap-3">
                  {mentor.twitter && (
                    <a
                      href={`https://twitter.com/${mentor.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {mentor.github && (
                    <a
                      href={`https://github.com/${mentor.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* Write Review Button */}
                <Button className="mt-4 w-full" size="lg" onClick={() => setShowModal(true)}>
                  写评价
                </Button>
              </CardContent>
            </Card>

            {/* Tag Cloud */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">标签云</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tagCloud.map(({ tag, count }) => {
                    const weight = count / maxCount;
                    return (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer text-[10px] transition-colors hover:bg-accent/20"
                        style={{ opacity: 0.5 + weight * 0.5 }}
                      >
                        {tag}
                        <span className="ml-1 opacity-60">({count})</span>
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Supplementary Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">补充信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">加入时间</span>
                  <span className="font-medium">{mentor.createdAt}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">擅长领域</span>
                  <span className="font-medium">{mentor.domain}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">评价总数</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Rating Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">评价详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex shrink-0 justify-center sm:min-w-[160px]">
                  <div className="flex flex-col items-center">
                    <RingChart value={mentor.rating} size={140} strokeWidth={10} showLabel />
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {reviews.length} 条评价
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {(["communication", "technical", "responsiveness"] as const).map((key) => (
                    <ScoreBar key={key} label={DIM_LABELS[key]} value={mentor.stats[key]} />
                  ))}
                  <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">综合评分</span>
                      <span className="font-semibold text-accent">{mentor.rating.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">评价筛选</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setFilter("all")}
              >
                全部 ({reviews.length})
              </Button>
              <Button
                size="sm"
                variant={filter === "verified" ? "default" : "outline"}
                className={cn(
                  "h-8 text-xs gap-1.5",
                  filter === "verified" && "bg-accent text-accent-foreground"
                )}
                onClick={() => setFilter("verified")}
              >
                <Shield className="h-3.5 w-3.5" />
                链上验证 ({verifiedCount})
              </Button>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              {filter === "verified" ? "链上验证评价" : "全部评价"} ({displayedReviews.length})
            </h2>
            {displayedReviews.length === 0 ? (
              <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">暂无符合条件的评价</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedReviews.map((review) => (
                  <Card key={review.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-accent/20 to-accent/5 text-xs font-medium text-accent">
                          {initials(review.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{review.author}</span>
                          <span className="font-mono text-xs text-muted-foreground">{addr(review.authorAddress)}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} width="12" height="12" viewBox="0 0 14 14" fill={i < review.rating ? "#f59e0b" : "#e5e7eb"}>
                                <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.43L7 8.885 3.91 10.5l.59-3.43L2 4.635l3.455-.505L7 1z" />
                              </svg>
                            ))}
                          </div>
                          {review.txHash && (
                            <Badge variant="outline" className="h-5 gap-1 text-[9px] border-accent/40 bg-accent/10 text-accent">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              链上
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                      {review.txHash && (
                        <a
                          href={`https://etherscan.io/tx/${review.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    <p className="mt-4 text-sm leading-relaxed">{review.comment}</p>

                    {review.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {review.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          {/* Modal */}
          <div className="relative w-full max-w-lg rounded-2xl bg-background shadow-2xl overflow-hidden">
            {/* Header Banner */}
            <div className="relative bg-gradient-to-br from-accent/20 via-background to-accent/10 p-6 pb-8 border-b border-border/40">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-accent/30 bg-accent/10 shadow-sm">
                  <span className="text-lg font-bold text-accent">{initials(mentor.name)}</span>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">写评价</p>
                  <h2 className="mt-1 text-lg font-semibold">{mentor.name}</h2>
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Rating */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">给 {mentor.name} 评分</span>
                  {formRating > 0 && (
                    <span className="text-xs text-accent font-medium">
                      {formRating === 5 ? "极好" : formRating === 4 ? "很好" : formRating === 3 ? "一般" : formRating === 2 ? "较差" : "很差"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormRating(i + 1)}
                      className="group p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-9 w-9 transition-all duration-200",
                          i < formRating
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "fill-transparent text-muted-foreground/40 group-hover:text-muted-foreground/60"
                        )}
                      />
                    </button>
                  ))}
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
                    style={{ width: `${(formRating / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  标签 <span className="text-xs text-muted-foreground font-normal">(选填，多个用逗号分隔)</span>
                </label>
                <input
                  type="text"
                  placeholder="专业 高效 耐心"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
                <div className="flex flex-wrap gap-1.5">
                  {["专业", "高效", "耐心", "清晰", "负责"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const current = formTags.split(",").map((t) => t.trim()).filter(Boolean);
                        if (!current.includes(tag)) {
                          setFormTags([...current, tag].join(", "));
                        }
                      }}
                      className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">评价内容</label>
                <div className="relative">
                  <textarea
                    placeholder="分享你的真实体验，帮助更多人了解这位 Mentor..."
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    className="w-full resize-none rounded-xl border border-border/80 bg-muted/20 px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/40">
                    {formComment.length}/500
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-border/60 bg-muted/30 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={formRating === 0 || formComment.trim() === ""}
                  className={cn(
                    "flex-1 rounded-xl py-3 text-sm font-medium transition-all",
                    formRating > 0 && formComment.trim()
                      ? "bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:bg-accent/90"
                      : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  提交评价
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}