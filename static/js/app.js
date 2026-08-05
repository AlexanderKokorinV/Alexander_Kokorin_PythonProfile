// Функция защиты от XSS (экранирование спецсимволов)
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Проверка, что ссылка ведёт на внешний http(s) ресурс, а не на javascript:
function isSafeUrl(url) {
    return /^https?:\/\//i.test(url || '');
}

// 1. Инициализация языка вынесена на самый верх (в глобальную область видимости)
let currentLang = localStorage.getItem('lang') || 'ru';

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
        'section-projects': 'Project Portfolio',
        'section-contacts': 'Contacts',
        'label-location': 'Location:',
        'label-education': 'Education:',
        'val-location': 'Moscow',
        'val-education': 'Bauman Moscow State Technical University',

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

    // Передаем текущий язык во все функции при первой загрузке
    loadProfile(currentLang);
    loadSkills(currentLang);
    loadProjects(currentLang);

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            // Переключаем язык
            currentLang = currentLang === 'ru' ? 'en' : 'ru';
            localStorage.setItem('lang', currentLang);

            updateLangButton();
            translateUI();

            // Перезагружаем данные из API
            loadProfile(currentLang);
            loadSkills(currentLang);
            loadProjects(currentLang);
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
async function loadProfile(lang = 'ru') {
    try {
        const response = await fetch(`/api/v1/profile/?lang=${lang}`);
        if (!response.ok) throw new Error('Ошибка загрузки профиля');

        const data = await response.json();

        // Заполняем данные на главной
        const heroName = document.getElementById('hero-name');
        const heroTitle = document.getElementById('hero-title');
        const aboutText = document.getElementById('about-text');
        const aboutAvatar = document.getElementById('about-avatar');

        if (heroName) heroName.textContent = data[`name_${lang}`];
        if (heroTitle) heroTitle.textContent = data[`title_${lang}`];

        // Заполняем блок "Обо мне"
        if (aboutText) aboutText.textContent = data[`about_${lang}`];

        // Если в БД загружена аватарка, меняем заглушку на реальное фото
        if (data.avatar && aboutAvatar) {
            aboutAvatar.src = data.avatar;
        }

        // Настраиваем контакты в подвале
        const contactPhone = document.getElementById('contact-phone');
        const contactTelegram = document.getElementById('contact-telegram');
        const contactEmail = document.getElementById('contact-email');
        const contactGithub = document.getElementById('contact-github');

        if (contactPhone && data.phone) {
            contactPhone.href = `tel:${escapeHTML(data.phone)}`;
            contactPhone.innerHTML = `<i class="bi bi-telephone-fill me-2"></i>${escapeHTML(data.phone)}`;
        }

        if (contactTelegram && data.telegram) {
            contactTelegram.href = `https://t.me/${escapeHTML(data.telegram.replace('@', ''))}`;
            contactTelegram.innerHTML = `<i class="bi bi-telegram me-2"></i>${escapeHTML(data.telegram)}`;
        }

        if (contactEmail && data.email) {
            contactEmail.href = `mailto:${escapeHTML(data.email)}`;
            contactEmail.innerHTML = `<i class="bi bi-envelope-fill me-2"></i>${escapeHTML(data.email)}`;
        }

        if (contactGithub && isSafeUrl(data.github)) {
            contactGithub.href = data.github;
        }
    } catch (error) {
        console.error('Ошибка в loadProfile:', error);
    }
}

// Загрузка и рендеринг навыков (Прогресс-бары)
async function loadSkills(lang = 'ru') {
    try {
        const response = await fetch(`/api/v1/skills/?lang=${lang}`);
        if (!response.ok) throw new Error('Ошибка загрузки навыков');

        const skills = await response.json();
        const container = document.getElementById('skills-container');
        if (!container) return;

        // Собираем HTML в одну строку и вставляем один раз
        const skillsHtml = skills.map(skill => {
            const skillName = escapeHTML(skill[`name_${lang}`] || skill.name || '');
            const level = escapeHTML(skill.level || 0);

            return `
                <div class="col">
                    <div class="d-flex justify-content-between mb-1 fw-semibold text-dark">
                        <span>${skillName}</span>
                        <span>${level}%</span>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar bg-primary" role="progressbar" style="width: ${level}%" aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = skillsHtml;
    } catch (error) {
        console.error('Ошибка в loadSkills:', error);
    }
}

// Загрузка и рендеринг карточек проектов
async function loadProjects(lang = 'ru') {
    try {
        // 1. Делаем запрос к API с параметром языка
        const response = await fetch(`/api/v1/projects/?lang=${lang}`);

        // 2. Если сервер ответил ошибкой, выбрасываем исключение
        if (!response.ok) throw new Error('Ошибка загрузки проектов');

        // 3. Читаем JSON-данные ОДИН раз в переменную projects
        const projects = await response.json();

        // 4. Поиск контейнера на странице
        const container = document.getElementById('projects-container');
        if (!container) return;

        // 5. Создаем переменную-аккумулятор для сбора HTML всех карточек
        let cardsHtml = '';

        projects.forEach(project => {
            // Уникальный ID: приоритет у id из БД, иначе от заголовка (без спецсимволов)
            const rawId = project.id ?? project.title ?? '';
            const projectId = `project-${String(rawId).replace(/[^a-zA-Z0-9_-]/g, '') || 'untitled'}`;

            // 1. Безопасная обработка URL картинки:
            // Регулярное выражение удаляет http(s):// и любой домен/порт, оставляя путь от корня.
            // Если картинки нет — показываем нейтральную SVG-заглушку (не требует файла).
            const placeholderSvg =
                'data:image/svg+xml;charset=utf-8,' +
                encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">' +
                    '<rect width="800" height="450" fill="#e9ecef"/>' +
                    '<text x="400" y="230" font-family="Arial" font-size="28" fill="#adb5bd" text-anchor="middle">No Image</text>' +
                    '</svg>'
                );
            let imgUrl = placeholderSvg;
            if (project.image) {
                imgUrl = project.image.replace(/^https?:\/\/[^\/]+/, '');
            }

            // 2. Безопасное экранирование всех текстовых полей от XSS (Пункт 4)
            const title = escapeHTML(project.title || 'Без названия');
            const description = escapeHTML(project.description || '');
            const techStack = escapeHTML(project.tech_stack || '');
            const techChips = (project.tech_stack || '')
                .split(',')
                .filter(t => t.trim())
                .map(t => `<span class="badge bg-secondary me-1">${escapeHTML(t.trim())}</span>`)
                .join(' ');

            // Покрытие тестами: показываем только если есть значение
            const coverageHtml = project.test_coverage
                ? `<span class="badge bg-success position-absolute top-0 end-0 m-3 shadow-sm">Pytest: ${escapeHTML(project.test_coverage)}%</span>`
                : '';

            // Ссылка на GitHub: только безопасный URL
            const githubUrl = isSafeUrl(project.github_url) ? project.github_url : '#';

            // Формируем безопасный список фич
            let featuresHtml = '';
            if (project.features_list && Array.isArray(project.features_list)) {
                featuresHtml = project.features_list
                    .map(f => `<li class="mb-1">${escapeHTML(f)}</li>`)
                    .join('');
            }

            // Собираем шаблон (переменные подставляются уже экранированными)
            const projectCard = `
                <div class="card mb-4 shadow-sm position-relative overflow-hidden">
                    ${coverageHtml}
                    <img src="${escapeHTML(imgUrl)}" class="card-img-top" alt="${title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${title}</h5>
                        <p class="card-text text-muted project-description">${description}</p>
                        <div class="mb-2"><strong>${translations[currentLang]['project-stack']}</strong><br><span class="d-flex flex-wrap gap-1">${techChips}</span></div>
                        <p class="mb-3"><a href="${githubUrl}" target="_blank" class="btn btn-outline-dark btn-sm"><i class="bi bi-github me-2"></i>${translations[currentLang]['project-code-btn']}</a></p>

                        <button class="btn btn-link btn-sm p-0 text-decoration-none fw-bold text-primary d-flex align-items-center collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#${projectId}"
                                aria-expanded="false"
                                aria-controls="${projectId}">
                            <i class="bi bi-chevron-down me-1"></i> ${translations[currentLang]['project-features']}
                        </button>

                        <div class="collapse mt-2" id="${projectId}">
                            <ul class="ps-3 mb-0 text-muted">
                                ${featuresHtml}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
            cardsHtml += projectCard;
        });

        // Вставляем весь безопасный HTML за один раз (Пункт 2)
        container.innerHTML = cardsHtml;

        // Навешиваем слушатели на стрелочки Bootstrap
        projects.forEach(project => {
            const projectId = `project-${project.id}`;
            const currentBtn = container.querySelector(`[data-bs-target="#${projectId}"]`);
            const currentCollapse = document.getElementById(projectId);

            if (currentBtn && currentCollapse) {
                const icon = currentBtn.querySelector('.bi-chevron-down');
                if (icon) icon.style.transition = 'transform 0.2s ease-in-out';

                // Слушаем событие открытия спойлера
                currentCollapse.addEventListener('show.bs.collapse', () => {
                    if (icon) icon.style.transform = 'rotate(180deg)';
                });

                // Слушаем событие закрытия спойлера
                currentCollapse.addEventListener('hide.bs.collapse', () => {
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
            }
        });

    } catch (error) {
        console.error('Ошибка в loadProjects:', error);
    }
}
