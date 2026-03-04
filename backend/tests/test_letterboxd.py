from unittest.mock import AsyncMock, MagicMock, patch

import app.routers.letterboxd as lb_module
from app.routers.letterboxd import _parse_feed

SAMPLE_RSS = """<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:letterboxd="https://letterboxd.com">
  <channel>
    <item>
      <letterboxd:filmTitle>The Matrix</letterboxd:filmTitle>
      <letterboxd:filmYear>1999</letterboxd:filmYear>
      <letterboxd:memberRating>4.5</letterboxd:memberRating>
      <link>https://letterboxd.com/rawool7/film/the-matrix/</link>
      <description><![CDATA[<p><img src="https://a.ltximg.com/matrix.jpg" /></p>]]></description>
    </item>
    <item>
      <letterboxd:filmTitle>Inception</letterboxd:filmTitle>
      <letterboxd:filmYear>2010</letterboxd:filmYear>
      <letterboxd:memberRating>4.0</letterboxd:memberRating>
      <link>https://letterboxd.com/rawool7/film/inception/</link>
      <description><![CDATA[<p><img src="https://a.ltximg.com/inception.jpg" /></p>]]></description>
    </item>
    <item>
      <letterboxd:filmTitle>No Rating Film</letterboxd:filmTitle>
      <letterboxd:filmYear>2020</letterboxd:filmYear>
      <link>https://letterboxd.com/rawool7/film/no-rating/</link>
      <description></description>
    </item>
  </channel>
</rss>"""


def test_parse_feed_unit():
    films = _parse_feed(SAMPLE_RSS)
    assert len(films) == 2  # unrated item excluded
    assert films[0]["title"] == "The Matrix"
    assert films[0]["year"] == 1999
    assert films[0]["rating"] == 4.5
    assert films[0]["poster_url"] == "https://a.ltximg.com/matrix.jpg"
    assert films[1]["title"] == "Inception"
    assert films[1]["rating"] == 4.0


async def test_letterboxd_endpoint(client):
    lb_module._cache.clear()

    mock_response = MagicMock()
    mock_response.text = SAMPLE_RSS
    mock_response.raise_for_status = MagicMock()

    mock_client_instance = AsyncMock()
    mock_client_instance.get = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=False)

    with patch("app.routers.letterboxd.httpx.AsyncClient", return_value=mock_client_instance):
        response = await client.get("/api/letterboxd")

    assert response.status_code == 200
    films = response.json()
    assert len(films) == 2
    assert films[0]["title"] == "The Matrix"

    lb_module._cache.clear()
