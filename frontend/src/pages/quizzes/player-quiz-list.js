document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login/login.component.html";
        return;
    }

    const API_BASE = 'http://localhost:3000/api';
    let allQuizzes = [];

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const difficultyFilter = document.getElementById("difficultyFilter");
    const container = document.getElementById("quizzesListContainer");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const noQuizzesMessage = document.getElementById("noQuizzesMessage");
    const noQuizzesText = document.getElementById("noQuizzesText");

    const showLoading = (show) => {
        loadingSpinner.style.display = show ? 'block' : 'none';
    };

    const renderQuizzes = (quizzes) => {
        container.innerHTML = '';
        if (quizzes.length === 0) {
            noQuizzesText.textContent = 'Nenhum quiz encontrado com os filtros aplicados.';
            noQuizzesMessage.style.display = 'block';
            return;
        }
        noQuizzesMessage.style.display = 'none';

        container.innerHTML = quizzes.map(quiz => {
            const timeInMinutes = quiz.time_limit ? Math.round(quiz.time_limit / 60) : 'N/A';
            const difficultyBadges = {
                'facil': 'success',
                'medio': 'warning',
                'dificil': 'danger'
            };
            const difficultyBadge = difficultyBadges[quiz.difficulty] || 'secondary';

            return `
            <div class="col-md-6 col-lg-4">
              <div class="card quiz-card h-100 shadow-sm">
                <div class="card-body d-flex flex-column">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${quiz.title}</h5>
                    <span class="badge bg-${difficultyBadge}">${quiz.difficulty || 'N/D'}</span>
                  </div>
                  <p class="card-text text-muted flex-grow-1">${quiz.description}</p>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <small class="text-muted">Por: ${quiz.creator_name}</small>
                    <small class="text-muted"><i class="bi bi-clock"></i> ${timeInMinutes} min</small>
                  </div>
                </div>
              </div>
            </div>
            `;
        }).join('');
    };

    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const difficulty = difficultyFilter.value;

        const filtered = allQuizzes.filter(quiz => {
            const quizCategory = quiz.category || '';
            const quizDifficulty = quiz.difficulty || '';
            const matchesSearch = quiz.title.toLowerCase().includes(searchTerm) || quiz.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !category || quizCategory === category;
            const matchesDifficulty = !difficulty || quizDifficulty === difficulty;
            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        renderQuizzes(filtered);
    };

    const loadQuizzes = async () => {
        try {
            showLoading(true);
            console.log("Buscando quizzes da API...");
            const response = await fetch(`${API_BASE}/quizzes`);
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            
            allQuizzes = await response.json();
            console.log("Quizzes recebidos:", allQuizzes);
            
            if (!Array.isArray(allQuizzes)) {
                throw new Error("A resposta da API não é uma lista (array).");
            }
            
            const categories = [...new Set(allQuizzes.map(q => q.category).filter(Boolean))];
            categoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
            categories.forEach(cat => {
                categoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
            });

            renderQuizzes(allQuizzes);

        } catch (error) {
            console.error("Falha detalhada ao carregar quizzes:", error);
            noQuizzesText.textContent = 'Falha ao carregar os quizzes. Verifique a conexão com o servidor.';
            noQuizzesMessage.style.display = 'block';
        } finally {
            showLoading(false);
        }
    };
    
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "../login/login.component.html";
    });
    
    searchInput.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    difficultyFilter.addEventListener("change", applyFilters);

    loadQuizzes();
});