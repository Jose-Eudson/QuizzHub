document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login/login-component.html';
        return;
    }

    const socket = io('http://localhost:3000');
    let state = {
        gameId: null,
        pin: null,
        players: [],
    };

    const containerEl = document.querySelector('.container');

    async function loadHostQuizzes() {
        try {
            const response = await fetch('http://localhost:3000/api/quizzes', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(`Falha ao buscar quizzes.`);
            const quizzes = await response.json();
            
            const quizListEl = document.getElementById('quizList');
            if (quizzes.length === 0) {
                quizListEl.innerHTML = '<div class="col-12"><p class="text-center text-muted">Nenhum quiz encontrado.</p></div>';
            } else {
                quizListEl.innerHTML = quizzes.map(quiz => `
                    <div class="col-md-4 mb-4"><div class="card quiz-card h-100"><div class="card-body d-flex flex-column">
                    <h5 class="card-title">${quiz.title}</h5><p class="card-text text-muted flex-grow-1">${quiz.description || 'Sem descrição.'}</p>
                    <button class="btn btn-primary mt-auto" data-quiz-id="${quiz.id}">Hospedar este Quiz</button>
                    </div></div></div>`).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar quizzes:', error);
            alert('Ocorreu um erro ao carregar os quizzes.');
        }
    }

    async function handleHostQuiz(quizId) {
        try {
            const response = await fetch('http://localhost:3000/api/games/host', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ quizId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.mensagem);

            state.gameId = data.gameId;
            state.pin = data.pin;

            document.getElementById('selectQuizSection').classList.add('d-none');
            document.getElementById('lobbySection').classList.remove('d-none');
            document.getElementById('gamePin').textContent = state.pin;
            
            socket.emit('host:join', { gameId: state.gameId });
        } catch (error) {
            console.error('Erro ao criar sala:', error);
            alert(error.message);
        }
    }

    function updatePlayerList() {
        document.getElementById('playerCount').textContent = state.players.length;
        document.getElementById('playersList').innerHTML = state.players.map(p => `<div class="alert alert-info py-2">${p.nickname}</div>`).join('');
        document.getElementById('startGameBtn').disabled = state.players.length === 0;
    }

    containerEl.addEventListener('click', (e) => {
        const target = e.target;

        const hostButton = target.closest('button[data-quiz-id]');
        if (hostButton) {
            handleHostQuiz(hostButton.dataset.quizId);
            return;
        }

        if (target.matches('#startGameBtn')) {
            socket.emit('game:start', { gameId: state.gameId });
            return;
        }
    });

    socket.on('player:joined', (player) => {
        // Previne duplicação na lista do host
        if (!state.players.find(p => p.id === player.id)) {
            state.players.push(player);
            updatePlayerList();
        }
    });

    socket.on('game:started', () => {
        document.getElementById('lobbySection').classList.add('d-none');
        document.getElementById('gameSection').classList.remove('d-none');
    });

    socket.on('game:nextQuestion', (data) => {
        document.getElementById('questionHeader').textContent = `Pergunta ${data.questionIndex + 1} de ${data.totalQuestions}`;
        document.getElementById('questionText').textContent = data.question.question_text;
    
        const progressEl = document.getElementById('answersProgress');
        const progressTextEl = document.getElementById('answeredCountText');
        progressEl.style.width = '0%';
        progressTextEl.textContent = `0/${state.players.length}`;
    });

    // MODIFICAÇÃO: Novo listener para atualizar a barra de progresso.
    socket.on('player:answeredUpdate', (data) => {
        const percentage = data.totalPlayers > 0 ? (data.answeredCount / data.totalPlayers) * 100 : 0;
        const progressEl = document.getElementById('answersProgress');
        const progressTextEl = document.getElementById('answeredCountText');
        
        progressEl.style.width = `${percentage}%`;
        progressTextEl.textContent = `${data.answeredCount}/${data.totalPlayers}`;
    });
    
    socket.on('game:finished', (data) => {
        document.getElementById('gameSection').classList.add('d-none');
        document.getElementById('resultsSection').classList.remove('d-none');
        
        const rankingBody = document.getElementById('finalRankingBody');
        if (data.finalRanking && data.finalRanking.length > 0) {
            rankingBody.innerHTML = data.finalRanking.map((p, i) => `
                <tr>
                  <th scope="row">${i + 1}</th>
                  <td>${p.nickname}</td>
                  <td>${p.score}</td>
                </tr>
            `).join('');
        } else {
            rankingBody.innerHTML = '<tr><td colspan="3">Nenhum jogador participou.</td></tr>';
        }
    });

    socket.on('game:error', (data) => {
        alert(data.message);
    });

    loadHostQuizzes();
});