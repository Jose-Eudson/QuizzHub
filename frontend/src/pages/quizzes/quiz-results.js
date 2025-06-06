document.addEventListener("DOMContentLoaded", () => {
    const resultDataString = localStorage.getItem('quizResult');
    
    if (resultDataString) {
        const resultData = JSON.parse(resultDataString);
        
        document.getElementById('correctAnswers').textContent = resultData.correctAnswers;
        document.getElementById('totalQuestions').textContent = resultData.totalQuestions;
        document.getElementById('score').textContent = resultData.score;
        
        const percentage = (resultData.correctAnswers / resultData.totalQuestions) * 100;
        const feedbackMessage = document.getElementById('feedbackMessage');
        
        if (percentage >= 80) {
            feedbackMessage.textContent = 'Excelente!';
        } else if (percentage >= 50) {
            feedbackMessage.textContent = 'Muito bem!';
        } else {
            feedbackMessage.textContent = 'Continue tentando!';
        }
        
        localStorage.removeItem('quizResult');
    } else {
        document.querySelector('main').innerHTML = `
            <h1 class="text-center">Nenhum resultado para exibir.</h1>
            <div class="text-center mt-4">
                <a href="player-quiz-list.html" class="btn btn-primary btn-lg">Ver Quizzes</a>
            </div>
        `;
    }
});