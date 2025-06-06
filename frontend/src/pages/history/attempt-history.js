document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/login.component.html";
        return;
    }
    
    const mockHistory = [
        { quizTitle: 'Geografia do Brasil', date: '2025-06-04', score: 85 },
        { quizTitle: 'História Antiga', date: '2025-06-03', score: 70 },
        { quizTitle: 'Programação em JS', date: '2025-06-01', score: 95 },
    ];
    
    const historyContainer = document.getElementById('historyListContainer');
    
    if(mockHistory.length > 0) {
        historyContainer.innerHTML = mockHistory.map(item => `
            <div class="list-group-item history-item">
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">${item.quizTitle}</h5>
                  <small class="text-muted">${item.date}</small>
                </div>
                <p class="mb-1 text-primary">Pontuação: <strong>${item.score}</strong></p>
            </div>
        `).join('');
    } else {
        historyContainer.innerHTML = '<p class="text-center text-muted">Você ainda não completou nenhum quiz.</p>';
    }
});