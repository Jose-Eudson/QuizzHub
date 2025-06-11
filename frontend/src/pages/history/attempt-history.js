document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/login-component.html";
        return;
    }

    const historyContainer = document.getElementById('historyListContainer');
    const loadingSpinner = document.getElementById('loadingSpinnerHistory');
    const noHistoryMessage = document.getElementById('noHistoryMessage');

    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch("http://localhost:3000/api/auth/history", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.mensagem || 'Não foi possível carregar o histórico.');
        }

        const historyData = await response.json();
        loadingSpinner.style.display = 'none';

        if (historyData.length > 0) {
            historyContainer.innerHTML = historyData.map(item => `
                <div class="list-group-item list-group-item-action flex-column align-items-start history-item">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">${item.quizTitle}</h5>
                      <small>${new Date(item.date).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-1">Pontuação final: <strong>${item.score}</strong> pontos</p>
                </div>
            `).join('');
        } else {
            noHistoryMessage.style.display = 'block';
        }
    } catch (error) {
        loadingSpinner.style.display = 'none';
        noHistoryMessage.textContent = error.message;
        noHistoryMessage.style.display = 'block';
        console.error(error);
    }
});