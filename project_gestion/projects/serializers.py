from django.shortcuts import get_object_or_404
from rest_framework import serializers
from .models import Project, ProjectMember
from django.contrib.auth.models import User

class ProjectMemberInputSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=[("member", "member"), ("manager", "manager")], default="member")

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ["id", "user", "role"]

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    members = ProjectMemberInputSerializer(many=True, write_only=True, required=False)
    members_info = ProjectMemberSerializer(source="projectmember_set", many=True, read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "description", "owner", "members", "members_info", "created_at", "updated_at"]

    def create(self, validated_data):
        members_data = validated_data.pop("members", [])
        project = Project.objects.create(owner=self.context["request"].user, **validated_data)

        ProjectMember.objects.create(project=project, user=self.context["request"].user, role="owner")

        for member_data in members_data:
            user = get_object_or_404(User, id=member_data["id"])
            ProjectMember.objects.create(
                project=project,
                user=user,
                role=member_data.get("role", "member")
            )

        return project
    

    def update(self, instance, validated_data):
        members_data = validated_data.pop("members", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if members_data is not None:
            for member_data in members_data:
                user = User.objects.get(id=member_data["id"])
                project_member, created = ProjectMember.objects.update_or_create(
                    project=instance,
                    user=user,
                    defaults={"role": member_data.get("role", "member")},
                )
            current_ids = [m["id"] for m in members_data]
            ProjectMember.objects.filter(project=instance).exclude(user__id__in=current_ids).exclude(role="owner").delete()

        return instance

