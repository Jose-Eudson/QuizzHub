function getDifficultyBadge(difficulty) {
  const badges = { facil: 'success', medio: 'warning', dificil: 'danger' };
  const labels = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
  return `<span class="badge bg-${badges[difficulty] || 'secondary'}">${labels[difficulty] || difficulty}</span>`;
}

export function renderQuizzes(quizzesToRender) {
  const container = document.getElementById("quizzesContainer");
  const noQuizzesDiv = document.getElementById("noQuizzes");
  noQuizzesDiv.style.display = quizzesToRender.length === 0 ? 'block' : 'none';
  
  container.innerHTML = quizzesToRender.map(quiz => `
    <div class="col-md-6 col-lg-4">
      <div class="card quiz-card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-1">${quiz.title}</h5>
            ${getDifficultyBadge(quiz.difficulty)}
          </div>
          <p class="card-text text-muted small flex-grow-1">${quiz.description || 'Sem descrição.'}</p>
          <div class="d-flex justify-content-between align-items-center mb-3 mt-auto pt-2">
            <small class="text-primary fw-bold">${quiz.category || ''}</small>
            <small class="text-muted"><i class="bi bi-clock"></i> ${Math.round(quiz.time_limit / 60)} min</small>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">Por: ${quiz.creator_name}</small>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-primary" data-action="edit" data-quiz-id="${quiz.id}" title="Editar quiz">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-quiz-id="${quiz.id}" title="Excluir quiz">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

export function resetQuizModal() {
  document.getElementById("modalTitle").textContent = "Novo Quiz";
  document.getElementById("quizInfoForm").reset();
  document.getElementById("quizId").value = '';
  document.getElementById("difficulty").value = 'facil';
  document.getElementById("timeLimit").value = '10';
  document.getElementById("questionsContainer").innerHTML = '<p class="text-muted text-center">Nenhuma pergunta adicionada.</p>';
  const infoTab = new bootstrap.Tab(document.getElementById('info-tab'));
  infoTab.show();
}

export function populateQuizModalForEdit(quiz) {
    document.getElementById("modalTitle").textContent = "Editar Quiz";
    document.getElementById("quizId").value = quiz.id;
    document.getElementById("title").value = quiz.title;
    document.getElementById("description").value = quiz.description;
    document.getElementById("timeLimit").value = quiz.time_limit ? Math.round(quiz.time_limit / 60) : 10;
    document.getElementById("difficulty").value = quiz.difficulty || 'facil';
    document.getElementById("category").value = quiz.category || '';
    renderQuestions(quiz.questions || []);
}

export function renderQuestions(questions) {
    const container = document.getElementById("questionsContainer");
    if (!questions || questions.length === 0) {
      container.innerHTML = '<p class="text-muted text-center">Nenhuma pergunta adicionada.</p>';
      return;
    }
    container.innerHTML = questions.map((question, qIndex) => `
      <div class="question-card p-3 mb-3 border rounded" data-question-id="${question.id || `temp-${qIndex}`}">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h6 class="mb-0">Pergunta ${qIndex + 1}</h6>
          <button type="button" class="btn btn-sm btn-outline-danger" data-action="remove-question" title="Remover pergunta">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        
        <div class="mb-3">
          <label class="form-label small">Texto da pergunta *</label>
          <textarea class="form-control" data-field="question_text" rows="2">${question.question_text || ''}</textarea>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label small">Pontos</label>
            <input type="number" class="form-control" data-field="points" min="1" value="${question.points || 10}">
          </div>
        </div>
        
        <div class="mb-1">
            <label class="form-label small">Respostas</label>
            <div class="answers-container">
              ${(question.answers || []).map((answer, aIndex) => `
                <div class="answer-option d-flex align-items-center mb-2" data-answer-id="${answer.id || `temp-${aIndex}`}">
                  <input class="form-check-input mt-0" type="radio" name="correct_answer_${qIndex}" ${answer.is_correct ? 'checked' : ''}>
                  <input type="text" class="form-control form-control-sm mx-2" placeholder="Texto da resposta" value="${answer.answer_text || ''}">
                  <button type="button" class="btn btn-sm btn-outline-danger flex-shrink-0" data-action="remove-answer" title="Remover resposta"><i class="bi bi-x-lg"></i></button>
                </div>
              `).join('')}
            </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-success" data-action="add-answer"><i class="bi bi-plus-lg"></i> Adicionar Resposta</button>
      </div>
    `).join('');
}


export function showLoading(show) {
  document.getElementById("loadingSpinner").style.display = show ? 'block' : 'none';
}

export function showAlert(message, isError = true) {
  alert((isError ? 'Erro: ' : 'Sucesso: ') + message);
}