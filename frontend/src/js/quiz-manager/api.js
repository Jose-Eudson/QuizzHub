// js/api.js

const API_BASE = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }


  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorMsg = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMsg = errorBody.message || errorBody.mensagem || errorMsg;
    } catch (e) {
      // Ignora
    }
    throw new Error(errorMsg);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return null;
}


// === Endpoints de Quizzes ===
export const fetchQuizzes = () => request('/quizzes');
export const fetchQuizDetails = (quizId) => request(`/quizzes/${quizId}`);
export const saveQuiz = (quizData, quizId) => {
  const method = quizId ? 'PUT' : 'POST';
  const endpoint = quizId ? `/quizzes/${quizId}` : '/quizzes';
  // Apenas o objeto é passado
  return request(endpoint, { method, body: quizData });
};
export const deleteQuiz = (quizId) => request(`/quizzes/${quizId}`, { method: 'DELETE' });

// === Endpoints de Perguntas ===
export const saveQuestion = (quizId, questionData, questionId) => {
  const method = questionId ? 'PUT' : 'POST';
  const endpoint = questionId
    ? `/quizzes/${quizId}/questions/${questionId}`
    : `/quizzes/${quizId}/questions`;
  return request(endpoint, { method, body: questionData });
};
export const deleteQuestion = (quizId, questionId) => request(`/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE' });

// === Endpoints de Respostas ===
export const saveAnswer = (quizId, questionId, answerData, answerId) => {
  const method = answerId ? 'PUT' : 'POST';
  const endpoint = answerId
    ? `/quizzes/${quizId}/questions/${questionId}/answers/${answerId}`
    : `/quizzes/${quizId}/questions/${questionId}/answers`;
  return request(endpoint, { method, body: answerData });
};
export const deleteAnswer = (quizId, questionId, answerId) => request(`/quizzes/${quizId}/questions/${questionId}/answers/${answerId}`, { method: 'DELETE' });