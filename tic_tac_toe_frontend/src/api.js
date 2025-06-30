//
// Backend API utility for the Tic Tac Toe frontend
//

// PUBLIC_INTERFACE
export const getBackendUrl = () => {
  // Backend URL can be set via environment variable REACT_APP_TTT_BACKEND_URL (with trailing slash)
  // or fallback to http://localhost:3001/
  // You can override for deployment by setting REACT_APP_TTT_BACKEND_URL in .env
  let url =
    process.env.REACT_APP_TTT_BACKEND_URL ||
    window.TTT_BACKEND_URL ||
    "http://localhost:3001/";
  if (!url.endsWith("/")) url = url + "/";
  return url;
};

// Wrap fetch for error translation
// PUBLIC_INTERFACE
async function apiFetch(path, options = {}) {
  const url = getBackendUrl() + path.replace(/^\//, "");
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (e) {
    throw new Error("Could not connect to backend. Is it running?");
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const detail = (data && data.detail) ? data.detail : response.statusText;
    throw new Error(detail || "Unknown backend error");
  }
  return data;
}

// PUBLIC_INTERFACE
export async function createGame(player_x = "", player_o = "") {
  return apiFetch("game", {
    method: "POST",
    body: JSON.stringify({ player_x, player_o }),
  });
}

// PUBLIC_INTERFACE
export async function makeMove(game_id, row, col) {
  return apiFetch(`game/${encodeURIComponent(game_id)}/move`, {
    method: "POST",
    body: JSON.stringify({ row, col }),
  });
}

// PUBLIC_INTERFACE
export async function getGame(game_id) {
  return apiFetch(`game/${encodeURIComponent(game_id)}`, {
    method: "GET",
  });
}

// PUBLIC_INTERFACE
export async function getMatchHistory() {
  return apiFetch("games/history", {
    method: "GET",
  });
}
