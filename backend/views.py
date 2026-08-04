import os

from django.conf import settings
from django.shortcuts import render
from django.utils import translation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Profile, Skill, Project
from .serializers import ProfileSerializer, SkillSerializer, ProjectSerializer


class ProfileAPIView(APIView):
    """Эндпоинт для получения информации обо мне"""

    def get(self, request):
        # Берем первую (и единственную) запись профиля
        profile = Profile.objects.first()
        if not profile:
            return Response(
                {"detail": "Профиль не найден"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SkillListAPIView(APIView):
    """Эндпоинт для получения списка навыков"""

    def get(self, request):
        skills = Skill.objects.all().order_by("-level")  # Сортируем по убыванию навыка
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectListAPIView(APIView):
    """Эндпоинт для получения списка проектов портфолио"""

    def get(self, request):
        # 1. Читаем параметр ?lang= из URL. Если его нет, по умолчанию берем 'ru' (или 'en')
        lang = request.query_params.get('lang', 'ru')

        # 2. Принудительно включаем нужный язык для текущего потока запроса
        translation.activate(lang)

        # 3. Делаем запрос к БД (библиотека перевода подменит поля на лету)
        projects = Project.objects.all().order_by("id")  # Сначала новые проекты

        # 4. Сериализуем данные
        serializer = ProjectSerializer(
            projects, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


def frontend_home(request):
    # Динамически строим путь от корня проекта, независимо от ОС
    html_path = os.path.join(settings.BASE_DIR, "frontend", "index.html")
    return render(request, html_path)
