# projects/admin.py
from django.contrib import admin
from .models import Project, ProjectMember

class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "project", "role")
    list_filter = ("role", "project")
    search_fields = ("user__username", "project__name")

admin.site.register(ProjectMember, ProjectMemberAdmin)
