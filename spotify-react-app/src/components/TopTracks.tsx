import { useState, useEffect } from "react";
import { spotifyApi, getSpotifyClient } from "../utils/spotify";
import { MaxInt, Track } from "@spotify/web-api-ts-sdk";

function TopTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<
    "short_term" | "medium_term" | "long_term"
  >("medium_term");

  useEffect(() => {
    async function fetchTopTracks() {
      setLoading(true);
      try {
        const spotify = getSpotifyClient();
        const limit: MaxInt<50> = 10;
        const data = await spotify.currentUser.topItems(
          "tracks",
          timeRange,
          limit,
        );

        console.log("data found");
        setTracks(data.items);
      } catch (err) {
        console.error("Error fetching top tracks:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopTracks();
  }, [timeRange]);

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading your top tracks...</div>;
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h2>Your Top Tracks</h2>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <button
            onClick={() => setTimeRange("short_term")}
            style={{
              padding: "8px 16px",
              backgroundColor:
                timeRange === "short_term" ? "#1DB954" : "#e0e0e0",
              color: timeRange === "short_term" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Last 4 Weeks
          </button>
          <button
            onClick={() => setTimeRange("medium_term")}
            style={{
              padding: "8px 16px",
              backgroundColor:
                timeRange === "medium_term" ? "#1DB954" : "#e0e0e0",
              color: timeRange === "medium_term" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setTimeRange("long_term")}
            style={{
              padding: "8px 16px",
              backgroundColor:
                timeRange === "long_term" ? "#1DB954" : "#e0e0e0",
              color: timeRange === "long_term" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            All Time
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {tracks.map((track, index) => (
          <div
            key={track.id}
            style={{
              display: "flex",
              gap: "1rem",
              padding: "1rem",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#1DB954",
                minWidth: "2rem",
              }}
            >
              {index + 1}
            </div>
            {track.album.images[2] && (
              <img
                src={track.album.images[2].url}
                alt={track.album.name}
                style={{ width: "64px", height: "64px", borderRadius: "4px" }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                {track.name}
              </div>
              <div style={{ color: "#666", fontSize: "0.9rem" }}>
                {track.artists.map((artist) => artist.name).join(", ")}
              </div>
              <div
                style={{
                  color: "#999",
                  fontSize: "0.85rem",
                  marginTop: "0.25rem",
                }}
              >
                {track.album.name}
              </div>
            </div>
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 12px",
                backgroundColor: "#1DB954",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "0.9rem",
              }}
            >
              Play
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopTracks;
