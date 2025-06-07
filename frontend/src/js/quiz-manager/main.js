// js/main.js

import * as api from './api.js';
import * as ui from './ui.js';

let state = {
  quizzes: [],
  currentQuizInModal: {},
  deleted: {
    questionIds: new Set(),
    answerIds: new Set(),
  }
};

function checkAuth() {
  if (!localStorage.getItem("token")) {
    window.location.href = "../../pages/login/login-component.html";
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  checkAuth();
}

async function handleLoadQuizzes() {
  try {
    ui.showLoading(true);
    state.quizzes = await api.fetchQuizzes();
    ui.renderQuizzes(state.quizzes);
  } catch (error) {
    ui.showAlert(error.message);
  } finally {
    ui.showLoading(false);
  }
}

function handleFilterQuizzes() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filtered = state.quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm) ||
    q.description.toLowerCase().includes(searchTerm) ||
    q.creator_name.toLowerCase().includes(searchTerm) ||
    (q.category && q.category.toLowerCase().includes(searchTerm))
  );
  ui.renderQuizzes(filtered);
}

async function handleSaveQuiz() {
  console.log('FRONTEND: Tentando salvar o quiz com ID do estado:', state.currentQuizInModal.id)
  ui.showLoading(true);
  try {
    syncUIStateToObject();

    const quizPayload = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      time_limit: parseInt(document.getElementById('timeLimit').value, 10) * 60,
      difficulty: document.getElementById('difficulty').value,
      category: document.getElementById('category').value,
    };
    
    const savedQuiz = await api.saveQuiz(quizPayload, state.currentQuizInModal.id);
    console.log('RESPOSTA DO BACKEND (criarQuiz):', savedQuiz);
    const quizId = state.currentQuizInModal.id || savedQuiz.id;
    if (!quizId) throw new Error("ID do Quiz não foi encontrado após salvar.");

    await Promise.all([...state.deleted.questionIds].map(
      questionId => api.deleteQuestion(quizId, questionId)
    ));

    //await Promise.all([...state.deleted.answerIds].map(id => api.deleteAnswer(id)));

    for (const question of state.currentQuizInModal.questions) {
      const isNewQuestion = !question.id || String(question.id).startsWith('temp-');
      const questionIdForApi = isNewQuestion ? null : question.id;
      
      const questionPayload = { 
        question_text: question.question_text, 
        points: question.points 
      };
      
      const savedQuestion = await api.saveQuestion(quizId, questionPayload, questionIdForApi);

      // =========================================================================
      // LINHA DE DEPURAÇÃO ADICIONADA AQUI
      // Verifique no console do navegador o que o backend retorna para 'savedQuestion'.
      // Ele DEVE ser um objeto com uma propriedade 'id'.
      console.log('RESPOSTA DO BACKEND (saveQuestion):', savedQuestion);
      // =========================================================================

      for (const answer of question.answers) {
        const isNewAnswer = !answer.id || String(answer.id).startsWith('temp-');
        const answerIdForApi = isNewAnswer ? null : answer.id;
        
        const answerPayload = { answer_text: answer.answer_text, is_correct: answer.is_correct };

        // Esta linha irá falhar se 'savedQuestion.id' for undefined.
        await api.saveAnswer(quizId, savedQuestion.id, answerPayload, answerIdForApi);
      }
    }
    
    ui.showAlert('Quiz salvo com sucesso!', false);
    bootstrap.Modal.getInstance(document.getElementById('quizModal')).hide();
    await handleLoadQuizzes();

  } catch (error) {
    ui.showAlert(error.message);
  } finally {
    ui.showLoading(false);
  }
}

async function handleQuizzesContainerClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const quizId = button.dataset.quizId;
  const action = button.dataset.action;

  if (action === 'delete') {
    if (confirm('Tem certeza que deseja excluir este quiz?')) {
      try {
        await api.deleteQuiz(quizId);
        await handleLoadQuizzes();
      } catch (error) {
        ui.showAlert(error.message);
      }
    }
  }

  if (action === 'edit') {
    const quizDetails = await api.fetchQuizDetails(quizId);
    state.currentQuizInModal = quizDetails;
    state.deleted = { questionIds: new Set(), answerIds: new Set() };
    ui.populateQuizModalForEdit(quizDetails);
    new bootstrap.Modal(document.getElementById('quizModal')).show();
  }
}

function handleOpenNewQuizModal() {
    console.log('EVENTO: "Novo Quiz" clicado. O estado está sendo resetado para null.');
  state.currentQuizInModal = { id: null, questions: [] };
  state.deleted = { questionIds: new Set(), answerIds: new Set() };
  ui.resetQuizModal();
}

function handleAddQuestion() {
  syncUIStateToObject();
  if (!state.currentQuizInModal.questions) {
    state.currentQuizInModal.questions = [];
  }
  state.currentQuizInModal.questions.push({
    id: `temp-q-${Date.now()}`,
    question_text: '',
    points: 10,
    answers: [],
  });
  ui.renderQuestions(state.currentQuizInModal.questions);
}

function handleQuestionsContainerClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  syncUIStateToObject();
  const action = button.dataset.action;
  const questionCard = event.target.closest('.question-card');
  const questionId = questionCard.dataset.questionId;
  const questionIndex = state.currentQuizInModal.questions.findIndex(q => q.id == questionId);
  if (questionIndex === -1) return;

  if (action === 'remove-question') {
    const [removedQuestion] = state.currentQuizInModal.questions.splice(questionIndex, 1);
    if (removedQuestion.id && !String(removedQuestion.id).startsWith('temp-')) {
      state.deleted.questionIds.add(removedQuestion.id);
    }
  }
  
  if (action === 'add-answer') {
    if (!state.currentQuizInModal.questions[questionIndex].answers) {
      state.currentQuizInModal.questions[questionIndex].answers = [];
    }
    state.currentQuizInModal.questions[questionIndex].answers.push({
      id: `temp-a-${Date.now()}`,
      answer_text: '', 
      is_correct: false 
    });
  }

  if(action === 'remove-answer') {
    const answerDiv = event.target.closest('.answer-option');
    const answerId = answerDiv.dataset.answerId;
    const answers = state.currentQuizInModal.questions[questionIndex].answers;
    const answerIndex = answers.findIndex(a => a.id == answerId);
    if(answerIndex !== -1) {
      const [removedAnswer] = answers.splice(answerIndex, 1);
      if (removedAnswer.id && !String(removedAnswer.id).startsWith('temp-')) {
        state.deleted.answerIds.add(removedAnswer.id);
      }
    }
  }
  
  ui.renderQuestions(state.currentQuizInModal.questions);
}

function syncUIStateToObject() {
  if (!state.currentQuizInModal.questions) state.currentQuizInModal.questions = [];
  const questionElements = document.querySelectorAll('#questionsContainer .question-card');
  const newQuestionsState = Array.from(questionElements).map((qCard) => {
    const questionId = qCard.dataset.questionId;
    const originalQuestion = state.currentQuizInModal.questions.find(q => q.id == questionId) || { answers: [] };
    
    const newAnswers = Array.from(qCard.querySelectorAll('.answer-option')).map((ansEl) => {
      const answerId = ansEl.dataset.answerId;
      const originalAnswer = (originalQuestion.answers || []).find(a => a.id == answerId) || {};
      return { ...originalAnswer, answer_text: ansEl.querySelector('input[type="text"]').value, is_correct: ansEl.querySelector('input[type="radio"]').checked };
    });
    return { 
        ...originalQuestion, 
        question_text: qCard.querySelector('[data-field="question_text"]').value, 
        points: parseInt(qCard.querySelector('[data-field="points"]').value, 10), 
        answers: newAnswers 
    };
  });
  state.currentQuizInModal.questions = newQuestionsState;
}

function setupEventListeners() {
  document.getElementById("btnLogout").addEventListener("click", logout);
  document.getElementById("searchInput").addEventListener("input", handleFilterQuizzes);
  document.getElementById("quizzesContainer").addEventListener("click", handleQuizzesContainerClick);
  document.getElementById("btnNovoQuiz").addEventListener("click", handleOpenNewQuizModal);
  document.getElementById("btnSalvarQuiz").addEventListener("click", handleSaveQuiz);
  document.getElementById("btnAddQuestion").addEventListener("click", handleAddQuestion);
  document.getElementById("questionsContainer").addEventListener('click', handleQuestionsContainerClick);
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupEventListeners();
  handleLoadQuizzes();
});