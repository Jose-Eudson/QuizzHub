document.getElementById("formLogin").addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Erro ao decodificar o token:", e);
      return null;
    }
  }

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password: senha })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.usuario.username);

      const tokenPayload = parseJwt(data.token);
      if (tokenPayload && tokenPayload.role) {
        localStorage.setItem("userRole", tokenPayload.role);
      }

      alert("Login bem-sucedido!");
      
      window.location.href = "../../../index.html";
    } else {
      alert(data.mensagem || "Falha no login.");
    }
  } catch (error) {
    alert("Erro ao tentar logar.");
    console.error(error);
  }
});