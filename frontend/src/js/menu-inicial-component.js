document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  console.log(3)
  if (!token) {
    window.location.href = "../menu-inicial/menu-inicial-component.html";
    return;
  }
  console.log(4)
  // const userRole = localStorage.getItem("userRole");
  // if(userRole !== 'admin') {
  //     localStorage.clear();
  //     window.location.href = "../menu-inicial/menu-inicial-component.html";
  //     return;
  // }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole"); 
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