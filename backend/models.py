from django.db import models

# Create your models here.

class Profile(models.Model):
    """Общая информация о разработчике"""
    name = models.CharField(max_length=100, verbose_name="Имя")
    title = models.CharField(max_length=150, verbose_name="Позиция (Заголовок)")
    about = models.TextField(verbose_name="О себе")
    avatar = models.ImageField(upload_to="users/avatars/", blank=True, null=True, verbose_name="Фото")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    telegram = models.CharField(max_length=50, verbose_name="Telegram")
    github = models.URLField(verbose_name="GitHub")

    def __str__(self):
        return self.name

class Skill(models.Model):
    """Технический стек и навыки"""
    name = models.CharField(max_length=50, verbose_name="Название технологии")
    level = models.PositiveIntegerField(verbose_name="Уровень владения (%)")

    def __str__(self):
        return f"{self.name} ({self.level}%)"

class Project(models.Model):
    """Портфолио проектов"""
    title = models.CharField(max_length=150, verbose_name="Название проекта")
    description = models.TextField(verbose_name="Описание проекта")
    features = models.TextField(verbose_name="Что было сделано (через точку с запятой)")
    tech_stack = models.CharField(max_length=200, verbose_name="Стек технологий")
    test_coverage = models.PositiveIntegerField(blank=True, null=True, verbose_name="Покрытие тестами (%)")
    github_url = models.URLField(verbose_name="Ссылка на GitHub")
    image = models.ImageField(upload_to="catalog/image/", blank=True, null=True, verbose_name="Превью проекта")

    def __str__(self):
        return self.title