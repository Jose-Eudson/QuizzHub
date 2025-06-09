document.addEventListener('DOMContentLoaded', () => {
    // ... (código existente para 'loadHostQuizzes' e 'handleHostQuiz') ...
    const token = localStorage.getItem('token');
    const socket = io('http://localhost:3000');
    let state = { gameId: null, pin: null, players: [] };

    // --- Listeners de Eventos da UI ---
    document.getElementById('startGameBtn').addEventListener('click', () => {
        socket.emit('game:start', { gameId: state.gameId });
    });

    // O botão "Próxima Pergunta" não é mais necessário e pode ser removido do HTML.
    
    // --- Listeners de Sockets ---
    socket.on('player:joined', (player) => { /* ...código existente... */ });

    socket.on('game:started', () => {
        document.getElementById('lobbySection').classList.add('d-none');
        document.getElementById('gameSection').classList.remove('d-none');
    });

    socket.on('game:nextQuestion', (data) => {
        document.getElementById('questionNumber').textContent = `${data.questionIndex + 1} de ${data.totalQuestions}`;
        document.getElementById('questionText').textContent = data.question.question_text;
    });

    socket.on('game:finished', (data) => {
        document.getElementById('gameSection').classList.add('d-none');
        document.getElementById('resultsSection').classList.remove('d-none');
        document.getElementById('finalRanking').innerHTML = data.finalRanking.map((p, i) =>
            `<div class="p-1 h5">${i + 1}. ${p.nickname} - ${p.score} pts</div>`
        ).join('');
    });

    loadHostQuizzes();
});