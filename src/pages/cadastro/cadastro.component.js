document.getElementById("formCadastro").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const username = email.split('@')[0];

  try {
    const response = await fetch("http://localhost:3000/api/auth/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password: senha })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "../login/login.component.html";
    } else {
      alert(data.mensagem || "Erro ao cadastrar.");
    }
  } catch (error) {
    alert("Erro na requisição.");
    console.error(error);
  }
});
