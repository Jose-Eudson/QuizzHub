document.addEventListener('DOMContentLoaded', () => {
    const gameId = localStorage.getItem('gameId');
    const playerGameId = parseInt(localStorage.getItem('playerGameId'));
    const nickname = localStorage.getItem('playerNickname');

    if (!gameId || !playerGameId || !nickname) {
        alert('Dados da partida não encontrados. Retornando ao menu.');
        window.location.href = '../menu-inicial/menu-inicial-component.html';
        return;
    }

    const socket = io('http://localhost:3000');
    let currentQuestionId = null;

    const waitingSection = document.getElementById('waitingSection');
    const questionSection = document.getElementById('questionSection');
    const finalSection = document.getElementById('finalSection');
    const allSections = [waitingSection, questionSection, finalSection];

    const answersContainerEl = document.getElementById('answersContainer');
    
    function showSection(sectionToShow) {
        allSections.forEach(section => {
            if (section) section.classList.add('d-none');
        });
        if (sectionToShow) sectionToShow.classList.remove('d-none');
    }

    answersContainerEl.addEventListener('click', (e) => {
        const answerButton = e.target.closest('button[data-answer-id]');
        if (answerButton) {
            const answerId = parseInt(answerButton.dataset.answerId);
            answersContainerEl.innerHTML = '<h4 class="text-center text-muted py-5">Resposta enviada! Aguardando próxima pergunta...</h4>';
            socket.emit('player:answer', { gameId, playerGameId, questionId: currentQuestionId, answerId });
        }
    });

    socket.on('connect', () => {
        console.log('Conectado ao servidor! Entrando na sala...');
        socket.emit('player:join', { gameId, nickname, playerGameId });
    });

    socket.on('game:started', () => {
        console.log('RECEBIDO: Evento "game:started". Exibindo tela de perguntas.');
        showSection(questionSection);
    });

    socket.on('game:nextQuestion', (data) => {
        showSection(questionSection);
        currentQuestionId = data.question.id;
        document.getElementById('questionText').textContent = data.question.question_text;
        document.getElementById('questionNumber').textContent = `${data.questionIndex + 1} de ${data.totalQuestions}`;
        answersContainerEl.innerHTML = data.question.answers.map(answer =>
            `<div class="col-6 mb-3"><button class="btn btn-primary w-100 p-3 fs-5" data-answer-id="${answer.id}">${answer.answer_text}</button></div>`
        ).join('');
    });

    socket.on('game:finished', (data) => {
    showSection(finalSection);
    const myResult = data.finalRanking.find(p => p.id === playerGameId);
    document.getElementById('finalScore').textContent = myResult ? myResult.score : 0;
    
    const rankingBody = document.getElementById('finalRankingBody');
    if (data.finalRanking.length > 0) {
        rankingBody.innerHTML = data.finalRanking.map((p, i) => `
            <tr class="${p.id === playerGameId ? 'table-primary' : ''}">
              <th scope="row">${i + 1}</th>
              <td>${p.nickname}</td>
              <td>${p.score}</td>
            </tr>
        `).join('');
    } else {
        rankingBody.innerHTML = '<tr><td colspan="3">Nenhum jogador participou.</td></tr>';
    }
});

    showSection(waitingSection);
});