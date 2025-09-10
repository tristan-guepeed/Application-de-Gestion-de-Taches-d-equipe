# tasks/admin.py
from django.contrib import admin
from .models import Task

class TaskAssigneesInline(admin.TabularInline):
    model = Task.assignees.through  # relation many-to-many
    extra = 0
    verbose_name = "Assignee"
    verbose_name_plural = "Assignees"

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "project", "status", "priority", "due_date", "created_by")
    list_filter = ("status", "priority", "project")
    search_fields = ("title", "project__name", "created_by__username")
    inlines = [TaskAssigneesInline]
