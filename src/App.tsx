import { useEffect, useState } from "react";
import "./App.css";
import type { MissionId, Page, PackResult, PityState, Player, Squad } from "./types";
import { initialPlayers } from "./data/players";
import { createRandomPlayer, INITIAL_PITY, rollWithPity, SELL_VALUES } from "./data/rarity";
import { getMission, getLoginReward } from "./data/missions";
import { createAutoSquad, createEmptySquad } from "./utils/squad";
import { generateId } from "./utils/id";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDailyState } from "./hooks/useDailyState";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import QuizPage from "./components/QuizPage";
import TeamPage from "./components/TeamPage";
import PacksPage from "./components/PacksPage";
import DailyMissionsPage from "./components/DailyMissionsPage";
import SettingsPage from "./components/SettingsPage";

function App() {
  const [page, setPage] = useState<Page>("home");

  const [coins, setCoins] = useLocalStorage<number>("qtg:coins", 200);
  const [players, setPlayers] = useLocalStorage<Player[]>("qtg:players", initialPlayers);
  const [packsOpened, setPacksOpened] = useLocalStorage<number>("qtg:packsOpened", 0);
  const [squad, setSquad] = useLocalStorage<Squad>("qtg:squad", createEmptySquad("4-3-3"));
  const [squadInitialized, setSquadInitialized] = useLocalStorage<boolean>("qtg:squadInit", false);
  const [pity, setPity] = useLocalStorage<PityState>("qtg:pity", INITIAL_PITY);

  const { daily, update: updateDaily, trackProgress } = useDailyState();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goHome() {
    setPage("home");
  }

  function handleOpenPack(): PackResult {
    if (coins < 100) {
      return { type: "error", message: "Not enough coins! Play the quiz to earn more." };
    }

    const { rarity, newPity, pityTriggered } = rollWithPity(pity);
    const newPlayer = createRandomPlayer(rarity);
    const duplicate = players.find((p) => p.name === newPlayer.name);

    setCoins((c) => c - 100);
    setPacksOpened((n) => n + 1);
    setPity(newPity);

    if (duplicate) {
      const sellValue = SELL_VALUES[newPlayer.rarity];
      setCoins((c) => c + sellValue);
      return {
        type: "duplicate",
        player: newPlayer,
        coins: sellValue,
        pityTriggered: pityTriggered ?? undefined,
      };
    }

    setPlayers((p) => [...p, newPlayer]);
    return {
      type: "new",
      player: newPlayer,
      pityTriggered: pityTriggered ?? undefined,
    };
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

  // ── Daily tracking ────────────────────────────────────
  function trackCorrectAnswer() {
    trackProgress("correct-answers", 1);
  }

  function trackQuizComplete(score: number) {
    trackProgress("play-quiz", 1);
    if (score >= 8) trackProgress("high-score", 1);
  }

  function trackPackOpened() {
    trackProgress("open-pack", 1);
    trackProgress("open-packs-3", 1);
  }

  function claimMission(id: MissionId) {
    const mission = getMission(id);
    if (!mission) return;
    if (daily.claimed[id]) return;
    if (daily.progress[id] < mission.goal) return;

    setCoins((c) => c + mission.reward);
    updateDaily((prev) => ({
      ...prev,
      claimed: { ...prev.claimed, [id]: true },
    }));
  }

  function claimLogin() {
    if (daily.loginClaimed) return;
    const reward = getLoginReward(daily.streak);
    setCoins((c) => c + reward);
    updateDaily((prev) => ({ ...prev, loginClaimed: true }));
  }

  function resetProgress() {
    setCoins(200);
    setPlayers(initialPlayers);
    setPacksOpened(0);
    setSquad(createAutoSquad("4-3-3", initialPlayers));
    setSquadInitialized(true);
    setPity(INITIAL_PITY);
    setPage("home");
    try {
      localStorage.removeItem("qtg:quizSession");
      localStorage.removeItem("qtg:daily");
    } catch {
      // ignore
    }
  }

  return (
    <div className="app">
      <Header coins={coins} onGoHome={goHome} />

      <main>
        {page === "home" && (
          <HomePage
            coins={coins}
            players={players}
            squad={squad}
            daily={daily}
            onStartQuiz={() => setPage("quiz")}
            onNavigate={setPage}
          />
        )}

        {page === "quiz" && (
          <QuizPage
            onBack={goHome}
            onAwardCoins={(amount) => setCoins((c) => c + amount)}
            onCorrectAnswer={trackCorrectAnswer}
            onQuizComplete={trackQuizComplete}
          />
        )}

        {page === "team" && (
          <TeamPage
            players={players}
            squad={squad}
            onSquadChange={setSquad}
            onSellPlayer={handleSellPlayer}
            onBack={goHome}
          />
        )}

        {page === "packs" && (
          <PacksPage
            coins={coins}
            packsOpened={packsOpened}
            pity={pity}
            onBack={goHome}
            onOpenPack={handleOpenPack}
            onPackOpened={trackPackOpened}
          />
        )}

        {page === "daily" && (
          <DailyMissionsPage
            daily={daily}
            onClaimMission={claimMission}
            onClaimLogin={claimLogin}
            onBack={goHome}
          />
        )}

        {page === "settings" && (
          <SettingsPage onBack={goHome} onReset={resetProgress} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;