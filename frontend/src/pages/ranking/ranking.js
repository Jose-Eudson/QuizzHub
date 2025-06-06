document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/login.component.html";
        return;
    }
    
    const mockRanking = [
        { username: 'jogador_mestre', total_score: 1500 },
        { username: 'sabio_do_quiz', total_score: 1350 },
        { username: localStorage.getItem('username') || 'voce', total_score: 1200 },
        { username: 'geek_nerd', total_score: 1100 },
        { username: 'pensa_rapido', total_score: 950 },
    ].sort((a, b) => b.total_score - a.total_score);

    const rankingTableBody = document.getElementById('rankingTableBody');
    
    if (mockRanking.length > 0) {
        rankingTableBody.innerHTML = mockRanking.map((player, index) => `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${player.username}</td>
                <td>${player.total_score}</td>
            </tr>
        `).join('');
    } else {
        document.getElementById('rankingTableContainer').innerHTML = '<p class="text-center text-muted">Ainda não há ranking para exibir.</p>';
    }
});