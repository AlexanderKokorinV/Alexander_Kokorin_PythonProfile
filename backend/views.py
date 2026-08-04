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

    def initialize_request(self, request, *args, **kwargs):
        # Этот метод срабатывает ДО того, как Django начнет читать базу данных
        init_request = super().initialize_request(request, *args, **kwargs)

        # Читаем язык из query-параметра ?lang=
        lang = init_request.query_params.get('lang', 'ru')

        # Жестко включаем язык для текущего запроса
        translation.activate(lang)
        return init_request

    def get(self, request):

        # Делаем запрос к БД (библиотека перевода подменит поля на лету)
        projects = Project.objects.all().order_by("id")  # Сначала новые проекты

        # Сериализуем данные
        serializer = ProjectSerializer(
            projects, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


def frontend_home(request):
    # Динамически строим путь от корня проекта, независимо от ОС
    html_path = os.path.join(settings.BASE_DIR, "frontend", "index.html")
    return render(request, html_path)
