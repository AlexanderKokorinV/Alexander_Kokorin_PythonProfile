// 1. Инициализация языка вынесена на самый верх (в глобальную область видимости)
let currentLang = localStorage.getItem('site_lang') || 'ru';

// Словарь для статического текста на сайте
const translations = {
    ru: {
        'nav-home': 'Главная',
        'nav-about': 'Обо мне',
        'nav-stack': 'Стек',
        'nav-projects': 'Проекты',
        'nav-contacts': 'Контакты',
        'btn-more': 'Узнать больше',
        'btn-connect': 'Связаться',

         // Новые ключи для заголовков и подписей
        'section-about': 'Обо мне',
        'section-skills': 'Технический стек и навыки',
        'section-projects': 'Портфолио проектов',
        'section-contacts': 'Контакты',
        'label-location': 'Локация:',
        'label-education': 'Образование:',
        'val-location': 'Москва',
        'val-education': 'МГТУ им. Н.Э. Баумана',

        'section-skills': 'Технический стек и навыки',
        'section-projects': 'Портфолио проектов',
        'section-contacts': 'Контакты для связи',

        'project-features': 'Что реализовано:',
        'project-stack': 'Стек:',
        'project-code-btn': 'Исходный код',

        'footer-text': '© 2026 Александр Кокорин. Деплой автоматизирован через GitHub Actions в Yandex Cloud.'
    },
    en: {
        'nav-home': 'Home',
        'nav-about': 'About Me',
        'nav-stack': 'Tech Stack',
        'nav-projects': 'Projects',
        'nav-contacts': 'Contacts',
        'btn-more': 'Learn More',
        'btn-connect': 'Contact Me',

        // Переводы на английский
        'section-about': 'About Me',
        'section-skills': 'Technical Stack & Skills',
        'section-projects': 'My Projects',
        'section-contacts': 'Contacts',
        'label-location': 'Location:',
        'label-education': 'Education:',
        'val-location': 'Moscow',
        'val-education': 'Bauman Moscow State Technical University',

        'section-skills': 'Technical Stack & Skills',
        'section-projects': 'Project Portfolio',
        'section-contacts': 'Contact Details',

        'project-features': 'Key Features:',
        'project-stack': 'Tech Stack:',
        'project-code-btn': 'Source Code',

        'footer-text': '© 2026 Alexander Kokorin. Deployment automated via GitHub Actions in Yandex Cloud.'
    }
};

// Автоматический запуск после полной загрузки HTML
document.addEventListener("DOMContentLoaded", () => {
    updateLangButton(); // Обновляем кнопку при старте
    translateUI(); // Вызываем перевод интерфейса при старте

    // Передаем текущий язык во все функции при первой загрузке!
    loadProfile();
    loadSkills();
    loadProjects();

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            // Переключаем язык
            currentLang = currentLang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('site_lang', currentLang);

            updateLangButton();
            translateUI();

            // Перезагружаем данные из API
            loadProfile();
            loadSkills();
            loadProjects();
        });
    }
});

// 3. Функция для перевода статических элементов интерфейса
function translateUI() {
    const elements = document.querySelectorAll('[data-translate]');

    elements.forEach(element => {
        const key = element.getAttribute('data-translate');

        // Проверяем, существует ли перевод для этого ключа
        if (translations[currentLang] && translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        } else {
            console.warn(`Перевод для ключа "${key}" на языке "${currentLang}" не найден!`);
        }
    });
}

// 4. Функция обновления текста самой кнопки
function updateLangButton() {
    const langText = document.getElementById('lang-text');
    const langFlag = document.getElementById('lang-flag');

    if (!langText || !langFlag) return; // Защита от ошибок, если элементов нет на странице

    if (currentLang === 'ru') {
        langText.textContent = 'EN';
        langFlag.textContent = '🇬🇧'; // Если сайт на русском, кнопка предлагает переключить на английский
    } else {
        langText.textContent = 'RU';
        langFlag.textContent = '🇷🇺'; // Если сайт на английском, кнопка предлагает переключить на русский
    }
}

// ==========================================
// БЛОК ФУНКЦИЙ ЗАГРУЗКИ ДАННЫХ ИЗ API
// ==========================================

// Загрузка профиля (Блок "Обо мне" и "Главная")
async function loadProfile(currentLang = 'ru') {
    try {
        const response = await fetch('/api/v1/profile/');
        if (!response.ok) throw new Error('Ошибка загрузки профиля');

        const data = await response.json();

        // Заполняем данные на главной
        document.getElementById('hero-name').textContent = data[`name_${currentLang}`];
        document.getElementById('hero-title').innerText = data[`title_${currentLang}`];

        // Заполняем блок "Обо мне"
        document.getElementById('about-text').innerText = data[`about_${currentLang}`];

        // Если в БД загружена аватарка, меняем заглушку на реальное фото
        if (data.avatar) {
            document.getElementById('about-avatar').src = data.avatar;
        }

        // Настраиваем контакты в подвале
        document.getElementById('contact-phone').href = `tel:${data.phone}`;
        document.getElementById('contact-phone').innerHTML = `<i class="bi bi-telephone-fill me-2"></i>${data.phone}`;

        // Добавлен знак $ перед фигурной скобкой и косая черта /
        document.getElementById('contact-telegram').href = `https://t.me/${data.telegram.replace('@', '')}`;
        document.getElementById('contact-telegram').innerHTML = `<i class="bi bi-telegram me-2"></i>${data.telegram}`;

        document.getElementById('contact-email').href = `mailto:${data.email}`;
        document.getElementById('contact-email').innerHTML = `<i class="bi bi-envelope-fill me-2"></i>${data.email}`;

        document.getElementById('contact-github').href = data.github;
    } catch (error) {
        console.error(error);
    }
}

// Загрузка и рендеринг навыков (Прогресс-бары)
async function loadSkills(currentLang = 'ru') {
    try {
        const response = await fetch('/api/v1/skills/');
        if (!response.ok) throw new Error('Ошибка загрузки навыков');

        const skills = await response.json();
        const container = document.getElementById('skills-container');
        if (!container) return;
        container.innerHTML = ''; // Очищаем текст "Загрузка..."

        skills.forEach(skill => {
            // Если у вас в базе навыки тоже делятся по языкам, можно использовать динамическое поле, например skill[`name_${currentLang}`]
            const skillName = skill[`name_${currentLang}`] || skill.name;

            const skillHtml = `
                <div class="col">
                    <div class="d-flex justify-content-between mb-1 fw-semibold text-dark">
                        <span>${skillName}</span>
                        <span>${skill.level}%</span>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${skill.level}%" aria-valuenow="${skill.level}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            `;
            container.innerHTML += skillHtml;
        });
    } catch (error) {
        console.error(error);
    }
}

// Загрузка и рендеринг карточек проектов
async function loadProjects(currentLang = 'ru') {
    try {
        // 1. Делаем запрос к API с параметром языка
        const response = await fetch(`/api/v1/projects/?lang=${currentLang}`);

        // 2. Если сервер ответил ошибкой, выбрасываем исключение
        if (!response.ok) throw new Error('Ошибка загрузки проектов');

        // 3. Читаем JSON-данные ОДИН раз в переменную projects
        const projects = await response.json();

        // 4. Поиск контейнера на странице
        const container = document.getElementById('projects-container');
        if (!container) return;

        // Очищаем текст "Загрузка..."
        container.innerHTML = '';

        projects.forEach(project => {
            // Поддержка мультиязычности для описания и заголовков проектов (если настроено в Django)
            const projectTitle = project.title;
            const projectDesc = project.description;

            // Генерируем элементы списка для "Что было сделано"
            const featuresHtml = project.features_list ? project.features_list.map(feature => `<li>${feature}</li>`).join('') : '';

            // Проверяем наличие покрытия тестами
            const coverageBadge = project.test_coverage ? `<span class="badge bg-success position-absolute top-0 end-0 m-3 shadow-sm">Pytest: ${project.test_coverage}%</span>` : '';

            // 2. Логика формирования пути к изображению
            const projectImg = project.image
                ? project.image.replace('http://localhost/', '/')
                : 'https://placehold.co';

            // Создаем уникальный ID для каждой карточки, убирая пробелы и спецсимволы из названия
            const projectId = `project-collapse-${project.title.replace(/[^a-zA-Z0-9]/g, '')}`;

            const projectCard = `
                <div class="col">
                    <div class="card h-100 shadow-sm hover-shadow border-0 position-relative overflow-hidden">
                        ${coverageBadge}
                        <img src="${projectImg}" class="card-img-top" alt="${projectTitle}" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold text-dark">${projectTitle}</h5>
                            <p class="card-text text-secondary small flex-grow-1">${projectDesc}</p>

                            <!-- Новая компактная кнопка-ссылка для раскрытия списка -->
                            <div class="mb-2">
                                <button class="btn btn-link btn-sm p-0 text-decoration-none fw-bold text-primary d-flex align-items-center collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#${projectId}"
                                        aria-expanded="false"
                                        aria-controls="${projectId}">
                                    <i class="bi bi-chevron-down me-1"></i> ${translations[currentLang]['project-features']}
                                </button>
                            </div>

                            <!-- Сворачиваемый блок со списком -->
                            <div class="collapse" id="${projectId}">
                                <ul class="text-secondary small ps-3 mb-3">
                                    ${featuresHtml}
                                </ul>
                            </div>

                            <div class="mb-3 mt-2">
                                <span class="text-primary fw-semibold small">${translations[currentLang]['project-stack']}</span>
                                <span class="text-muted small">${project.tech_stack}</span>
                            </div>

                            <a href="${project.github_url}" target="_blank" class="btn btn-outline-dark btn-sm w-100 mt-auto">
                                <i class="bi bi-github me-2"></i>${translations[currentLang]['project-code-btn']}
                            </a>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += projectCard;
            // Находим только что созданную кнопку и блок collapse
            const currentBtn = container.querySelector(`[data-bs-target="#${projectId}"]`);
            const currentCollapse = document.getElementById(projectId);

            if (currentBtn && currentCollapse) {
                // Задаем иконке начальную плавность анимации прямо из JS
                const icon = currentBtn.querySelector('.bi-chevron-down');
                if (icon) icon.style.transition = 'transform 0.2s ease-in-out';

                // Слушаем событие открытия блока (Bootstrap сам генерирует событие 'show.bs.collapse')
                currentCollapse.addEventListener('show.bs.collapse', () => {
                    if (icon) icon.style.transform = 'rotate(180deg)';
                });

                // Слушаем событие закрытия блока ('hide.bs.collapse')
                currentCollapse.addEventListener('hide.bs.collapse', () => {
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
            }
        });
    } catch (error) {
        console.error(error);
    }
} // Теперь функция loadProjects закрывается строго здесь!