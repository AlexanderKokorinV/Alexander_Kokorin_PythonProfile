from rest_framework import serializers
from .models import Profile, Skill, Project

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    """Преобразуем строку с фичами в массив строк для удобства фронтенда"""

    features_list = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'features_list', 'tech_stack', 'test_coverage', 'github_url', 'image']

    def get_features_list(self, obj):
        if obj.features:
            return [f.strip() for f in obj.features.split(';') if f.strip()]
        return []