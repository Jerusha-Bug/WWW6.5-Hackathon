import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { getStage, getUnlockedAccessories } from "@/lib/gameData";

const CONTRACT_ADDRESS = "0x17af32d1E54fF01D55bc57B3af8BDBddc030D2E1";
const CONTRACT_ABI = [
  "function createPet(string language) external",
  "function logStudy(uint256 studyMinutes) external",
  "function mintPetNFT() external returns (uint256)",
  "function getPet(address owner) external view returns (uint256 xp, uint8 stage, string memory language, uint256 totalMinutes, bool minted)"
];

export interface PetState {
  created: boolean;
  language: string;
  xp: number;
  totalMinutes: number;
  hunger: number;
  happiness: number;
  streak: number;
  lastStudyDate: string | null;
  minted: boolean;
  equippedAccessory: string | null;
  unlockedAccessories: string[];
  dailyGoal: number;
  dailyProgress: number;
}

const INITIAL_STATE: PetState = {
  created: false,
  language: "",
  xp: 0,
  totalMinutes: 0,
  hunger: 80,
  happiness: 80,
  streak: 0,
  lastStudyDate: null,
  minted: false,
  equippedAccessory: null,
  unlockedAccessories: [],
  dailyGoal: 15,
  dailyProgress: 0,
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function usePetState() {
  const [pet, setPet] = useState<PetState>(INITIAL_STATE);
  const [wallet, setWallet] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);

  // ── 连接真实钱包 ──────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return "";
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !== 43113n) {
      alert("Please switch to Avalanche Fuji Testnet in MetaMask");
      return "";
    }
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setWallet(addr.slice(0, 6) + "..." + addr.slice(-4));
    setContract(c);

    // 自动读取链上宠物数据
    try {
      const onchain = await c.getPet(addr);
      const onchainXp = Number(onchain[0]);
      if (onchainXp > 0 || onchain[4]) {
        setPet((prev) => ({
          ...prev,
          created: true,
          xp: onchainXp,
          language: onchain[2],
          totalMinutes: Number(onchain[3]),
          minted: onchain[4],
          unlockedAccessories: getUnlockedAccessories(onchainXp).map((a) => a.id),
        }));
      }
    } catch {
      // 还没有宠物，正常
    }
    return addr;
  }, []);

  // ── 创建宠物（写链上）────────────────────────────
  const createPet = useCallback(async (language: string) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.createPet(language);
      await tx.wait();
      setPet({
        ...INITIAL_STATE,
        created: true,
        language,
      });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // ── 记录学习（写链上 + 本地更新喂食/快乐度）───────
  const logStudy = useCallback(async (minutes: number) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.logStudy(minutes);
      await tx.wait();

      // 从链上读最新 XP
      const signer = contract.runner as ethers.Signer;
      const addr = await signer.getAddress();
      const onchain = await contract.getPet(addr);
      const newXp = Number(onchain[0]);

      setPet((prev) => {
        const today = getToday();
        const isNewDay = prev.lastStudyDate !== today;
        const wasYesterday =
          prev.lastStudyDate ===
          new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        let newStreak = prev.streak;
        if (isNewDay) {
          newStreak = wasYesterday || prev.streak === 0 ? prev.streak + 1 : 1;
        }
        const prevUnlocked = prev.unlockedAccessories;
        const allUnlocked = getUnlockedAccessories(newXp).map((a) => a.id);
        const newUnlocked = allUnlocked.filter((id) => !prevUnlocked.includes(id));
        return {
          ...prev,
          xp: newXp,
          totalMinutes: Number(onchain[3]),
          happiness: Math.min(100, prev.happiness + 5),
          hunger: Math.max(0, prev.hunger - 3),
          streak: newStreak,
          lastStudyDate: today,
          dailyProgress: isNewDay ? minutes : prev.dailyProgress + minutes,
          unlockedAccessories: [...new Set([...prevUnlocked, ...newUnlocked])],
        };
      });
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // ── 喂食（纯本地，不上链）────────────────────────
  const feedPet = useCallback(() => {
    setPet((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 20),
      happiness: Math.min(100, prev.happiness + 5),
    }));
  }, []);

  // ── 玩耍（纯本地）────────────────────────────────
  const playWithPet = useCallback(() => {
    setPet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      hunger: Math.max(0, prev.hunger - 5),
    }));
  }, []);

  // ── 答题奖励（纯本地）────────────────────────────
  const quizReward = useCallback((correct: boolean) => {
    setPet((prev) => ({
      ...prev,
      xp: prev.xp + (correct ? 25 : 5),
      happiness: Math.min(100, prev.happiness + (correct ? 10 : 2)),
      unlockedAccessories: [
        ...new Set([
          ...prev.unlockedAccessories,
          ...getUnlockedAccessories(prev.xp + (correct ? 25 : 5)).map((a) => a.id),
        ]),
      ],
    }));
  }, []);

  // ── 装备配件（纯本地）────────────────────────────
  const equipAccessory = useCallback((id: string | null) => {
    setPet((prev) => ({ ...prev, equippedAccessory: id }));
  }, []);

  // ── 铸造 NFT（写链上）────────────────────────────
  const mintNFT = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.mintPetNFT();
      await tx.wait();
      setPet((prev) => ({ ...prev, minted: true }));
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const stage = getStage(pet.xp);

  return {
    pet,
    wallet,
    stage,
    loading,
    connectWallet,
    createPet,
    logStudy,
    feedPet,
    playWithPet,
    quizReward,
    equipAccessory,
    mintNFT,
  };
}
