from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from projects.models import Project

class ProjectTests(TestCase):
    def setUp(self):
        self.toto = User.objects.create_user(username="toto", password="toto")
        self.tata = User.objects.create_user(username="tata", password="tata")
        self.tutu = User.objects.create_user(username="tutu", password="tutu")
        self.test = User.objects.create_user(username="test", password="test")

        self.client = APIClient()

        self.client.force_authenticate(user=self.toto)
        project_data = {
            "name": "Projet Toto",
            "description": "Description Toto",
            "members": [
                {"id": self.tutu.id, "role": "manager"},
                {"id": self.test.id, "role": "member"}
            ]
        }
        response = self.client.post("/api/projects/", project_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.project = Project.objects.get(id=response.data["id"])

    # GET PROJECTS
    def test_get_projects_authenticated(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_get_projects_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # UPDATE PROJECTS
    def test_update_project_owner(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.patch(
            f"/api/projects/{self.project.id}/",
            {"name": "Projet Toto Updated"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.name, "Projet Toto Updated")

    def test_update_project_non_owner(self):
        self.client.force_authenticate(user=self.tata)
        response = self.client.patch(
            f"/api/projects/{self.project.id}/",
            {"name": "Hack Attempt"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # DELETE PROJECTS
    def test_delete_project_owner(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.delete(f"/api/projects/{self.project.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(id=self.project.id).exists())

    def test_delete_project_non_owner(self):
        self.client.force_authenticate(user=self.tutu)
        response = self.client.delete(f"/api/projects/{self.project.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # TRANSFER OWNERSHIP
    def test_transfer_ownership_success(self):
        self.client.force_authenticate(user=self.toto)
        data = {"new_owner_id": self.tutu.id}
        response = self.client.post(
            f"/api/projects/{self.project.id}/transfer_ownership/",
            data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.owner, self.tutu)

    def test_transfer_ownership_not_owner(self):
        self.client.force_authenticate(user=self.tata)
        data = {"new_owner_id": self.tutu.id}
        response = self.client.post(
            f"/api/projects/{self.project.id}/transfer_ownership/",
            data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_transfer_ownership_no_new_owner_id(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.post(
            f"/api/projects/{self.project.id}/transfer_ownership/",
            {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_transfer_ownership_user_not_member(self):
        self.client.force_authenticate(user=self.toto)
        data = {"new_owner_id": self.tata.id}
        response = self.client.post(
            f"/api/projects/{self.project.id}/transfer_ownership/",
            data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_transfer_ownership_user_not_found(self):
        self.client.force_authenticate(user=self.toto)
        data = {"new_owner_id": 9999}
        response = self.client.post(
            f"/api/projects/{self.project.id}/transfer_ownership/",
            data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # CREATE PROJECTS
    def test_create_project_missing_name(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.post(
            "/api/projects/",
            {"description": "No name"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_project_member_not_found(self):
        self.client.force_authenticate(user=self.toto)
        response = self.client.post(
            "/api/projects/",
            {
                "name": "Invalid member project",
                "members": [{"id": 9999, "role": "member"}]
            },
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
