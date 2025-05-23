document.getElementById("formCadastro").addEventListener("submit", async function (event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const role = document.getElementById("role").value;

  try {
    const response = await fetch("http://localhost:3000/api/auth/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, email, senha, role })
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
