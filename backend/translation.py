from modeltranslation.translator import register, TranslationOptions
from .models import Profile, Skill, Project


@register(Profile)
class ProfileTranslationOptions(TranslationOptions):
    fields = ("name", "title", "about")  # Поля профиля, которые будут переводиться


@register(Skill)
class SkillTranslationOptions(TranslationOptions):
    fields = ("name",)  # Название навыка


@register(Project)
class ProjectTranslationOptions(TranslationOptions):
    fields = (
        "title",
        "description",
        "features",
        "tech_stack",
    )  # Все текстовые поля проектов
