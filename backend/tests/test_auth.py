async def test_login_success(client, admin_user):
    response = await client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpassword"},
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies


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
        cookies={"access_token": "notavalidtoken"},
    )
    assert response.status_code == 401


async def test_protected_valid_token(client, auth_cookies):
    response = await client.get("/api/admin/posts", cookies=auth_cookies)
    assert response.status_code == 200


async def test_logout_clears_cookie(client, admin_user):
    login_response = await client.post(
        "/api/auth/login",
        json={"username": "testadmin", "password": "testpassword"},
    )
    assert login_response.status_code == 200
    logout_response = await client.post("/api/auth/logout")
    assert logout_response.status_code == 200
    assert logout_response.json()["message"] == "Logged out"


async def test_change_password_success(client, admin_user, auth_cookies):
    response = await client.put(
        "/api/admin/password",
        json={"current_password": "testpassword", "new_password": "newpassword123"},
        cookies=auth_cookies,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Password updated successfully"


async def test_change_password_wrong_current(client, admin_user, auth_cookies):
    response = await client.put(
        "/api/admin/password",
        json={"current_password": "wrongcurrent", "new_password": "newpassword123"},
        cookies=auth_cookies,
    )
    assert response.status_code == 400
