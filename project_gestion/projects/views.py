# projects/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from .models import Project, ProjectMember
from .serializers import ProjectMemberSerializer, ProjectSerializer
from .permissions import IsOwnerOrReadOnly
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        return (Project.objects.filter(owner=user) | Project.objects.filter(members=user)).distinct()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def transfer_ownership(self, request, pk=None):
        project = self.get_object()

        if project.owner != request.user:
            return Response({"detail": "Only the owner can transfer ownership."}, status=status.HTTP_403_FORBIDDEN)

        new_owner_id = request.data.get("new_owner_id")
        if not new_owner_id:
            return Response({"detail": "new_owner_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_owner = User.objects.get(id=new_owner_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if not ProjectMember.objects.filter(project=project, user=new_owner).exists():
            return Response({"detail": "User must be a member of the project to become owner."}, status=status.HTTP_400_BAD_REQUEST)

        project.owner = new_owner
        project.save()

        ProjectMember.objects.filter(project=project, user=request.user).update(role="member")
        ProjectMember.objects.filter(project=project, user=new_owner).update(role="owner")

        return Response({"detail": f"Ownership transferred to {new_owner.username}."})


class ProjectMemberViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get("project_id")
        return ProjectMember.objects.filter(project_id=project_id)
