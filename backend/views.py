import os

from django.conf import settings
from django.shortcuts import render
from django.utils import translation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Profile, Skill, Project
from .serializers import ProfileSerializer, SkillSerializer, ProjectSerializer

LANG_CHOICES = {"ru", "en"}


def get_lang(request):
    """Безопасно читаем параметр ?lang= (допустимы только ru/en)."""
    lang = request.query_params.get("lang", "ru")
    return lang if lang in LANG_CHOICES else "ru"


class ProfileAPIView(APIView):
    """Эндпоинт для получения информации обо мне"""

    def get(self, request):
        # Берем первую (и единственную) запись профиля
        profile = Profile.objects.first()
        if not profile:
            return Response(
                {"detail": "Профиль не найден"}, status=status.HTTP_404_NOT_FOUND
            )

        lang = get_lang(request)
        # override активирует локаль только на время сериализации (без утечки по потокам)
        with translation.override(lang):
            serializer = ProfileSerializer(
                profile, context={"request": request, "lang": lang}
            )
        return Response(serializer.data, status=status.HTTP_200_OK)


class SkillListAPIView(APIView):
    """Эндпоинт для получения списка навыков"""

    def get(self, request):
        lang = get_lang(request)
        skills = Skill.objects.all().order_by("-level")  # Сортируем по убыванию навыка

        with translation.override(lang):
            serializer = SkillSerializer(
                skills, many=True, context={"request": request, "lang": lang}
            )
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectListAPIView(APIView):
    """Эндпоинт для получения списка проектов портфолио"""

    def get(self, request):
        lang = get_lang(request)
        # Сначала новые проекты
        projects = Project.objects.all().order_by("-id")

        with translation.override(lang):
            serializer = ProjectSerializer(
                projects, many=True, context={"request": request, "lang": lang}
            )
        return Response(serializer.data, status=status.HTTP_200_OK)


def frontend_home(request):
    # Динамически строим путь от корня проекта, независимо от ОС
    html_path = os.path.join(settings.BASE_DIR, "frontend", "index.html")
    return render(request, html_path)
