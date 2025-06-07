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

  // Lógica do botão de Sair
  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.clear(); // Limpa todo o storage
    window.location.href = "/";
  });

  // Lógica do formulário para Entrar em Jogo (movida para cá)
  const joinGameForm = document.getElementById("joinGameForm");
  if (joinGameForm) {
    joinGameForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const pin = document.getElementById("gamePin").value;
      const nickname = document.getElementById("nickname").value;

      if (!pin || !nickname) {
        alert("Por favor, preencha todos os campos.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/games/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
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