from django.urls import path
from .views import ProfileAPIView, SkillListAPIView, ProjectListAPIView

urlpatterns = [
    path("profile/", ProfileAPIView.as_view(), name="api-profile"),
    path("skills/", SkillListAPIView.as_view(), name="api-skills"),
    path("projects/", ProjectListAPIView.as_view(), name="api-projects"),
]
