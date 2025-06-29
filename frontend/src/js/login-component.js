document.getElementById("formLogin").addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: senha })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.usuario.username);

      const payload = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem("userRole", payload.role);

      if (payload.role === 'admin') {
        window.location.href = "../menu-inicial/menu-inicial-component.html";
      } else {
        window.location.href = "../menu-inicial/menu-jogador.html";
      }
    } else {
      alert(data.mensagem || "Falha no login.");
    }
  } catch (error) {
    alert("Erro ao tentar logar.");
    console.error(error);
  }
});