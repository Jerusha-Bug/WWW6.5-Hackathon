import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, ExternalLink, Globe, MapPin, MessageSquare, ThumbsUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RingChart, ScoreBar } from "@/components/common/ring-chart";
import { MOCK_COMPANY_DETAIL, getCompanyReviews } from "@/data/detail-mock";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const company = MOCK_COMPANY_DETAIL[decodeURIComponent(params.id)];
  return {
    title: company ? company.name : `企业 ${params.id}`,
    description: company ? `${company.industry} - ${company.region}` : undefined,
  };
}

function addr(address: string) {
  return address.length > 14 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;
}

const DIM_LABELS: Record<string, string> = {
  culture: "文化氛围",
  growth: "成长机会",
  management: "管理水平",
};

export default function CompanyDetailPage({ params }: PageProps) {
  const id = decodeURIComponent(params.id);
  const company = MOCK_COMPANY_DETAIL[id];
  const reviews = getCompanyReviews(id);

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">企业未找到</h1>
        <p className="mt-2 text-muted-foreground">ID: {id}</p>
        <Link href="/companies">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="h-4 w-4" />
            返回榜单
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Back */}
      <div className="mb-6">
        <Link href="/companies">
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
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-accent/30 bg-accent/5 shadow-lg">
                    <Building2 className="h-8 w-8 text-accent" />
                  </div>
                  <h1 className="mt-3 text-lg font-semibold">{company.name}</h1>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{company.industry}</Badge>
                    <span className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      {company.region}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {company.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ring Chart */}
                <div className="mt-5 flex justify-center">
                  <RingChart value={(company.score / 100) * 5} size={120} strokeWidth={8} showLabel label="综合评分" />
                </div>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  基于 {company.reviewCount} 条评价
                </p>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                    <p className="text-lg font-semibold">{company.mentorCount}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">合作导师</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                    <p className="text-lg font-semibold">{company.reviewCount}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">评价数</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{company.description}</p>
                </div>

                {/* Website */}
                {company.website && (
                  <a
                    href={`https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    {company.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Write Review */}
                <Link href={`/review?company=${company.id}`} className="mt-4 block">
                  <Button className="w-full" size="lg">
                    写评价
                  </Button>
                </Link>
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
                {/* Left: Ring Chart */}
                <div className="flex shrink-0 justify-center sm:min-w-[160px]">
                  <div className="flex flex-col items-center">
                    <RingChart value={(company.score / 100) * 5} size={140} strokeWidth={10} showLabel />
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {company.reviewCount} 条评价
                    </p>
                  </div>
                </div>

                {/* Right: Score Bars */}
                <div className="flex-1 space-y-4">
                  {(["culture", "growth", "management"] as const).map((key) => (
                    <ScoreBar key={key} label={DIM_LABELS[key]} value={company.stats[key]} />
                  ))}
                  <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">综合评分</span>
                      <span className="font-semibold text-accent">{company.score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              评价 ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-5">
                  {/* Review Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.author}</span>
                        <span className="font-mono text-xs text-muted-foreground">{addr(review.authorAddress)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill={i < review.rating ? "#f59e0b" : "#e5e7eb"}>
                              <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.43L7 8.885 3.91 10.5l.59-3.43L2 4.635l3.455-.505L7 1z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
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

                  {/* Comment */}
                  <p className="mt-4 text-sm leading-relaxed">{review.comment}</p>

                  {/* Tags & Actions */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        有帮助
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        回复
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}