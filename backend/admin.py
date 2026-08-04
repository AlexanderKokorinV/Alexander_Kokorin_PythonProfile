from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import Profile, Skill, Project


@admin.register(Profile)
class ProfileAdmin(TranslationAdmin):
    pass


@admin.register(Skill)
class SkillAdmin(TranslationAdmin):
    pass


@admin.register(Project)
class ProjectAdmin(TranslationAdmin):
    pass
