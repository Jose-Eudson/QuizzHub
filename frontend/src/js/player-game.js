document.addEventListener('DOMContentLoaded', () => {
  // Pega os dados da partida salvos no localStorage após o 'join'
  const gameId = localStorage.getItem('gameId');
  const playerGameId = localStorage.getItem('playerGameId');
  const nickname = localStorage.getItem('playerNickname');
  const resultSectionEl = document.getElementById('resultSection');
const resultTextEl = document.getElementById('resultSection').querySelector('#resultText');
const finalSectionEl = document.getElementById('finalSection');
const finalScoreEl = document.getElementById('finalSection').querySelector('#finalScore');


  if (!gameId || !playerGameId || !nickname) {
    alert('Dados da partida não encontrados. Voltando ao menu.');
    window.location.href = '../menu-inicial/menu-inicial-component.html';
    return;
  }

  const socket = io('http://localhost:3000');
  
  // Elementos da UI
  const playerNameEl = document.getElementById('playerName');
  const playerScoreEl = document.getElementById('playerScore');
  const waitingSectionEl = document.getElementById('waitingSection');
  const questionSectionEl = document.getElementById('questionSection');
  const questionNumberEl = document.getElementById('questionNumber');
  const questionTextEl = document.getElementById('questionText');
  const answersContainerEl = document.getElementById('answersContainer');
  
  // Seta o nome do jogador na tela
  playerNameEl.textContent = nickname;

  // --- Funções ---

  function renderQuestion(data) {
    waitingSectionEl.classList.add('d-none');
    questionSectionEl.classList.remove('d-none');

    questionNumberEl.textContent = `${data.questionIndex + 1} de ${data.totalQuestions}`;
    questionTextEl.textContent = data.question.question_text;
    
    answersContainerEl.innerHTML = data.question.answers.map(answer => `
      <div class="col-md-6">
        <button class="btn btn-primary w-100 p-3 fs-5" data-answer-id="${answer.id}">
          ${answer.answer_text}
        </button>
      </div>
    `).join('');
  }

  // --- Listeners de Eventos ---

  answersContainerEl.addEventListener('click', (e) => {
    if (e.target.matches('button[data-answer-id]')) {
      const answerId = e.target.dataset.answerId;
      
      // Desabilita todos os botões após a escolha
      answersContainerEl.querySelectorAll('button').forEach(btn => btn.disabled = true);
      e.target.classList.add('btn-success'); // Marca a resposta escolhida

      // Envia a resposta para o servidor
      socket.emit('player:answer', {
        gameId,
        playerGameId,
        questionId: currentQuestionId, // Precisaremos guardar o ID da pergunta atual
        answerId
      });
    }
  });

  // --- Listeners de Sockets ---

  // Conecta o jogador à sala de socket ao carregar a página
  socket.on('connect', () => {
    console.log('Conectado ao servidor de sockets.');
    socket.emit('player:join', { gameId });
  });

  socket.on('game:started', (data) => {
    console.log('O jogo começou!', data);
  });
  
  let currentQuestionId = null; // Guarda o ID da pergunta atual
  socket.on('game:nextQuestion', (data) => {
    console.log('Recebida nova pergunta:', data);
    currentQuestionId = data.question.id;
    renderQuestion(data);
    // Aqui você iniciaria um timer visual
  });

  socket.on('player:answerResult', (data) => {
    console.log('Resultado da sua resposta:', data);
    if (data.newTotalScore) {
      playerScoreEl.textContent = data.newTotalScore;
    }
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
  // Renderizar o ranking final
});

});