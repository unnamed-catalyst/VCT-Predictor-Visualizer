import React, { useEffect, useMemo, useRef, useState } from "react";
import TeamTile from "./components/TeamTile";
import MatchupSlot from "./components/MatchupSlot";
import { API_BASE, REGIONS, TEAMS, regionOf } from "./teams";
import "./App.css";

const REQUEST_TIMEOUT_MS = 90_000;

function useApiStatus() {
  // Render's free tier sleeps after 15 min idle; ping on load so it is warm by the time a user predicts.
  const [status, setStatus] = useState("waking");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    fetch(`${API_BASE}/docs`, { mode: "no-cors", signal: controller.signal })
      .then(() => setStatus("online"))
      .catch(() => setStatus("offline"))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return [status, setStatus];
}

function useElapsedSeconds(running) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return seconds;
}

const STATUS_LABEL = {
  waking: "Waking model server…",
  online: "Model server online",
  offline: "Model server unreachable",
};

function App() {
  const [slots, setSlots] = useState([null, null]);
  const [region, setRegion] = useState("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useApiStatus();
  const elapsed = useElapsedSeconds(loading);
  const resultRef = useRef(null);

  const arenaRef = useRef(null);
  const [teamA, teamB] = slots;
  const ready = Boolean(teamA && teamB);

  // On small screens the picker sits far below the matchup; bring it back once both teams are set.
  useEffect(() => {
    if (!ready || !arenaRef.current) return;
    if (arenaRef.current.getBoundingClientRect().top < 0) {
      arenaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [ready]);

  const visibleTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEAMS.filter(
      (t) =>
        (region === "ALL" || t.region === region) &&
        (!q || t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q))
    );
  }, [region, query]);

  const resetResult = () => {
    setPrediction(null);
    setError(null);
  };

  const placeTeam = (team, index) => {
    resetResult();
    setSlots((prev) => {
      const next = prev.map((t) => (t && t.code === team.code ? null : t));
      // No slot given: fill the first empty one, or replace Team B when both are full.
      const empty = next.findIndex((t) => t === null);
      const target = index ?? (empty === -1 ? 1 : empty);
      next[target] = team;
      return next;
    });
  };

  const togglePick = (team) => {
    if (slots.some((t) => t && t.code === team.code)) {
      resetResult();
      setSlots((prev) => prev.map((t) => (t && t.code === team.code ? null : t)));
    } else {
      placeTeam(team);
    }
  };

  const clearSlot = (index) => {
    resetResult();
    setSlots((prev) => prev.map((t, i) => (i === index ? null : t)));
  };

  const swap = () => {
    setSlots(([a, b]) => [b, a]);
    setPrediction((p) =>
      p && {
        ...p,
        teamA: p.teamB,
        teamB: p.teamA,
        probability_teamA: p.probability_teamB,
        probability_teamB: p.probability_teamA,
      }
    );
  };

  const reset = () => {
    setSlots([null, null]);
    resetResult();
  };

  const predict = async () => {
    if (!ready || loading) return;
    setLoading(true);
    resetResult();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const url = `${API_BASE}/get_predict?teamA=${encodeURIComponent(teamA.code)}&teamB=${encodeURIComponent(teamB.code)}`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
      setPrediction(data);
      setApiStatus("online");
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      );
    } catch (err) {
      setError(
        err.name === "AbortError"
          ? "The model server took too long to respond. It may still be waking up. Try again in a moment."
          : err.message || "Could not reach the model server."
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  };

  const probA = prediction?.probability_teamA;
  const probB = prediction?.probability_teamB;
  const winnerCode = prediction?.predicted_winner?.toUpperCase();
  const winner = slots.find((t) => t && t.code === winnerCode);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}logos/VCT-logo.png`} alt="" className="brand__logo" />
          <div>
            <p className="brand__eyebrow">VCT 2025 · Machine learning</p>
            <h1 className="brand__title">Match Predictor</h1>
          </div>
        </div>
        <span className={`status status--${apiStatus}`} role="status">
          <span className="status__dot" aria-hidden="true" />
          {STATUS_LABEL[apiStatus]}
        </span>
      </header>

      <main>
        <section className="arena" aria-label="Matchup" ref={arenaRef}>
          <div className="arena__slots">
            <MatchupSlot
              label="Team A"
              team={teamA}
              probability={prediction ? probA : null}
              isWinner={Boolean(winner && teamA && winner.code === teamA.code)}
              onDropTeam={(t) => placeTeam(t, 0)}
              onClear={() => clearSlot(0)}
            />
            <div className="arena__vs">
              <span>VS</span>
              <button
                type="button"
                className="icon-btn"
                onClick={swap}
                disabled={!teamA && !teamB}
                aria-label="Swap teams"
                title="Swap teams"
              >
                ⇄
              </button>
            </div>
            <MatchupSlot
              label="Team B"
              team={teamB}
              probability={prediction ? probB : null}
              isWinner={Boolean(winner && teamB && winner.code === teamB.code)}
              onDropTeam={(t) => placeTeam(t, 1)}
              onClear={() => clearSlot(1)}
            />
          </div>

          <div className="arena__actions">
            <button type="button" className="btn btn--primary" onClick={predict} disabled={!ready || loading}>
              {loading ? "Predicting…" : "Predict winner"}
            </button>
            <button type="button" className="btn btn--ghost" onClick={reset} disabled={!teamA && !teamB}>
              Reset
            </button>
          </div>

          <div className="result" ref={resultRef} aria-live="polite">
            {loading && (
              <div className="result__loading">
                <div className="spinner" aria-hidden="true" />
                <p>
                  Running the model… {elapsed}s
                  {elapsed >= 5 && (
                    <span className="muted">
                      {" "}
                      The free server sleeps when idle, so the first request can take 30–60 seconds.
                    </span>
                  )}
                </p>
              </div>
            )}

            {error && <p className="result__error">{error}</p>}

            {prediction && winner && (
              <div className="result__card">
                <p className="result__label">Predicted winner</p>
                <p className="result__winner" style={{ "--region": regionOf(winner.region).color }}>
                  {winner.name}
                </p>
                <div
                  className="probbar"
                  role="img"
                  aria-label={`${teamA.code} ${Math.round(probA * 100)} percent, ${teamB.code} ${Math.round(probB * 100)} percent`}
                >
                  <div
                    className={`probbar__side probbar__side--a${winner.code === teamA.code ? " is-winner" : ""}`}
                    style={{ width: `${probA * 100}%` }}
                  >
                    <span>
                      {teamA.code} {Math.round(probA * 100)}%
                    </span>
                  </div>
                  <div
                    className={`probbar__side probbar__side--b${winner.code === teamB.code ? " is-winner" : ""}`}
                    style={{ width: `${probB * 100}%` }}
                  >
                    <span>
                      {Math.round(probB * 100)}% {teamB.code}
                    </span>
                  </div>
                </div>
                <p className="result__note">
                  Based on each team's average stats from VCT 2025 Kickoff through the Stage 1 playoffs, the
                  data leading into Masters Toronto 2025.
                </p>
              </div>
            )}

            {!loading && !error && !prediction && (
              <p className="result__idle">
                {ready ? "Ready. Press Predict winner." : "Choose two teams below to build a matchup."}
              </p>
            )}
          </div>
        </section>

        <section className="picker" aria-label="Teams">
          <div className="picker__controls">
            <div className="tabs" role="tablist" aria-label="Filter by region">
              {[{ key: "ALL", label: "All", color: "#ece8e1" }, ...REGIONS].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  role="tab"
                  aria-selected={region === r.key}
                  className={`tab${region === r.key ? " is-active" : ""}`}
                  style={{ "--region": r.color }}
                  onClick={() => setRegion(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <input
              type="search"
              className="search"
              placeholder="Search teams"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search teams"
            />
          </div>

          {visibleTeams.length === 0 ? (
            <p className="muted picker__empty">No teams match “{query}”.</p>
          ) : (
            <div className="grid">
              {visibleTeams.map((team) => (
                <TeamTile
                  key={team.code}
                  team={team}
                  selected={slots.some((t) => t && t.code === team.code)}
                  onPick={togglePick}
                />
              ))}
            </div>
          )}
        </section>

        <section className="about" aria-label="About the model">
          <div className="stats">
            <div className="stat">
              <span className="stat__value">78.6%</span>
              <span className="stat__label">Model accuracy, 33 of 42 live picks</span>
            </div>
            <div className="stat">
              <span className="stat__value stat__value--muted">69.0%</span>
              <span className="stat__label">Bookmaker favourite, 29 of 42</span>
            </div>
            <div className="stat">
              <span className="stat__value stat__value--muted">192</span>
              <span className="stat__label">Pro series scraped across 3 regions</span>
            </div>
          </div>
          <p className="about__text">
            A Random Forest trained on round-level stats (pistols, first kills, KAST, clutches, economy
            and man-advantage conversion) scraped from rib.gg. Picks were logged before each match of VCT
            2025 Americas Stage 1 and compared with pre-match betting odds as a benchmark; EMEA and Pacific
            were added afterwards for this app. The data covers VCT 2025 Kickoff through the Stage 1 playoffs,
            the data leading into Masters Toronto 2025, so later events (Masters Toronto, Stage 2, Champions)
            are not reflected. VCT China teams are not included because rib.gg has no 2025 data for the China
            league. Not betting advice.
          </p>
          <nav className="links">
            <a href="https://github.com/unnamed-catalyst/VCT-Match-Predictor" target="_blank" rel="noreferrer">
              Model &amp; data on GitHub
            </a>
            <a href="https://github.com/unnamed-catalyst/VCT-Predictor-Visualizer" target="_blank" rel="noreferrer">
              App source
            </a>
            <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer">
              API docs
            </a>
          </nav>
        </section>
      </main>
    </div>
  );
}

export default App;
