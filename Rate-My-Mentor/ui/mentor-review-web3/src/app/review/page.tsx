"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { keccak256, toBytes } from "viem";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { reviewContractAbi, reviewContractAddress } from "@/lib/contract";
import { uploadReview } from "@/lib/uploadReview";

// ─── Types ────────────────────────────────────────────────────────────────────

type SbtInfo = {
  tokenId: string;
  companyName: string;
  companyId: string;
};

type TargetType = "mentor" | "company";

type AIReviewResult = {
  overallScore: number;
  dimensionScores: Array<{
    dimension: string;
    score: number;
    comment: string;
  }>;
  summary: string;
  tags: string[];
  isQualified: boolean;
  unqualifiedReason: string;
};

type DialogState = null | "confirm_mint" | "ai_extract_failed";

type Phase = "input" | "extracting" | "review_ai_result" | "submitting" | "submitted";

const DIM_LABELS = ["成长支持", "预期清晰度", "沟通质量", "工作强度", "尊重与包容"] as const;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3001/api/v1";

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const router = useRouter();
  const { address, chainId, status } = useAccount();

  const wrongNetwork = chainId != null && chainId !== avalancheFuji.id;
  const isConnected = status === "connected" && !!address;

  // SBT from localStorage
  const [sbt, setSbt] = useState<SbtInfo | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("rmm_sbt");
      if (raw) setSbt(JSON.parse(raw) as SbtInfo);
    } catch {}
  }, []);

  // Form state
  const [phase, setPhase] = useState<Phase>("input");
  const [targetType, setTargetType] = useState<TargetType>("mentor");
  const [targetName, setTargetName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [dialog, setDialog] = useState<DialogState>(null);

  // AI 結果
  const [aiResult, setAiResult] = useState<AIReviewResult | null>(null);
  const [dimScores, setDimScores] = useState([0, 0, 0, 0, 0]);
  const [overallScore, setOverallScore] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);

  // 提交狀態
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const {
    writeContract,
    data: txHashFromWrite,
    error: writeError,
    isPending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHashFromWrite });

  useEffect(() => {
    if (txHashFromWrite) setTxHash(txHashFromWrite);
  }, [txHashFromWrite]);

  useEffect(() => {
    if (isConfirmed) setPhase("submitted");
  }, [isConfirmed]);

  // Derive bytes32 targetId from name
  const targetId = useMemo(
    () => keccak256(toBytes(targetName.trim() || "unknown")),
    [targetName]
  );

  // ─── AI Extract ───────────────────────────────────────────────────────────

  async function handleExtractAI() {
    if (!reviewText.trim() || reviewText.trim().length < 20) {
      setAiError("評價內容至少需要 20 字");
      return;
    }

    setPhase("extracting");
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch(`${API_BASE}/ai/extract-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent: reviewText.trim() }),
      });

      const json = await res.json();

      if (!json.success) {
        setAiError(json.message ?? "AI 提取失敗");
        setPhase("input");
        setDialog("ai_extract_failed");
        return;
      }

      const result = json.data as AIReviewResult;

      // 檢查內容是否合格
      if (!result.isQualified) {
        setAiError(`內容不合格：${result.unqualifiedReason}`);
        setPhase("input");
        setDialog("ai_extract_failed");
        return;
      }

      setAiResult(result);
      // 初始化評分為 AI 建議
      setOverallScore(Math.round(result.overallScore));
      setDimScores(result.dimensionScores.map((d) => d.score));
      setPhase("review_ai_result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "網絡錯誤";
      setAiError(msg);
      setPhase("input");
      setDialog("ai_extract_failed");
    }
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!sbt) {
      setDialog("confirm_mint");
      return;
    }

    setPhase("submitting");
    setUploadError(null);

    try {
      const { cidBytes32 } = await uploadReview(reviewText.trim());

      writeContract({
        address: reviewContractAddress,
        abi: reviewContractAbi,
        functionName: "submitReview",
        args: [
          BigInt(sbt.tokenId),
          targetId,
          targetType,
          overallScore,
          dimScores as unknown as [number, number, number, number, number],
          cidBytes32,
        ],
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "上傳失敗");
      setPhase("review_ai_result");
    }
  }

  // ─── Guard: not connected ─────────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔗</div>
        <h1 className="text-2xl font-semibold">請先連接錢包</h1>
        <p className="mt-2 text-sm text-muted-foreground">連接錢包後才能提交評價。</p>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-semibold">請切換到 Fuji 測試網</h1>
        <p className="mt-2 text-sm text-muted-foreground">當前鏈 ID：{chainId}，需要 Fuji (43113)。</p>
      </div>
    );
  }

  // ─── Success ─────────────────────────────────────────────────────────────

  if (phase === "submitted") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20">
        <Card className="p-8 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-semibold">評價已成功上鏈！</h2>
          <p className="text-sm text-muted-foreground">
            你對 <b>{targetName}</b> 的評價已永久記錄在 Avalanche Fuji 鏈上。
          </p>
          {txHash && (
            <a
              href={`https://testnet.snowtrace.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 underline block"
            >
              在 Snowtrace 查看交易 ↗
            </a>
          )}
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/mentors")}>
              查看導師列表
            </Button>
            <Button className="flex-1" onClick={() => {
              setPhase("input");
              setTargetName("");
              setReviewText("");
              setAiResult(null);
              setDimScores([0, 0, 0, 0, 0]);
              setOverallScore(0);
              setTxHash(null);
            }}>
              再寫一條
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Phase: Input（輸入自由文本）───────────────────────────────────────

  if (phase === "input") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">寫評價</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            用自由文本描述你的實習體驗，AI 將幫助你結構化評分。
          </p>
        </div>

        {/* SBT Status Badge */}
        {sbt && (
          <Card className="p-3 bg-green-50 border-green-200">
            <p className="text-xs text-green-700">
              ✓ 已持有實習 SBT 憑證（{sbt.companyName}）
            </p>
          </Card>
        )}
        {!sbt && (
          <Card className="p-3 bg-blue-50 border-blue-200">
            <p className="text-xs text-blue-700">
              💡 提示：首次提交時可自動鑄造 SBT，或<Button variant="link" size="sm" className="h-auto p-0 text-blue-700 underline" onClick={() => router.push("/auth")}>先去驗證身份</Button>
            </p>
          </Card>
        )}

        {/* Target */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-medium">評價對象</h2>

          <div className="flex gap-2">
            <button
              onClick={() => setTargetType("mentor")}
              className={`flex-1 py-2 rounded-lg text-sm border transition-colors
                ${targetType === "mentor" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              導師
            </button>
            <button
              onClick={() => setTargetType("company")}
              className={`flex-1 py-2 rounded-lg text-sm border transition-colors
                ${targetType === "company" ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
            >
              公司
            </button>
          </div>

          <Input
            placeholder={targetType === "mentor" ? "輸入導師姓名（如：張三）" : "輸入公司名稱（如：字節跳動）"}
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
          />
        </Card>

        {/* Free text input */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-medium">你的評價</h2>
          <Textarea
            placeholder="例如：我在這個組裡成長的很快，但是帶教經常臨場改需求，反饋不及時，而且對女生明顯更不耐煩。（至少 20 字）"
            rows={6}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">{reviewText.length} 字</p>
        </Card>

        {aiError && (
          <p className="text-sm text-red-500">{aiError}</p>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleExtractAI}
          disabled={!targetName.trim() || reviewText.trim().length < 20 || phase === "extracting"}
        >
          {phase === "extracting" ? (
            <span className="flex items-center gap-2"><Spinner /> AI 正在分析…</span>
          ) : (
            "讓 AI 幫我評分"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          AI 會分析你的文字內容，生成 5 個維度的評分建議。
        </p>
      </div>
    );
  }

  // ─── Phase: Review AI Result（檢視 AI 建議 + 調整）──────────────────────

  if (phase === "review_ai_result" && aiResult) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">審視評分</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI 基於你的描述生成了評分建議。你可以接受或調整。
          </p>
        </div>

        {/* Original review text */}
        <Card className="p-5 space-y-2">
          <h3 className="text-sm font-medium">你的原始評價</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reviewText}</p>
        </Card>

        {/* AI summary */}
        <Card className="p-5 space-y-3 bg-blue-50 border-blue-200">
          <h3 className="text-sm font-medium text-blue-900">📊 AI 分析總結</h3>
          <p className="text-xs text-blue-800">{aiResult.summary}</p>
          {aiResult.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {aiResult.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-200 text-blue-900 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Overall score */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">綜合評分</h2>
            <span className="text-xs text-muted-foreground">AI 建議：{Math.round(aiResult.overallScore)}</span>
          </div>
          <div className="flex items-center gap-2">
            <StarPicker value={overallScore} onChange={setOverallScore} />
            <span className="text-sm font-semibold w-8">{overallScore}</span>
          </div>
        </Card>

        {/* Dimension scores */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-medium">維度評分（可調整）</h2>
          <div className="space-y-4">
            {DIM_LABELS.map((label, i) => {
              const aiDim = aiResult.dimensionScores[i];
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">AI：{aiDim.score}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarPicker value={dimScores[i]} onChange={(v) => {
                      const next = [...dimScores];
                      next[i] = v;
                      setDimScores(next);
                    }} />
                    <span className="text-sm font-semibold w-8">{dimScores[i]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">{aiDim.comment}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Error messages */}
        {uploadError && (
          <p className="text-sm text-red-500">{uploadError}</p>
        )}
        {writeError && (
          <p className="text-sm text-red-500">{writeError.message}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setPhase("input");
              setAiResult(null);
              setAiError(null);
            }}
          >
            ← 重新寫評價
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={isPending || isConfirming || phase === "submitting"}
          >
            {isPending || isConfirming ? (
              <span className="flex items-center gap-2"><Spinner /> 提交中…</span>
            ) : (
              "確認並提交"
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          評價內容經 AES 加密後存儲在 IPFS，鏈上僅記錄哈希，無法被刪除或篡改。
        </p>
      </div>
    );
  }

  // ─── Phase: Submitting ─────────────────────────────────────────────────

  if (phase === "submitting") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-20 text-center space-y-4">
        <Spinner />
        <h2 className="text-lg font-semibold">提交中…</h2>
        <p className="text-sm text-muted-foreground">上傳評價至 IPFS，然後上鏈…</p>
      </div>
    );
  }

  // ─── Dialogs ──────────────────────────────────────────────────────────────

  if (dialog === "confirm_mint") {
    return (
      <Dialog>
        <div className="p-4 space-y-3">
          <h2 className="font-semibold">首次提交需要 SBT 憑證</h2>
          <p className="text-sm text-muted-foreground">
            為了確保評價的真實性，首次評分需要綁定你的實習身份。現在就去驗證並鑄造 SBT 嗎？
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => {
              setDialog(null);
              setPhase("review_ai_result");
            }}>
              取消
            </Button>
            <Button className="flex-1" onClick={() => {
              setDialog(null);
              router.push("/auth");
            }}>
              去驗證身份
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

  if (dialog === "ai_extract_failed") {
    return (
      <Dialog>
        <div className="p-4 space-y-3">
          <h2 className="font-semibold">AI 分析失敗</h2>
          <p className="text-sm text-muted-foreground">{aiError}</p>
          <p className="text-xs text-muted-foreground">
            請檢查評價內容是否完整、真實且與評價對象相關。
          </p>
          <Button className="w-full" onClick={() => {
            setDialog(null);
            setPhase("input");
            setAiError(null);
          }}>
            返回編輯
          </Button>
        </div>
      </Dialog>
    );
  }

  return null;
}

// ─── StarPicker ──────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl transition-transform hover:scale-110
            ${star <= (hovered || value) ? "text-yellow-400" : "text-muted"}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

function Dialog({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        {children}
      </Card>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}
