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

        if (!response.ok) throw new Error('Não foi possível carregar o histórico.');

        const historyData = await response.json();
        loadingSpinner.style.display = 'none';

        if (historyData.length > 0) {
            historyContainer.innerHTML = historyData.map(item => `
                <div class="list-group-item history-item">
                    <div class="d-flex w-100 justify-content-between">
                      <h5 class="mb-1">${item.quizTitle}</h5>
                      <small class="text-muted">${new Date(item.date).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-1 text-primary">Pontuação: <strong>${item.score}</strong></p>
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