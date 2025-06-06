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

  // Elementos da UI
  const quizListEl = document.getElementById('quizList');
  const lobbySectionEl = document.getElementById('lobbySection');
  const selectQuizSectionEl = document.getElementById('selectQuizSection');
  const gamePinEl = document.getElementById('gamePin');
  const playersListEl = document.getElementById('playersList');
  const playerCountEl = document.getElementById('playerCount');
  const startGameBtn = document.getElementById('startGameBtn');
  const gameSectionEl = document.getElementById('gameSection');
  const hostQuestionNumberEl = document.getElementById('gameSection').querySelector('#questionNumber');
  const hostQuestionTextEl = document.getElementById('gameSection').querySelector('#questionText');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn')
    
  // --- Funções ---
  
  async function loadHostQuizzes() {
    try {
      const response = await fetch('http://localhost:3000/api/quizzes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const quizzes = await response.json();
      
      // const myQuizzes = quizzes.filter(q => q.creator_name === localStorage.getItem('username'));

      quizListEl.innerHTML = quizzes.map(quiz => `
        <div class="col-md-4">
          <div class="card quiz-card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${quiz.title}</h5>
              <p class="card-text text-muted flex-grow-1">${quiz.description || 'Sem descrição.'}</p>
              <button class="btn btn-primary mt-auto" data-quiz-id="${quiz.id}">Hospedar este Quiz</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
      alert('Não foi possível carregar seus quizzes.');
    }
  }

  // Inicia o processo de hospedar um jogo
  async function handleHostQuiz(quizId) {
    try {
      const response = await fetch('http://localhost:3000/api/games/host', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quizId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.mensagem);

      state.gameId = data.gameId;
      state.pin = data.pin;

      // Transição da UI para o Lobby
      selectQuizSectionEl.classList.add('d-none');
      lobbySectionEl.classList.remove('d-none');
      gamePinEl.textContent = state.pin;

      // Conecta o host à sala de socket exclusiva
      socket.emit('host:join', { gameId: state.gameId });

    } catch (error) {
      console.error('Erro ao criar sala:', error);
      alert(error.message);
    }
  }

  function updatePlayerList() {
    playerCountEl.textContent = state.players.length;
    playersListEl.innerHTML = state.players.map(p => `<div class="alert alert-secondary">${p.nickname}</div>`).join('');
    startGameBtn.disabled = state.players.length === 0;
  }
  
  // --- Listeners de Eventos ---

  quizListEl.addEventListener('click', (e) => {
    if (e.target.matches('button[data-quiz-id]')) {
      const quizId = e.target.dataset.quizId;
      handleHostQuiz(quizId);
    }
  });

  startGameBtn.addEventListener('click', () => {
    // Emite o evento para o backend iniciar o jogo para todos
    socket.emit('game:start', { gameId: state.gameId });
    // Aqui você faria a transição para a tela de gameplay do host
    alert("Jogo iniciado! (próximo passo é implementar a tela de jogo do host)");
  });

  
  socket.on('player:joined', (player) => {
    console.log('Novo jogador entrou:', player);
    state.players.push(player);
    updatePlayerList();
  });

  socket.on('game:questionResult', (data) => {
  questionSectionEl.classList.add('d-none');
  resultSectionEl.classList.remove('d-none');
  

  const myResult = data.scores.find(p => p.id === playerGameId);

  resultTextEl.textContent = "Tempo esgotado! Veja o ranking.";

});

socket.on('game:finished', (data) => {
  const myFinalScore = data.finalScores.find(p => p.id === playerGameId)?.score || 0;
  resultSectionEl.classList.add('d-none');
  questionSectionEl.classList.add('d-none');
  finalSectionEl.classList.remove('d-none');
  finalScoreEl.textContent = myFinalScore;
});
  
  loadHostQuizzes();
});