import { useState } from "react";
import { toast } from "sonner";
import PetDisplay from "@/components/PetDisplay";
import ProgressBar from "@/components/ProgressBar";
import StreakBadge from "@/components/StreakBadge";
import WordQuiz from "@/components/WordQuiz";
import AccessoryPanel from "@/components/AccessoryPanel";
import { usePetState } from "@/hooks/usePetState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const {
    pet, wallet, stage, loading,
    connectWallet, createPet, logStudy,
    feedPet, playWithPet, quizReward,
    equipAccessory, mintNFT,
  } = usePetState();

  const [language, setLanguage] = useState("");
  const [studyMinutes, setStudyMinutes] = useState("");

  const handleConnect = async () => {
    const addr = await connectWallet();
    if (addr) toast.success("Wallet connected!");
  };

  const handleCreate = async () => {
    if (!language.trim()) return toast.error("Please enter a language");
    toast.info("Creating pet... please wait");
    await createPet(language);
    toast.success("Pet created! 🦊");
    setLanguage("");
  };

  const handleLogStudy = async () => {
    const mins = parseInt(studyMinutes);
    if (!mins || mins <= 0) return toast.error("Enter valid minutes");
    if (mins > 120) return toast.error("Max 120 minutes per session");
    toast.info("Logging study... please wait");
    await logStudy(mins);
    setStudyMinutes("");
    toast.success("+" + mins * 10 + " XP earned!");
  };

  const handleFeed = () => {
    if (pet.hunger >= 95) return toast.info("Already full! 🍖");
    feedPet();
    toast.success("Yummy! 🍖 +20 hunger");
  };

  const handlePlay = () => {
    playWithPet();
    toast.success("So fun! 🎾 +15 happiness");
  };

  const handleMint = async () => {
    if (pet.minted) return toast.error("Already minted!");
    toast.info("Minting NFT... please wait");
    await mintNFT();
    toast.success("🎨 NFT Minted! Check your wallet.");
  };

  const XP_ADULT = 600;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            🦊 Lingu<span className="text-primary">Pet</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Learn a language. Raise your pet. Earn rewards. Mint your achievement.
          </p>
        </div>

        <div className="flex justify-center">
          {wallet ? (
            <span className="px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-semibold">
              ✅ {wallet}
            </span>
          ) : (
            <Button onClick={handleConnect} size="lg" className="font-bold" disabled={loading}>
              🔗 Connect Wallet
            </Button>
          )}
        </div>

        {wallet && !pet.created && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">🐣 Create Your Pet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="What language are you learning?"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                disabled={loading}
              />
              <Button onClick={handleCreate} className="w-full font-bold" disabled={loading}>
                {loading ? "Creating..." : "Create Pet 🦊"}
              </Button>
            </CardContent>
          </Card>
        )}

        {wallet && pet.created && (
          <>
            <StreakBadge
              streak={pet.streak}
              dailyProgress={pet.dailyProgress}
              dailyGoal={pet.dailyGoal}
            />

            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center gap-4">
                <PetDisplay
                  stage={stage}
                  equippedAccessory={pet.equippedAccessory}
                  happiness={pet.happiness}
                  hunger={pet.hunger}
                />
                <ProgressBar xp={pet.xp} />
                <AccessoryPanel
                  xp={pet.xp}
                  unlockedIds={pet.unlockedAccessories}
                  equippedId={pet.equippedAccessory}
                  onEquip={equipAccessory}
                />
              </div>

              <div className="space-y-4">
                <Tabs defaultValue="study" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="study">📖 Study</TabsTrigger>
                    <TabsTrigger value="interact">🎮 Play</TabsTrigger>
                    <TabsTrigger value="quiz">🧠 Quiz</TabsTrigger>
                  </TabsList>

                  <TabsContent value="study" className="space-y-4 mt-4">
                    <Card>
                      <CardContent className="pt-5 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Language</span>
                          <span className="font-bold">{pet.language}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Study</span>
                          <span className="font-bold">{pet.totalMinutes} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">XP</span>
                          <span className="font-bold text-primary">{pet.xp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stage</span>
                          <span className="font-bold">
                            {["🥚 Egg", "🦊 Baby", "🧣 Teenager", "🎓 Adult"][stage]}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">📖 Log Study Session</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Input
                          type="number"
                          placeholder="Minutes studied (max 120)"
                          value={studyMinutes}
                          onChange={(e) => setStudyMinutes(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleLogStudy()}
                          disabled={loading}
                        />
                        <Button
                          onClick={handleLogStudy}
                          variant="secondary"
                          className="w-full font-bold"
                          disabled={loading}
                        >
                          {loading ? "Logging..." : "Log Study ✏️"}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-5">
                        <Button
                          onClick={handleMint}
                          disabled={pet.minted || stage < 3 || loading}
                          className="w-full font-bold"
                          variant={pet.minted ? "outline" : "default"}
                        >
                          {pet.minted
                            ? "✅ NFT Minted!"
                            : stage < 3
                            ? "🔒 Reach Adult to Mint (" + pet.xp + "/" + XP_ADULT + " XP)"
                            : "🎨 Mint Pet NFT"}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="interact" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">🎮 Interact with Your Pet</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={handleFeed}
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-1 font-bold"
                          >
                            <span className="text-2xl">🍖</span>
                            <span>Feed</span>
                            <span className="text-[10px] text-muted-foreground font-normal">+20 hunger</span>
                          </Button>
                          <Button
                            onClick={handlePlay}
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-1 font-bold"
                          >
                            <span className="text-2xl">🎾</span>
                            <span>Play</span>
                            <span className="text-[10px] text-muted-foreground font-normal">+15 happiness</span>
                          </Button>
                        </div>
                        <div className="text-center text-xs text-muted-foreground pt-2">
                          <p>💡 Studying also boosts happiness!</p>
                          <p>⚠️ Hunger decreases over time — keep feeding!</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="quiz" className="mt-4">
                    <WordQuiz
                      language={pet.language}
                      onAnswer={(correct) => {
                        quizReward(correct);
                        if (correct) {
                          toast.success("Correct! 🎉 +25 XP");
                        } else {
                          toast.info("Keep trying! +5 XP");
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
