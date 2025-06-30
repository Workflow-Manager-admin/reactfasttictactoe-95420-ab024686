import React, { useState, useEffect } from "react";
import "./App.css";

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

const EMPTY_BOARD = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""]
];

// Helper to clone the board deeply
function cloneBoard(board) {
  return board.map((row) => [...row]);
}

// PUBLIC_INTERFACE
function App() {
  // state for board, player, winner, history, move count
  const [board, setBoard] = useState(cloneBoard(EMPTY_BOARD));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null); // 'X', 'O', or 'draw' or null
  const [matchHistory, setMatchHistory] = useState([]); // Array of { board, winner }
  const [moveCount, setMoveCount] = useState(0);

  // PUBLIC_INTERFACE
  function handleCellClick(rowIdx, colIdx) {
    if (winner || board[rowIdx][colIdx]) return; // ignore if game over or cell filled

    const newBoard = cloneBoard(board);
    newBoard[rowIdx][colIdx] = currentPlayer;
    const nextMoveCount = moveCount + 1;

    setBoard(newBoard);
    setMoveCount(nextMoveCount);

    const gameResult = checkGameOver(newBoard, currentPlayer, nextMoveCount);

    if (gameResult === "X" || gameResult === "O") {
      setWinner(gameResult);
      addMatchToHistory(newBoard, gameResult);
    } else if (gameResult === "draw") {
      setWinner("draw");
      addMatchToHistory(newBoard, "draw");
    } else {
      // next player
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  }

  // PUBLIC_INTERFACE
  function startNewGame() {
    setBoard(cloneBoard(EMPTY_BOARD));
    setCurrentPlayer((prev) =>
      matchHistory.length % 2 === 0 ? "X" : "O"
    ); // alternate who starts
    setWinner(null);
    setMoveCount(0);
  }

  // PUBLIC_INTERFACE
  function resetHistory() {
    setMatchHistory([]);
    startNewGame();
  }

  // Add last match to history
  function addMatchToHistory(boardSnapshot, winnerSnapshot) {
    setMatchHistory((history) => [
      {
        board: cloneBoard(boardSnapshot),
        winner: winnerSnapshot,
        timestamp: new Date().toISOString(),
      },
      ...history,
    ]);
  }

  // Returns "X", "O", "draw", or null
  function checkGameOver(_board, currentPlayer, totalFilled) {
    // Rows, columns & diagonals
    for (let i = 0; i < 3; i++) {
      if (
        _board[i][0] &&
        _board[i][0] === _board[i][1] &&
        _board[i][1] === _board[i][2]
      )
        return _board[i][0];
      if (
        _board[0][i] &&
        _board[0][i] === _board[1][i] &&
        _board[1][i] === _board[2][i]
      )
        return _board[0][i];
    }
    // Diagonals:
    if (
      _board[0][0] &&
      _board[0][0] === _board[1][1] &&
      _board[1][1] === _board[2][2]
    )
      return _board[0][0];
    if (
      _board[0][2] &&
      _board[0][2] === _board[1][1] &&
      _board[1][1] === _board[2][0]
    )
      return _board[0][2];
    // Draw:
    if (totalFilled >= 9) return "draw";
    return null;
  }

  // Styles
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
    cursor: value || winner ? "not-allowed" : "pointer",
    boxShadow: "0 1px 2px 0 rgba(60,50,10,.05)",
    transition: "background 0.18s, color 0.22s, border 0.22s",
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
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

  // Responsive font and layout (media queries via inline style are limited, so rely on % maxWidth and minWidth as above)

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
                    style={cellStyle(board[row][col])}
                    disabled={!!board[row][col] || !!winner}
                    aria-label={
                      board[row][col]
                        ? `Cell ${row + 1},${col + 1}, filled with ${board[row][col]}`
                        : `Cell ${row + 1},${col + 1}, empty, click to place ${currentPlayer}`
                    }
                    onClick={() => handleCellClick(row, col)}
                  >
                    {board[row][col]}
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
              {!winner && (
                <span>
                  Current player:{" "}
                  <span style={{
                    color:
                      currentPlayer === "X" ? COLORS.playerX : COLORS.playerO
                  }}>
                    {currentPlayer}
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
                  key={idx}
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
                    {item.winner !== "draw" ? "won" : ""}
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,24px)",
                    gap: "1px 3px",
                    margin: "4px 0"
                  }}>
                    {item.board.flat().map((cell, cidx) => (
                      <div
                        key={cidx}
                        style={{
                          width: 22,
                          height: 22,
                          background: "#2c3953",
                          borderRadius: 3,
                          color:
                            cell === "X" ? COLORS.playerX : cell === "O" ? COLORS.playerO : "#566585",
                          fontWeight: 600,
                          fontSize: 15,
                          textAlign: "center",
                          lineHeight: "22px",
                          border: "1px solid #33425e"
                        }}>
                        {cell}
                      </div>
                    ))}
                  </div>
                  <div style={{ opacity: 0.55, fontSize: 12, marginTop: 2 }}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
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
