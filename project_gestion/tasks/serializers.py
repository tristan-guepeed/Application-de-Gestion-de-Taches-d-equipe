from rest_framework import serializers
from .models import Task
from django.contrib.auth.models import User

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]

class TaskSerializer(serializers.ModelSerializer):
    assignees = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    assignees_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "project", "title", "description", "status",
            "priority", "created_by", "assignees", "assignees_info","due_date",
            "completed_at"
        ]
        read_only_fields = ["created_by"]

    def get_assignees_info(self, obj):
        return [{"id": u.id, "username": u.username} for u in obj.assignees.all()]

    def create(self, validated_data):
        assignees_ids = validated_data.pop("assignees", [])
        task = Task.objects.create(**validated_data)
        users = User.objects.filter(id__in=assignees_ids)
        task.assignees.set(users)
        return task


    def update(self, instance, validated_data):
        assignees_ids = validated_data.pop("assignees", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if assignees_ids is not None:
            users = User.objects.filter(id__in=assignees_ids)
            instance.assignees.set(users)

        return instance
