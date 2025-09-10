# projects/admin.py
from django.contrib import admin
from .models import Project, ProjectMember

# Inline pour voir les membres directement dans un projet
class ProjectMemberInline(admin.TabularInline):
    model = ProjectMember
    extra = 0
    fields = ("user", "role")
    readonly_fields = ()
    show_change_link = True

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "description")
    search_fields = ("name", "owner__username")
    list_filter = ("owner",)
    inlines = [ProjectMemberInline]  # Affiche les membres dans le projet

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "project", "role")
    list_filter = ("role", "project")
    search_fields = ("user__username", "project__name")
