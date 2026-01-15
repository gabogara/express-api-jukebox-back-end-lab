require("dotenv").config();

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`);
  const data = await res.json();

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // buffer 60s
  return cachedToken;
}

async function searchTrack(title, artist) {
  const token = await getAccessToken();
  const q = encodeURIComponent(`${title} artist:${artist}`);
  const url = `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Spotify search error: ${res.status}`);
  const data = await res.json();

  const item = data?.tracks?.items?.[0];
  if (!item) return { coverArtUrl: null, soundClipUrl: null };

  return {
    coverArtUrl: item.album?.images?.[0]?.url ?? null,
    soundClipUrl: item.preview_url ?? null,
  };
}

module.exports = { searchTrack };
