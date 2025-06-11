document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/login-component.html";
        return;
    }

    const rankingTableBody = document.getElementById('rankingTableBody');
    const loadingSpinner = document.getElementById('loadingSpinnerRanking');
    const noRankingMessage = document.getElementById('noRankingMessage');
    const rankingTableContainer = document.getElementById('rankingTableContainer');
    
    loadingSpinner.style.display = 'block';
    rankingTableContainer.style.display = 'none';

    try {
        const response = await fetch("http://localhost:3000/api/auth/ranking", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensagem || 'Não foi possível carregar o ranking.');
        }

        const rankingData = await response.json();
        loadingSpinner.style.display = 'none';

        if (rankingData && rankingData.length > 0) {
            rankingTableContainer.style.display = 'block';
            rankingTableBody.innerHTML = rankingData.map((player, index) => `
                <tr>
                    <th scope="row">${index + 1}</th>
                    <td>${player.nickname}</td>
                    <td>${player.total_score}</td>
                </tr>
            `).join('');
        } else {
            noRankingMessage.style.display = 'block';
        }
    } catch (error) {
        loadingSpinner.style.display = 'none';
        noRankingMessage.textContent = error.message;
        noRankingMessage.style.display = 'block';
        console.error(error);
    }
});