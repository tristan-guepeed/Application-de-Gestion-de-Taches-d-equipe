# project_gestion/tasks/tests/test_tasks.py
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from projects.models import Project, ProjectMember
from tasks.models import Task

User = get_user_model()

class TaskTests(APITestCase):
    def setUp(self):
        self.toto = User.objects.create_user(username="toto", password="toto")
        self.tata = User.objects.create_user(username="tata", password="tata")
        self.tutu = User.objects.create_user(username="tutu", password="tutu")

        self.project = Project.objects.create(name="Projet Toto", description="desc", owner=self.toto)
        ProjectMember.objects.create(project=self.project, user=self.toto, role="owner")
        ProjectMember.objects.create(project=self.project, user=self.tutu, role="manager")
        ProjectMember.objects.create(project=self.project, user=self.tata, role="member")

        self.task = Task.objects.create(
            project=self.project,
            title="Tâche 1",
            description="Description",
            created_by=self.toto,
        )
        self.task.assignees.set([self.tutu])

    # CREATE TASKS
    def test_create_task_success(self):
        self.client.force_authenticate(user=self.toto)
        data = {"project": self.project.id, "title": "Nouvelle tâche", "assignees": [self.tata.id]}
        response = self.client.post("/api/tasks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Nouvelle tâche")

    def test_create_task_not_member(self):
        user = User.objects.create_user(username="nonmember", password="123")
        self.client.force_authenticate(user=user)
        data = {"project": self.project.id, "title": "Hack", "assignees": []}
        response = self.client.post("/api/tasks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_task_missing_title(self):
        self.client.force_authenticate(user=self.toto)
        data = {"project": self.project.id, "assignees": [self.tata.id]}
        response = self.client.post("/api/tasks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_invalid_project(self):
        self.client.force_authenticate(user=self.toto)
        data = {"project": 9999, "title": "Invalid project", "assignees": []}
        response = self.client.post("/api/tasks/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # UPDATE TASKS
    def test_update_task_success(self):
        self.client.force_authenticate(user=self.toto)
        data = {"title": "Modifié"}
        response = self.client.patch(f"/api/tasks/{self.task.id}/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Modifié")

    def test_update_task_not_creator_or_owner(self):
        self.client.force_authenticate(user=self.tata)
        data = {"title": "Hack Attempt"}
        response = self.client.patch(f"/api/tasks/{self.task.id}/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_task_invalid_id(self):
        self.client.force_authenticate(user=self.toto)
        data = {"title": "Hack"}
        response = self.client.patch("/api/tasks/9999/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # DELETE TASKS
    def test_delete_task_success(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.delete(f"/api/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_task_not_creator_or_owner(self):
        self.client.force_authenticate(user=self.tata)
        response = self.client.delete(f"/api/tasks/{self.task.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_task_invalid_id(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.delete("/api/tasks/9999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # TASKS FILTERS
    def test_filter_tasks_by_project(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.get(f"/api/tasks/?project_id={self.project.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(t["project"] == self.project.id for t in response.data))

    def test_filter_tasks_by_status(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.get(f"/api/tasks/?status=TODO")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(t["status"] == "TODO" for t in response.data))

    def test_filter_tasks_by_assignee(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.get(f"/api/tasks/?assignee={self.tutu.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for t in response.data:
            self.assertIn(self.tutu.id, [a["id"] for a in t["assignees_info"]])

    def test_filter_tasks_by_priority(self):
        self.client.force_authenticate(user=self.toto)
        self.task.priority = "HIGH"
        self.task.save()
        response = self.client.get(f"/api/tasks/?priority=HIGH")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(t["priority"] == "HIGH" for t in response.data))
