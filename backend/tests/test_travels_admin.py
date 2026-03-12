async def test_add_visited_country(client, auth_cookies):
    response = await client.post(
        "/api/admin/travels",
        json={"name": "Brazil", "iso_numeric": "076"},
        cookies=auth_cookies,
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Brazil"


async def test_add_visited_country_duplicate(client, auth_cookies):
    payload = {"name": "Argentina", "iso_numeric": "032"}
    r1 = await client.post("/api/admin/travels", json=payload, cookies=auth_cookies)
    r2 = await client.post("/api/admin/travels", json=payload, cookies=auth_cookies)
    assert r1.status_code == 201
    assert r2.status_code == 409


async def test_add_wishlist_country_already_visited(client, auth_cookies):
    await client.post(
        "/api/admin/travels",
        json={"name": "Chile", "iso_numeric": "152"},
        cookies=auth_cookies,
    )
    response = await client.post(
        "/api/admin/travels/wishlist",
        json={"name": "Chile", "iso_numeric": "152"},
        cookies=auth_cookies,
    )
    assert response.status_code == 409


async def test_add_visited_country_already_in_wishlist(client, auth_cookies):
    await client.post(
        "/api/admin/travels/wishlist",
        json={"name": "Peru", "iso_numeric": "604"},
        cookies=auth_cookies,
    )
    response = await client.post(
        "/api/admin/travels",
        json={"name": "Peru", "iso_numeric": "604"},
        cookies=auth_cookies,
    )
    assert response.status_code == 409


async def test_delete_visited_country(client, auth_cookies):
    created = await client.post(
        "/api/admin/travels",
        json={"name": "Colombia", "iso_numeric": "170"},
        cookies=auth_cookies,
    )
    country_id = created.json()["id"]

    delete_response = await client.delete(f"/api/admin/travels/{country_id}", cookies=auth_cookies)
    assert delete_response.status_code == 204


async def test_delete_visited_country_nonexistent(client, auth_cookies):
    response = await client.delete("/api/admin/travels/99999", cookies=auth_cookies)
    assert response.status_code == 404
