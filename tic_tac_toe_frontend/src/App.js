import React, { useState, useEffect } from "react";
import "./App.css";
import {
  createGame,
  makeMove,
  getGame,
  getMatchHistory,
  getBackendUrl,
} from "./api";

// Constants for theming (match spec colors)
const COLORS = {
  primary: "#0583F2",
  secondary: "#1B263B",
  accent: "#FFD60A",
  boardBg: "#F6F7FB",
  cellBg: "#ffffff",
  cellBorder: "#CED9E6",
  playerX: "#0583F2", // primary
  playerO: "#FFD60A", // accent
  winner: "#37c978",
  draw: "#C0C0C0",
};

/*
 * New implementation: All logic flows via backend API.
 * State: current game object ({game_id, board, current_player, winner, ...}),
 * move loading, error, match history loaded from backend.
 */

function blankBoardDisplay() {
  return [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ];
}

// PUBLIC_INTERFACE
function App() {
  const [game, setGame] = useState(null); // Holds backend game object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchHistory, setMatchHistory] = useState([]); // Array of { game_id, winner, ... }
  const [historyReloadFlag, setHistoryReloadFlag] = useState(0);

  // On mount: start new game and load match history
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const g = await createGame();
        setGame(g);
        const h = await getMatchHistory();
        setMatchHistory(h);
      } catch (e) {
        setError(`${e.message}`);
      }
      setLoading(false);
    })();
  }, []);

  // When historyReloadFlag changes, reload history only
  useEffect(() => {
    (async () => {
      try {
        const h = await getMatchHistory();
        setMatchHistory(h);
      } catch (e) {
        setError(`${e.message}`);
      }
    })();
  }, [historyReloadFlag]);

  // PUBLIC_INTERFACE
  async function handleCellClick(rowIdx, colIdx) {
    if (loading || !game || game.state !== "in_progress") return;
    if (game.board[rowIdx][colIdx] !== null) return; // cell already taken
    setLoading(true);
    setError("");
    try {
      const updated = await makeMove(game.game_id, rowIdx, colIdx);
      setGame(updated);
      if (updated.state !== "in_progress") {
        // Game finished, reload match history soon
        setTimeout(() => setHistoryReloadFlag(f => f + 1), 250);
      }
    } catch (e) {
      setError(`${e.message}`);
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function startNewGame() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const g = await createGame();
      setGame(g);
    } catch (e) {
      setError(`${e.message}`);
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function resetHistory() {
    // Just reload history (since backend history is in-memory, this will appear cleared after server restart)
    setLoading(true);
    setError("");
    try {
      // No backend "delete all history"; just start new game and force reload.
      await startNewGame();
      setHistoryReloadFlag(f => f + 1);
    } catch (e) {
      setError(`${e.message}`);
    }
    setLoading(false);
  }

  // Board rendering compatible with backend board shape (null = empty)
  const displayedBoard = game && Array.isArray(game.board)
    ? game.board.map(row => row.map(cell => cell || ""))
    : blankBoardDisplay();

  // Winner, Draw and UI Status extraction
  const winner =
    game && game.state === "won"
      ? game.winner
      : game && game.state === "draw"
      ? "draw"
      : null;

  const currentPlayer =
    game && game.state === "in_progress" ? game.current_player : null;

  // Styles remain the same as before
  const boardStyle = {
    display: "grid",
    gridTemplateRows: "repeat(3, 1fr)",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    background: COLORS.boardBg,
    padding: 24,
    borderRadius: 18,
    border: `2px solid ${COLORS.primary}`,
    minWidth: 320,
    minHeight: 320,
    boxShadow: "0 2px 30px 0 rgba(40,60,100,.07)",
    margin: "32px 0",
  };

  const cellStyle = (value) => ({
    width: 80,
    height: 80,
    fontSize: 40,
    fontWeight: 700,
    borderRadius: 10,
    background: COLORS.cellBg,
    border: `2px solid ${COLORS.cellBorder}`,
    color:
      value === "X"
        ? COLORS.playerX
        : value === "O"
        ? COLORS.playerO
        : COLORS.secondary,
    cursor: value || winner || loading ? "not-allowed" : "pointer",
    boxShadow: "0 1px 2px 0 rgba(60,50,10,.05)",
    transition: "background 0.18s, color 0.22s, border 0.22s",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    opacity: loading ? 0.6 : 1.0
  });

  const flexRow = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 40,
    flexWrap: "wrap",
    width: "100%",
    maxWidth: "850px",
    margin: "0 auto"
  };
  const leftPanel = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: "1 1 340px",
    minWidth: "340px"
  };
  const rightPanel = {
    background: COLORS.secondary,
    color: "#eee",
    padding: "24px 18px",
    borderRadius: 18,
    flex: "1 1 220px",
    minWidth: "220px",
    marginTop: "10px",
    minHeight: "350px",
    boxShadow: "0 2px 13px 0 rgba(10,30,40,0.06)"
  };
  const historyItemStyle = (item) => ({
    borderLeft: `5px solid ${item.winner === "X"
      ? COLORS.playerX
      : item.winner === "O"
      ? COLORS.playerO
      : COLORS.draw}`,
    background: "#202c38be",
    borderRadius: 10,
    marginBottom: 15,
    padding: 9,
    fontSize: 15
  });

  // Notification text color
  const infoColor =
    winner === "X"
      ? COLORS.playerX
      : winner === "O"
      ? COLORS.playerO
      : winner === "draw"
      ? COLORS.draw
      : COLORS.accent;

  return (
    <div className="App" style={{
      background: "#f9fafb",
      minHeight: "100vh",
      color: COLORS.secondary,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "32px 12px 16px 12px",
        minHeight: "100vh",
        fontFamily:
          "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
      }}>
        <div style={{
          marginBottom: 7,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 1,
          color: COLORS.primary,
        }}>
          Tic Tac Toe
        </div>
        <div style={{
          marginBottom: 35,
          fontWeight: 400,
          color: "#526477",
        }}>
          <span style={{ fontSize: 18 }}>
            A simple, modern, interactive 3x3 game
          </span>
        </div>
        <div style={{marginBottom: 12, minHeight: 22}}>
          <span style={{color:"#d12b4a",fontWeight:600}}>{error}</span>
          {loading && <span style={{color: COLORS.primary, marginLeft: 14}}>Loading...</span>}
          <span style={{ float: "right", fontSize: 11, color: "#ccc", marginLeft: 14 }}>
            <a href={getBackendUrl()} rel="noopener noreferrer" style={{ color: "#bbb" }}>Backend</a>
          </span>
        </div>
        <div style={flexRow}>
          {/* Main board and controls */}
          <div style={leftPanel}>
            <div
              aria-label="tic tac toe board"
              style={boardStyle}
              tabIndex={0}
            >
              {[0, 1, 2].map((row) =>
                [0, 1, 2].map((col) => (
                  <button
                    key={row * 3 + col}
                    style={cellStyle(displayedBoard[row][col])}
                    disabled={
                      !!displayedBoard[row][col] ||
                      !!winner ||
                      loading ||
                      !game ||
                      game.state !== "in_progress"
                    }
                    aria-label={
                      displayedBoard[row][col]
                        ? `Cell ${row + 1},${col + 1}, filled with ${displayedBoard[row][col]}`
                        : `Cell ${row + 1},${col + 1}, empty, click to place ${game && game.current_player}`
                    }
                    onClick={() => handleCellClick(row, col)}
                  >
                    {displayedBoard[row][col]}
                  </button>
                ))
              )}
            </div>
            {/* Game state display */}
            <div style={{
              minHeight: 32,
              margin: "22px 0 14px 0",
              fontWeight: 600,
              fontSize: 20,
              color: infoColor,
              letterSpacing: 1.5,
            }}>
              {game && !winner && game.state==="in_progress" && (
                <span>
                  Current player:{" "}
                  <span style={{
                    color:
                      game.current_player === "X" ? COLORS.playerX : COLORS.playerO
                  }}>
                    {game.current_player}
                  </span>
                </span>
              )}
              {winner === "draw" && <span>It's a draw!</span>}
              {winner === "X" && (
                <span>
                  <span style={{ color: COLORS.playerX }}>X</span> wins!
                </span>
              )}
              {winner === "O" && (
                <span>
                  <span style={{ color: COLORS.playerO }}>O</span> wins!
                </span>
              )}
            </div>
            {/* Controls */}
            <div style={{
              marginTop: 8,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              gap: 15,
              justifyContent: "center"
            }}>
              <button
                style={{
                  background: COLORS.primary,
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  padding: "8px 22px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  letterSpacing: 1,
                  marginRight: 0,
                  transition: "background .22s, color .22s"
                }}
                onClick={startNewGame}
                aria-label="Start new game"
                disabled={loading}
              >
                Start New Game
              </button>
              <button
                style={{
                  background: COLORS.accent,
                  color: COLORS.secondary,
                  border: "none",
                  borderRadius: 7,
                  padding: "8px 22px",
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  letterSpacing: 1,
                  transition: "background .22s, color .22s"
                }}
                onClick={resetHistory}
                aria-label="Reset match history"
                disabled={loading}
              >
                Reset History
              </button>
            </div>
          </div>
          {/* Match history panel */}
          <aside style={rightPanel} aria-label="match history">
            <div style={{
              fontWeight: 700,
              color: COLORS.accent,
              fontSize: 17,
              marginBottom: 7,
              letterSpacing: "1px"
            }}>
              Match History
            </div>
            <div style={{
              fontWeight: 400,
              color: "#fff",
              fontSize: 13,
              marginBottom: 14
            }}>
              View past matches below.
            </div>
            {matchHistory.length === 0 ? (
              <div style={{ color: "#7f8997", fontStyle: "italic" }}>
                No matches yet.
              </div>
            ) : (
              matchHistory.slice(0, 7).map((item, idx) => (
                <div
                  key={item.game_id || idx}
                  style={historyItemStyle(item)}
                  tabIndex={0}
                  aria-label={`History match ${idx + 1}, winner: ${item.winner}`}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>
                      {item.winner === "X" &&
                        <span style={{ color: COLORS.playerX }}>X</span>}
                      {item.winner === "O" &&
                        <span style={{ color: COLORS.playerO }}>O</span>}
                      {item.winner === "draw" &&
                        <span style={{ color: COLORS.draw }}>Draw</span>}
                    </span>{" "}
                    {item.winner !== "draw" && item.winner ? "won" : ""}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#fff",
                    opacity: 0.8,
                    margin: "2px 0 4px"
                  }}>
                    Game ID: <span style={{fontFamily:"monospace"}}>{item.game_id?.slice(0, 8)}...</span>
                  </div>
                  <div style={{
                    opacity: 0.55,
                    fontSize: 12,
                    marginTop: 2
                  }}>
                    {item.state === "won" && !!item.winner &&
                      <span>
                        Winner: <b>{item.winner}</b>
                      </span>}
                    {item.state === "draw" && (
                      <span>Draw</span>
                    )}<span>{" | "}</span>
                    {["player_x", "player_o"].map(role =>
                      item[role] &&
                      <span key={role} style={{marginLeft:8,opacity:0.8}}>{role.toUpperCase()}: {item[role]}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            {matchHistory.length > 7 &&
              <div style={{ fontSize: 13, color: "#9aacba" }}>
                + {matchHistory.length - 7} more...
              </div>}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
