import pytest
from rest_framework.test import APIClient

# Create your tests here.


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_profile(db):
    # Создаем фейковый профиль в тестовой базе данных
    from django.apps import apps

    Profile = apps.get_model(app_label="backend", model_name="Profile")

    return Profile.objects.create(
        name_ru="Александр",
        name_en="Alexander",
        title_ru="Python-разработчик",
        title_en="Python Developer",
        about_ru="Обо мне",
        about_en="About me",
        email="test@test.com",
        phone="+79999999999",
        telegram="@alexander",
        github="https://github.com",
    )


@pytest.mark.django_db
def test_get_profile_status(api_client, create_profile):
    """Проверяем, что API профиля возвращает статус 200"""
    url = "/api/v1/profile/"  # ваш точный URL из urls.py
    response = api_client.get(url)
    assert response.status_code == 200


@pytest.mark.django_db
def test_profile_multilang_fields(api_client, create_profile):
    """Проверяем, что в ответе API присутствуют поля для обоих языков"""
    url = "/api/v1/profile/"
    response = api_client.get(url)
    data = response.json()

    # Если ваше API отдает список объектов, берем первый:
    if isinstance(data, list):
        data = data[0]

    # Проверяем, что поля отдаются в правильном формате, который ожидает наш app.js
    assert data["name_ru"] == "Александр"
    assert data["name_en"] == "Alexander"
    assert data["title_ru"] == "Python-разработчик"
    assert data["title_en"] == "Python Developer"
    assert data["about_ru"] == "Обо мне"
    assert data["about_en"] == "About me"
    assert data["email"] == "test@test.com"
    assert data["phone"] == "+79999999999"
    assert data["telegram"] == "@alexander"
    assert data["github"] == "https://github.com"


# ========================================================
# ТЕСТЫ ДЛЯ НАВЫКОВ (SKILLS)
# ========================================================
@pytest.fixture
def create_skill(db):
    """Фикстура для создания тестового навыка в БД"""
    from django.apps import apps

    # Замените 'api' на имя вашего Django-приложения, если оно отличается
    Skill = apps.get_model(app_label="backend", model_name="Skill")

    return Skill.objects.create(
        name="Python",  # Базовое имя (если используется в коде)
        name_ru="Python",  # Мультиязычное поле для RU
        name_en="Python",  # Мультиязычное поле для EN
        level=90,  # Процент владения навыком
    )


@pytest.mark.django_db
def test_get_skills_api(api_client, create_skill):
    """Проверяем доступность и структуру API навыков"""
    url = "/api/v1/skills/"
    response = api_client.get(url)

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)  # Эндпоинт должен возвращать список
    assert len(data) > 0

    # Проверяем наличие всех необходимых фронтенду полей
    first_skill = data[0]
    assert "name_ru" in first_skill
    assert "name_en" in first_skill
    assert "level" in first_skill
    assert first_skill["level"] == 90


# ========================================================
# ТЕСТЫ ДЛЯ ПРОЕКТОВ (PROJECTS)
# ========================================================
@pytest.fixture
def create_project(db):
    """Фикстура для создания тестового проекта в БД"""
    from django.apps import apps

    Project = apps.get_model(app_label="backend", model_name="Project")

    return Project.objects.create(
        title="LogiTrack SPA Service",
        title_ru="LogiTrack SPA LogiTrack SPA Service",
        title_en="LogiTrack SPA Service",
        description="Project description in English",
        description_ru="Описание проекта на русском",
        description_en="Project description in English",
        tech_stack="Django, PostgreSQL, Docker",
        github_url="https://github.com",
        test_coverage=94,
        features="Реализована авторизация; Добавлен Docker",  # Передаем строку через точку с запятой, как ожидает модель
    )


@pytest.mark.django_db
def test_get_projects_api(api_client, create_project):
    """Проверяем доступность и структуру API проектов"""
    url = "/api/v1/projects/"
    response = api_client.get(url)

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    first_project = data[0]
    # Проверяем чистые ключи title и description (без суффиксов _ru/_en)
    assert first_project["title"] == "LogiTrack SPA Service"
    assert first_project["description"] == "Project description in English"

    # Проверяем features_list, который сформировал сериализатор
    assert isinstance(first_project["features_list"], list)
    assert first_project["features_list"] == [
        "Реализована авторизация",
        "Добавлен Docker",
    ]

    # Проверяем остальные технические поля
    assert first_project["tech_stack"] == "Django, PostgreSQL, Docker"
    assert first_project["test_coverage"] == 94
