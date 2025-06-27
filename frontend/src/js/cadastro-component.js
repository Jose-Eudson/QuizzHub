document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');

    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const role = document.getElementById('role').value;

        if (!role) {
            alert('Por favor, selecione o tipo de conta (Administrador ou Jogador).');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    senha: senha,
                    role: role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.mensagem || 'Cadastro realizado com sucesso! Você será redirecionado para o login.');
                window.location.href = '../login/login-component.html';
            } else {
                alert(data.mensagem || 'Ocorreu um erro no cadastro.');
            }

        } catch (error) {
            console.error('Erro ao tentar cadastrar:', error);
            alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        }
    });
});