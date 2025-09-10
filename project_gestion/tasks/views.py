from rest_framework import viewsets, permissions
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsCreatorOrProjectOwner
from rest_framework.exceptions import PermissionDenied

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreatorOrProjectOwner]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.filter(
            project__members=user
        ) | Task.objects.filter(project__owner=user)

        project_id = self.request.query_params.get("project_id")
        status = self.request.query_params.get("status")
        assignee = self.request.query_params.get("assignee")
        priority = self.request.query_params.get("priority")

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if status:
            queryset = queryset.filter(status=status)
        if assignee:
            queryset = queryset.filter(assignees__id=assignee)
        if priority:
            queryset = queryset.filter(priority=priority)

        return queryset.distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]
        user = self.request.user
        if user != project.owner and not project.members.filter(id=user.id).exists():
            raise PermissionDenied("You must be a project member to create a task.")
        serializer.save(created_by=user)

