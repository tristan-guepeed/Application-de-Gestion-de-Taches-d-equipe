from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class UserTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="toto", password="toto")
        self.user2 = User.objects.create_user(username="tata", password="tata")

    # REGISTER TESTS
    def test_register_success(self):
        data = {"username": "tutu", "password": "tutu"}
        response = self.client.post("/api/users/register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="tutu").exists())

    def test_register_missing_username(self):
        data = {"password": "tutu"}
        response = self.client.post("/api/users/register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_password(self):
        data = {"username": "tutu"}
        response = self.client.post("/api/users/register/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # LOGIN TESTS
    def test_login_success(self):
        data = {"username": "toto", "password": "toto"}
        response = self.client.post("/api/users/token/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.json())
        self.assertIn("refresh", response.json())

    def test_login_wrong_password(self):
        data = {"username": "toto", "password": "wrong"}
        response = self.client.post("/api/users/token/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields(self):
        response = self.client.post("/api/users/token/", {"username": "toto"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # GET USERS TESTS
    def test_get_users_authenticated(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.json()), 2)

    def test_get_users_unauthenticated(self):
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
