document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  const userRole = localStorage.getItem("userRole");
  if (userRole !== 'user') {
    localStorage.clear();
    window.location.href = "/";
    return;
  }

  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "../login/login-component.html";
  });

  const joinGameForm = document.getElementById("joinGameForm");
  if (joinGameForm) {
    joinGameForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const pin = document.getElementById("gamePin").value;
      const nickname = localStorage.getItem("username"); 

      if (!pin || !nickname) {
        alert("O PIN do jogo é obrigatório. Se o erro persistir, faça o login novamente.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/games/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: parseInt(pin), nickname })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("playerGameId", data.playerGameId);
          localStorage.setItem("gameId", data.gameId);
          localStorage.setItem("playerNickname", data.nickname);
          window.location.href = `../game/player-game.html?gameId=${data.gameId}`;
        } else {
          alert(data.mensagem || "Erro ao entrar no jogo");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor");
      }
    });
  }
});