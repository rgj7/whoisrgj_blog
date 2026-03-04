async def test_login_success(client, admin_user):
    response = await client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


async def test_login_wrong_password(client, admin_user):
    response = await client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "wrongpassword"},
    )
    assert response.status_code == 401


async def test_login_unknown_user(client):
    response = await client.post(
        "/api/auth/login",
        json={"username": "nobody", "password": "whatever"},
    )
    assert response.status_code == 401


async def test_protected_no_token(client):
    response = await client.get("/api/admin/posts")
    assert response.status_code == 401


async def test_protected_bad_token(client):
    response = await client.get(
        "/api/admin/posts",
        headers={"Authorization": "Bearer notavalidtoken"},
    )
    assert response.status_code == 401


async def test_protected_valid_token(client, auth_headers):
    response = await client.get("/api/admin/posts", headers=auth_headers)
    assert response.status_code == 200


async def test_change_password_success(client, admin_user, auth_headers):
    response = await client.put(
        "/api/admin/password",
        json={"current_password": "testpassword", "new_password": "newpassword123"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password updated successfully"


async def test_change_password_wrong_current(client, admin_user, auth_headers):
    response = await client.put(
        "/api/admin/password",
        json={"current_password": "wrongcurrent", "new_password": "newpassword123"},
        headers=auth_headers,
    )
    assert response.status_code == 400
