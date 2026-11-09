import { useEffect, useMemo, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/animations.css";

import type {
  AchievementId,
  MissionId,
  Page,
  PackResult,
  PackType,
  PityState,
  Player,
  Squad,
  Stats,
  SeasonState,
  Rarity,
} from "./types";
import { INITIAL_STATS } from "./types";
import { initialPlayers } from "./data/players";
import { 
  INITIAL_PITY, 
  SELL_VALUES, 
  PITY_GOLD_THRESHOLD, 
  PITY_ICON_THRESHOLD 
} from "./data/rarity";
import { PACKS, rollRarityForPack } from "./data/packs";
import { getMission, getLoginReward } from "./data/missions";
import { ACHIEVEMENTS, type AchievementContext } from "./data/achievements";
import { SEASON_TIERS } from "./data/season";
import { createAutoSquad, createEmptySquad } from "./utils/squad";
import { generateId } from "./utils/id";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDailyState } from "./hooks/useDailyState";
import { fetchAllPlayers } from "./data/api";

import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import QuizPage from "./components/QuizPage";
import TeamPage from "./components/TeamPage";
import PacksPage from "./components/PacksPage";
import DailyMissionsPage from "./components/DailyMissionsPage";
import AchievementsPage from "./components/AchievementsPage";
import MatchPage from "./components/MatchPage";
import DuelPage from "./components/DuelPage";
import SeasonPage from "./components/SeasonPage";
import SurvivalPage from "./components/SurvivalPage";
import DraftPage from "./components/DraftPage";
import SettingsPage from "./components/SettingsPage";
import AuthPage from "./components/AuthPage";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      if (nextSession) migrateLegacyGameData(`qtg:${nextSession.user.id}:`);
      setSession(nextSession);
      setAuthLoading(false);
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("Could not restore authentication session:", error);
        if (data.session) migrateLegacyGameData(`qtg:${data.session.user.id}:`);
        setSession(data.session);
        setAuthLoading(false);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Could not restore authentication session:", error);
        setAuthLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (authLoading) {
    return <main className="auth-screen"><div className="auth-loading">⚽ Loading Quiz to Glory...</div></main>;
  }

  if (!session) return <AuthPage />;

  return <GameApp key={session.user.id} user={session.user} onSignOut={() => supabase.auth.signOut()} />;
}

type GameAppProps = {
  user: User;
  onSignOut: () => Promise<unknown>;
};

function migrateLegacyGameData(storagePrefix: string) {
  const migrationMarker = "qtg:legacy-data-migrated";
  try {
    if (localStorage.getItem(migrationMarker)) return;

    const legacyKeys = [
      "coins", "players", "packsOpened", "squad", "squadInit", "pity",
      "stats", "achievementsClaimed", "season", "daily", "quizSession",
    ];

    for (const key of legacyKeys) {
      const oldKey = `qtg:${key}`;
      const accountKey = `${storagePrefix}${key}`;
      const oldValue = localStorage.getItem(oldKey);
      if (oldValue !== null && localStorage.getItem(accountKey) === null) {
        localStorage.setItem(accountKey, oldValue);
      }
      if (oldValue !== null) localStorage.removeItem(oldKey);
    }

    localStorage.setItem(migrationMarker, "true");
  } catch (error) {
    console.warn("Could not migrate previous local game progress:", error);
  }
}

function GameApp({ user, onSignOut }: GameAppProps) {
  const storagePrefix = `qtg:${user.id}:`;
  const [page, setPage] = useState<Page>("home");

  const [dbPlayers, setDbPlayers] = useState<Player[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  const [coins, setCoins] = useLocalStorage<number>(`${storagePrefix}coins`, 200);
  const [players, setPlayers] = useLocalStorage<Player[]>(`${storagePrefix}players`, initialPlayers);
  const [packsOpened, setPacksOpened] = useLocalStorage<number>(`${storagePrefix}packsOpened`, 0);
  const [squad, setSquad] = useLocalStorage<Squad>(`${storagePrefix}squad`, createEmptySquad("4-3-3"));
  const [squadInitialized, setSquadInitialized] = useLocalStorage<boolean>(`${storagePrefix}squadInit`, false);
  const [pity, setPity] = useLocalStorage<PityState>(`${storagePrefix}pity`, INITIAL_PITY);
  const [stats, setStats] = useLocalStorage<Stats>(`${storagePrefix}stats`, INITIAL_STATS);
  const [claimedAchievements, setClaimedAchievements] = useLocalStorage<Record<string, boolean>>(`${storagePrefix}achievementsClaimed`, {});
  const [season, setSeason] = useLocalStorage<SeasonState>(`${storagePrefix}season`, { xp: 0, claimedLevels: [] });

  const { daily, update: updateDaily, trackProgress } = useDailyState(`${storagePrefix}daily`);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchAllPlayers();
        setDbPlayers(data);
      } catch (error) {
        console.error("Error loading players:", error);
      } finally {
        setIsLoadingDb(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (squadInitialized) return;
    let workingPlayers = players;
    if (players.some((p) => !p.id)) {
      workingPlayers = players.map((p) => (p.id ? p : { ...p, id: generateId() }));
      setPlayers(workingPlayers);
    }
    if (workingPlayers.length > 0) {
      setSquad(createAutoSquad("4-3-3", workingPlayers));
    }
    setSquadInitialized(true);
  }, []);

  useEffect(() => {
    if (daily.streak > stats.highestStreak) {
      setStats((prev) => ({ ...prev, highestStreak: daily.streak }));
    }
  }, [daily.streak]);

  const achievementCtx: AchievementContext = useMemo(
    () => ({ stats, players, daily, packsOpened, squad }),
    [stats, players, daily, packsOpened, squad]
  );

  const achievementList = useMemo(
    () =>
      ACHIEVEMENTS.map((a) => {
        const progress = Math.min(a.getProgress(achievementCtx), a.goal);
        const isComplete = progress >= a.goal;
        const isClaimed = !!claimedAchievements[a.id];
        return { achievement: a, progress, isComplete, isClaimed, canClaim: isComplete && !isClaimed };
      }),
    [achievementCtx, claimedAchievements]
  );

  const claimableCount = achievementList.filter((x) => x.canClaim).length;
  const unlockedCount = achievementList.filter((x) => x.isComplete).length;

  function goHome() { setPage("home"); }

  function addSeasonXp(amount: number) {
    setSeason((prev) => ({ ...prev, xp: prev.xp + amount }));
  }

  function claimSeasonReward(level: number) {
    const tier = SEASON_TIERS.find((t) => t.level === level);
    if (!tier) return;
    
    const reward = tier.reward;

    if (reward.type === "coins") {
      setCoins((c) => c + reward.amount);
    } else if (reward.type === "pack") {
      const pack = PACKS[reward.packType];
      setCoins((c) => c + pack.cost); 
      alert(`Claimed ${reward.packType} pack! Added ${pack.cost} coins to your balance instead of opening.`);
    } else if (reward.type === "player") {
      let pool = dbPlayers.filter((p) => p.rarity === reward.rarity);
      if (pool.length === 0) pool = dbPlayers;
      
      if (pool.length > 0) {
         const dbPlayer = pool[Math.floor(Math.random() * pool.length)];
         const newPlayer = { ...dbPlayer, id: generateId() };
         
         if (!players.find(p => p.name === newPlayer.name)) {
            setPlayers(p => [...p, newPlayer]);
            alert(`Unlocked new ${reward.rarity} player: ${newPlayer.name}!`);
         } else {
            setCoins(c => c + SELL_VALUES[newPlayer.rarity]);
            alert(`Got duplicate ${newPlayer.name}, auto-sold for coins!`);
         }
      }
    }

    setSeason((prev) => ({ ...prev, claimedLevels: [...prev.claimedLevels, level] }));
  }

  function handleOpenPack(packType: PackType): PackResult {
    const pack = PACKS[packType];

    if (coins < pack.cost) {
      return { type: "error", message: `Not enough coins! You need ${pack.cost} coins.` };
    }
    if (isLoadingDb) {
      return { type: "error", message: "Loading database, please wait..." };
    }
    if (dbPlayers.length === 0) {
      return { type: "error", message: "No players in database!" };
    }

    let rarity: Rarity;
    let newPity = { ...pity };
    let pityTriggered: "gold" | "icon" | null = null;

    if (pity.packsSinceIcon >= PITY_ICON_THRESHOLD - 1) {
      rarity = "icon";
      pityTriggered = "icon";
    } else if (pity.packsSinceGold >= PITY_GOLD_THRESHOLD - 1) {
      rarity = "gold";
      pityTriggered = "gold";
    } else {
      rarity = rollRarityForPack(pack.odds);
    }

    if (rarity === "icon") {
      newPity = { packsSinceGold: 0, packsSinceIcon: 0 };
    } else if (rarity === "gold") {
      newPity = { packsSinceGold: 0, packsSinceIcon: newPity.packsSinceIcon + 1 };
    } else {
      newPity = { packsSinceGold: newPity.packsSinceGold + 1, packsSinceIcon: newPity.packsSinceIcon + 1 };
    }

    let pool = dbPlayers.filter((p) => p.rarity === rarity);
    
    if (pool.length === 0 && rarity === "icon") {
      pool = dbPlayers.filter((p) => p.rarity === "gold");
    }
    if (pool.length === 0 && rarity === "gold") {
      pool = dbPlayers.filter((p) => p.rarity === "silver");
    }
    if (pool.length === 0) {
      pool = dbPlayers;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const dbPlayer = pool[randomIndex];

    const newPlayer: Player = { ...dbPlayer, id: generateId() };
    const duplicate = players.find((p) => p.name === newPlayer.name);

    setCoins((c) => c - pack.cost);
    setPacksOpened((n) => n + 1);
    setPity(newPity);

    if (duplicate) {
      const sellValue = SELL_VALUES[newPlayer.rarity];
      setCoins((c) => c + sellValue);
      return { type: "duplicate", player: newPlayer, coins: sellValue, pityTriggered: pityTriggered ?? undefined };
    }

    setPlayers((p) => [...p, newPlayer]);
    return { type: "new", player: newPlayer, pityTriggered: pityTriggered ?? undefined };
  }

  function handleSellPlayer(playerId: string): number {
    const player = players.find((p) => p.id === playerId);
    if (!player) return 0;
    const sellValue = SELL_VALUES[player.rarity];
    setCoins((c) => c + sellValue);
    setPlayers((p) => p.filter((x) => x.id !== playerId));
    setSquad((prev) => {
      const assignments = { ...prev.assignments };
      for (const sid of Object.keys(assignments)) {
        if (assignments[sid] === playerId) assignments[sid] = null;
      }
      return { ...prev, assignments };
    });
    return sellValue;
  }

  function trackCorrectAnswer() {
    trackProgress("correct-answers", 1);
    setStats((prev) => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
  }

  function trackQuizComplete(score: number) {
    trackProgress("play-quiz", 1);
    if (score >= 8) trackProgress("high-score", 1);
    setStats((prev) => ({ ...prev, quizzesCompleted: prev.quizzesCompleted + 1, bestQuizScore: Math.max(prev.bestQuizScore, score) }));
    addSeasonXp(score * 20); 
  }

  function trackPackOpened() {
    trackProgress("open-pack", 1);
    trackProgress("open-packs-3", 1);
    addSeasonXp(50); 
  }

  function claimMission(id: MissionId) {
    const mission = getMission(id);
    if (!mission || daily.claimed[id] || daily.progress[id] < mission.goal) return;
    setCoins((c) => c + mission.reward);
    updateDaily((prev) => ({ ...prev, claimed: { ...prev.claimed, [id]: true } }));
  }

  function claimLogin() {
    if (daily.loginClaimed) return;
    const reward = getLoginReward(daily.streak);
    setCoins((c) => c + reward);
    updateDaily((prev) => ({ ...prev, loginClaimed: true }));
  }

  function claimAchievement(id: AchievementId) {
    const found = achievementList.find((x) => x.achievement.id === id && x.canClaim);
    if (!found) return;
    setCoins((c) => c + found.achievement.reward);
    setClaimedAchievements((prev) => ({ ...prev, [id]: true }));
  }

  function claimAllAchievements(): number {
    const claimable = achievementList.filter((x) => x.canClaim);
    if (claimable.length === 0) return 0;
    const total = claimable.reduce((sum, x) => sum + x.achievement.reward, 0);
    setCoins((c) => c + total);
    setClaimedAchievements((prev) => {
      const next = { ...prev };
      claimable.forEach((x) => { next[x.achievement.id] = true; });
      return next;
    });
    return total;
  }

  function resetProgress() {
    setCoins(200);
    setPlayers(initialPlayers);
    setPacksOpened(0);
    setSquad(createAutoSquad("4-3-3", initialPlayers));
    setSquadInitialized(true);
    setPity(INITIAL_PITY);
    setStats(INITIAL_STATS);
    setClaimedAchievements({});
    setSeason({ xp: 0, claimedLevels: [] });
    setPage("home");
    try {
      localStorage.removeItem(`${storagePrefix}quizSession`);
      localStorage.removeItem(`${storagePrefix}daily`);
    } catch {}
  }

  return (
    <div className="app">
      <Header coins={coins} displayName={String(user.user_metadata?.display_name || "Player")} email={user.email || ""} onGoHome={goHome} onSignOut={() => { void onSignOut(); }} />
      <main>
        {/* التعديل هنا: استخدمنا AnimatePresence و motion عشان نقلب بين الصفحات */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {page === "home" && (
              <HomePage
                coins={coins}
                players={players}
                squad={squad}
                daily={daily}
                achievementSummary={{ claimable: claimableCount, unlocked: unlockedCount, total: ACHIEVEMENTS.length }}
                onStartQuiz={() => setPage("quiz")}
                onNavigate={setPage}
              />
            )}

            {page === "quiz" && <QuizPage storageKey={`${storagePrefix}quizSession`} onBack={goHome} onAwardCoins={(amount) => setCoins((c) => c + amount)} onCorrectAnswer={trackCorrectAnswer} onQuizComplete={trackQuizComplete} />}
            {page === "team" && <TeamPage players={players} squad={squad} onSquadChange={setSquad} onSellPlayer={handleSellPlayer} onBack={goHome} />}
            {page === "packs" && <PacksPage coins={coins} packsOpened={packsOpened} pity={pity} onBack={goHome} onOpenPack={handleOpenPack} onPackOpened={trackPackOpened} />}
            {page === "match" && <MatchPage players={players} squad={squad} onAwardCoins={(amount) => setCoins((c) => c + amount)} onBack={goHome} />}
            {page === "duel" && <DuelPage onAwardCoins={(amount) => setCoins((c) => c + amount)} onBack={goHome} />}
            {page === "season" && <SeasonPage season={season} onClaim={claimSeasonReward} onBack={goHome} />}
            {page === "survival" && <SurvivalPage onBack={goHome} onAwardCoins={(amount) => setCoins((c) => c + amount)} />}
            {page === "draft" && <DraftPage dbPlayers={dbPlayers} onAwardCoins={(amount) => setCoins((c) => c + amount)} onBack={goHome} />}
            {page === "daily" && <DailyMissionsPage daily={daily} onClaimMission={claimMission} onClaimLogin={claimLogin} onBack={goHome} />}
            {page === "achievements" && <AchievementsPage achievements={achievementList} claimableCount={claimableCount} unlockedCount={unlockedCount} onClaimAchievement={claimAchievement} onClaimAll={claimAllAchievements} onBack={goHome} />}
            {page === "settings" && (
              <SettingsPage
                user={user}
                onBack={goHome}
                onReset={resetProgress}
                onUpdateProfile={async (displayName) => {
                  const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
                  if (error) throw error;
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;