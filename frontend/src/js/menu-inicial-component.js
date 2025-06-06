document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../pages/login/login-component.html";
    return;
  }

  const btnLogout = document.getElementById("btnLogout");
  console.log("aqui1")
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      console.log("aqui2")
      localStorage.removeItem("token");
      localStorage.removeItem("username"); 
      window.location.href = "../login/login-component.html";
    });
  }

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