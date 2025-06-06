document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/login.component.html";
        return;
    }

    const API_BASE = 'http://localhost:3000/api';
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('quizId');

    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    let timerInterval;

    const quizTitleNav = document.getElementById("quizTitleNav");
    const questionTextEl = document.getElementById("questionText");
    const answerOptionsEl = document.getElementById("answerOptions");
    const nextQuestionButton = document.getElementById("nextQuestionButton");
    const finishQuizButton = document.getElementById("finishQuizButton");
    const progressIndicator = document.getElementById("progressIndicator");
    const quizArea = document.getElementById("quizArea");
    const timerDisplay = document.getElementById("timerDisplay");
    const loadingSpinner = document.getElementById("loadingSpinnerQuiz");

    const startTimer = (duration) => {
        let timer = duration;
        timerDisplay.textContent = `Tempo: ${timer}`;
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = `Tempo: ${timer}`;
            if (timer <= 0) {
                clearInterval(timerInterval);
                goToNextQuestion();
            }
        }, 1000);
    };

    const renderQuestion = () => {
        const question = questions[currentQuestionIndex];
        questionTextEl.textContent = question.question_text;
        answerOptionsEl.innerHTML = '';
        
        question.answers.forEach(answer => {
            answerOptionsEl.innerHTML += `
              <div class="list-group-item player-answer-option" data-answer-id="${answer.id}">
                ${answer.answer_text}
              </div>
            `;
        });
        
        document.querySelectorAll('.player-answer-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.player-answer-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        progressIndicator.textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
        if (currentQuestionIndex === questions.length - 1) {
            nextQuestionButton.style.display = 'none';
            finishQuizButton.style.display = 'block';
        } else {
            nextQuestionButton.style.display = 'block';
            finishQuizButton.style.display = 'none';
        }
        
        startTimer(question.time_limit || 30);
    };

    const goToNextQuestion = () => {
        const selectedOption = document.querySelector('.player-answer-option.selected');
        const answerId = selectedOption ? parseInt(selectedOption.dataset.answerId) : null;
        userAnswers.push({ questionId: questions[currentQuestionIndex].id, answerId });

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            finishQuiz();
        }
    };
    
    const finishQuiz = () => {
        clearInterval(timerInterval);
        let correctAnswersCount = 0;
        
        userAnswers.forEach((userAnswer, index) => {
            const question = questions[index];
            const correctAnswer = question.answers.find(a => a.is_correct);
            if (correctAnswer && userAnswer.answerId === correctAnswer.id) {
                correctAnswersCount++;
                score += question.points || 10;
            }
        });

        const resultData = {
            score,
            correctAnswers: correctAnswersCount,
            totalQuestions: questions.length
        };
        
        localStorage.setItem('quizResult', JSON.stringify(resultData));
        window.location.href = 'quiz-results.html';
    };

    const loadQuizData = async () => {
        if (!quizId) {
            quizArea.innerHTML = '<div class="alert alert-danger">ID do Quiz não fornecido.</div>';
            return;
        }

        try {
            loadingSpinner.style.display = 'block';
            quizArea.style.display = 'none';
            
            const quizResponse = await fetch(`${API_BASE}/quizzes/${quizId}`);
            const quizData = await quizResponse.json();
            quizTitleNav.textContent = `Quiz: ${quizData.title}`;

            const questionsResponse = await fetch(`${API_BASE}/quizzes/${quizId}/perguntas`);
            const questionsData = await questionsResponse.json();
            
            if (questionsData.length > 0) {
                for (let question of questionsData) {
                    const answersResponse = await fetch(`${API_BASE}/quizzes/perguntas/${question.id}/respostas`);
                    question.answers = await answersResponse.json();
                }
                questions = questionsData;
                quizArea.style.display = 'block';
                renderQuestion();
            } else {
                quizArea.style.display = 'block';
                quizArea.innerHTML = '<div class="alert alert-warning text-center">Este quiz ainda não tem perguntas.</div>';
            }
        } catch (error) {
            console.error('Erro ao carregar o quiz:', error);
            quizArea.style.display = 'block';
            quizArea.innerHTML = '<div class="alert alert-danger text-center">Não foi possível carregar o quiz. Verifique a conexão com o servidor e tente novamente.</div>';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    };

    nextQuestionButton.addEventListener('click', goToNextQuestion);
    finishQuizButton.addEventListener('click', finishQuiz);

    loadQuizData();
});