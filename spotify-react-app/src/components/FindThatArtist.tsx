import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { getSpotifyClient } from "../utils/spotify";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { MaxInt, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";

type SongEntry = {
  trackName: string;
  playlistNames: string[];
  previewUrl: string | null;
  spotifyUrl: string;
};
type ArtistEntry = { artistId: string; songs: SongEntry[] };
type ArtistMap = Map<string, ArtistEntry>;
type ArtistDetails = {
  imageUrl: string | null;
  popularity: number;
  followers: number;
  spotifyUrl: string;
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) { return `${(n / 1_000_000).toFixed(1)}M followers`; }
  if (n >= 1_000) { return `${(n / 1_000).toFixed(1)}K followers`; }
  return `${n} followers`;
}

let activeAudio: HTMLAudioElement | null = null;
let activeSetPlaying: ((v: boolean) => void) | null = null;

function SongRow({ song }: { song: SongEntry }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (activeSetPlaying === setIsPlaying) {
        activeAudio?.pause();
        activeAudio = null;
        activeSetPlaying = null;
      }
    };
  }, []);

  function handlePlayClick() {
    if (isPlaying) {
      activeAudio?.pause();
      activeAudio = null;
      activeSetPlaying = null;
      setIsPlaying(false);
    } else {
      activeAudio?.pause();
      activeSetPlaying?.(false);

      if (!song.previewUrl) { return; }
      const audio = new Audio(song.previewUrl);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        activeAudio = null;
        activeSetPlaying = null;
      };
      activeAudio = audio;
      activeSetPlaying = setIsPlaying;
      setIsPlaying(true);
    }
  }

  return (
    <Box sx={{ py: 0.5, display: "flex", alignItems: "flex-start", gap: 1 }}>
      <Box
        component="button"
        onClick={handlePlayClick}
        disabled={!song.previewUrl}
        sx={{
          border: "none",
          background: "none",
          cursor: song.previewUrl ? "pointer" : "default",
          opacity: song.previewUrl ? 1 : 0.3,
          fontSize: 14,
          pt: 0.25,
          flexShrink: 0,
        }}
      >
        {isPlaying ? "⏸" : "▶"}
      </Box>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">{song.trackName}</Typography>
          <Typography
            component="a"
            href={song.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            variant="caption"
            sx={{ color: "primary.main", textDecoration: "none", flexShrink: 0 }}
          >
            ↗ Spotify
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {song.playlistNames.join(" · ")}
        </Typography>
      </Box>
    </Box>
  );
}

function PlaylistRow({
  playlist,
  isSelected,
  onToggle,
}: {
  playlist: SimplifiedPlaylist;
  isSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid size="auto">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onToggle(playlist.id, e.target.checked)}
          />
        </Grid>
        <Grid size={6}>
          <Typography>{playlist.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {playlist.owner.display_name ?? playlist.owner.id}
            {playlist.collaborative ? " · collaborative" : ""}
            {" · "}
            {playlist.tracks!.total} songs
          </Typography>
        </Grid>
      </Grid>
      <Divider />
    </Box>
  );
}

const ArtistRow = memo(function ArtistRow({
  artistName,
  artistId,
  songs,
  isExpanded,
  onToggle,
  songSortBy,
  index,
}: {
  artistName: string;
  artistId: string;
  songs: SongEntry[];
  isExpanded: boolean;
  onToggle: (name: string) => void;
  songSortBy: "name" | "playlist";
  index: number;
}) {
  const [details, setDetails] = useState<ArtistDetails | null>(null);

  useEffect(() => {
    if (!isExpanded || details) { return; }
    const spotify = getSpotifyClient();
    spotify.artists.get(artistId).then((artist) => {
      setDetails({
        imageUrl: artist.images[0]?.url ?? null,
        popularity: artist.popularity,
        followers: artist.followers.total,
        spotifyUrl: artist.external_urls.spotify,
      });
    }).catch((err) => console.error("Failed to fetch artist details", err));
  }, [isExpanded, artistId]);

  const sortedSongs = useMemo(() => {
    if (!isExpanded) { return []; }
    return [...songs].sort((a, b) =>
      songSortBy === "playlist"
        ? a.playlistNames[0].localeCompare(b.playlistNames[0])
        : a.trackName.localeCompare(b.trackName),
    );
  }, [songs, songSortBy, isExpanded]);

  return (
    <Box sx={{ bgcolor: index % 2 === 0 ? "transparent" : "action.hover" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", py: 1, cursor: "pointer", gap: 1, px: 1 }}
        onClick={() => onToggle(artistName)}
      >
        <Typography sx={{ flex: 1 }}>{artistName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {songs.length} {songs.length === 1 ? "song" : "songs"}
        </Typography>
        <Typography sx={{ ml: 1 }}>{isExpanded ? "▲" : "▼"}</Typography>
      </Box>
      {isExpanded && (
        <Box sx={{ pl: 2, pb: 2 }}>
          {details && (
            <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
              {details.imageUrl && (
                <Box
                  component="img"
                  src={details.imageUrl}
                  alt={artistName}
                  sx={{ width: 64, height: 64, borderRadius: 1, objectFit: "cover" }}
                />
              )}
              <Box>
                <Typography variant="body2">
                  Popularity: {details.popularity} / 100
                </Typography>
                <Typography variant="body2">
                  {formatFollowers(details.followers)}
                </Typography>
                <Typography variant="body2">
                  <a href={details.spotifyUrl} target="_blank" rel="noreferrer">
                    Open in Spotify
                  </a>
                </Typography>
              </Box>
            </Box>
          )}
          {sortedSongs.map((song) => (
            <SongRow key={song.trackName} song={song} />
          ))}
        </Box>
      )}
      <Divider />
    </Box>
  );
});

function FindThatArtist() {
  // Selection state
  const [allPlaylists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);
  const [shownPlaylists, setShownPlaylists] = useState<SimplifiedPlaylist[]>(
    [],
  );
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [includeFollowed, setIncludeFollowed] = useState<boolean>(true);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(
    new Set(),
  );
  const [playlistSearch, setPlaylistSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<"alpha" | "songs">("alpha");

  // Categorization state
  const [view, setView] = useState<"selection" | "categorization">("selection");
  const [artistMap, setArtistMap] = useState<ArtistMap>(new Map());
  const [categorizing, setCategorizing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [resultQuery, setResultQuery] = useState("");
  const [resultSortBy, setResultSortBy] = useState<"name" | "count">("count");
  const [songSortBy, setSongSortBy] = useState<"name" | "playlist">("name");
  const [expandedArtists, setExpandedArtists] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    async function getPlaylists() {
      setLoading(true);
      try {
        const spotify = getSpotifyClient();
        const userId = (await spotify.currentUser.profile()).id;
        setUserId(userId);

        let allPlaylists: SimplifiedPlaylist[] = [];
        let total = 0;
        let offset = 0;
        const limit: MaxInt<50> = 50;

        const initCall = await spotify.currentUser.playlists.playlists(
          limit,
          offset,
        );
        total = initCall.total;
        allPlaylists = [...initCall.items];

        while (allPlaylists.length < total) {
          offset += limit;
          const nextCall = await spotify.currentUser.playlists.playlists(
            limit,
            offset,
          );
          allPlaylists = [...allPlaylists, ...nextCall.items];
        }

        allPlaylists.sort((a, b) => a.name.localeCompare(b.name));
        setPlaylists(allPlaylists);
        setShownPlaylists(allPlaylists);
        setSelectedPlaylistIds(new Set(allPlaylists.map((p) => p.id)));
      } catch (error) {
        console.error("error setting up Find That Artist", error);
      } finally {
        setLoading(false);
      }
    }
    getPlaylists();
  }, []);

  function handlePlaylistToggle(id: string, checked: boolean) {
    setSelectedPlaylistIds((prev) => {
      const next = new Set(prev);
      if (checked) { next.add(id); }
      else { next.delete(id); }
      return next;
    });
  }

  function handleFollowedFilterChange(checked: boolean) {
    setIncludeFollowed(checked);
    if (checked) {
      setShownPlaylists(allPlaylists);
    } else {
      const owned = allPlaylists.filter((p) => p.owner.id === userId);
      setShownPlaylists(owned);
      setSelectedPlaylistIds((prev) => {
        const next = new Set(prev);
        allPlaylists
          .filter((p) => p.owner.id !== userId)
          .forEach((p) => next.delete(p.id));
        return next;
      });
    }
  }

  async function handleCategorize() {
    const selectedPlaylists = allPlaylists.filter((p) =>
      selectedPlaylistIds.has(p.id),
    );
    setCategorizing(true);
    setProgress({ done: 0, total: selectedPlaylists.length });
    const startTime = Date.now();
    const spotify = getSpotifyClient();
    const map: ArtistMap = new Map();
    let done = 0;

    async function fetchPlaylistTracks(playlist: SimplifiedPlaylist) {
      let offset = 0;
      const limit: MaxInt<50> = 50;
      let total = 0;

      do {
        const response = await spotify.playlists.getPlaylistItems(
          playlist.id,
          undefined,
          undefined,
          limit,
          offset,
        );
        total = response.total;

        for (const item of response.items) {
          if (!item.track || item.track.type !== "track") { continue; }
          const track = item.track as Track;
          for (const artist of track.artists) {
            const entry = map.get(artist.name) ?? { artistId: artist.id, songs: [] };
            const existing = entry.songs.find((e) => e.trackName === track.name);
            if (existing) {
              existing.playlistNames.push(playlist.name);
            } else {
              entry.songs.push({
                trackName: track.name,
                playlistNames: [playlist.name],
                previewUrl: track.preview_url ?? null,
                spotifyUrl: track.external_urls.spotify,
              });
            }
            map.set(artist.name, entry);
          }
        }

        offset += limit;
      } while (offset < total);

      done++;
      setProgress({ done, total: selectedPlaylists.length });
    }

    for (let i = 0; i < selectedPlaylists.length; i += 3) {
      const batch = selectedPlaylists.slice(i, i + 3);
      await Promise.all(batch.map((p) => fetchPlaylistTracks(p)));
    }

    setElapsedMs(Date.now() - startTime);
    setArtistMap(map);
    setCategorizing(false);
    setView("categorization");
  }

  const toggleArtistExpanded = useCallback((name: string) => {
    setExpandedArtists((prev) => {
      const next = new Set(prev);
      if (next.has(name)) { next.delete(name); }
      else next.add(name);
      return next;
    });
  }, []);

  const filteredArtists = useMemo(
    () =>
      [...artistMap.entries()]
        .filter(([name]) => name.toLowerCase().includes(resultQuery.toLowerCase()))
        .sort(([aName, aEntry], [bName, bEntry]) =>
          resultSortBy === "count"
            ? bEntry.songs.length - aEntry.songs.length
            : aName.localeCompare(bName),
        ),
    [artistMap, resultQuery, resultSortBy],
  );

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Preparing the system...</Typography>
      </Box>
    );
  }

  // --- Categorization view ---
  if (view === "categorization") {
    const totalSongs = [...artistMap.values()].reduce(
      (sum, entry) => sum + entry.songs.length,
      0,
    );
    const elapsed = elapsedMs != null ? (elapsedMs / 1000).toFixed(1) : "?";

    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setView("selection")}
          >
            ← Back
          </Button>
          <Typography variant="h6">Results</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {artistMap.size} artists · {totalSongs} songs · {elapsed}s
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            label="Search artist"
            value={resultQuery}
            onChange={(e) => setResultQuery(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <ToggleButtonGroup
            value={resultSortBy}
            exclusive
            onChange={(_, val) => val && setResultSortBy(val)}
            size="small"
          >
            <ToggleButton value="count"># Songs</ToggleButton>
            <ToggleButton value="name">A–Z</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">Sort songs by:</Typography>
          <ToggleButtonGroup
            value={songSortBy}
            exclusive
            onChange={(_, val) => val && setSongSortBy(val)}
            size="small"
          >
            <ToggleButton value="name">A–Z</ToggleButton>
            <ToggleButton value="playlist">Playlist</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {filteredArtists.map(([artistName, entry], index) => (
          <ArtistRow
            key={artistName}
            artistName={artistName}
            artistId={entry.artistId}
            songs={entry.songs}
            isExpanded={expandedArtists.has(artistName)}
            onToggle={toggleArtistExpanded}
            songSortBy={songSortBy}
            index={index}
          />
        ))}
      </Box>
    );
  }

  // --- Selection view ---
  function sortPlaylists(list: SimplifiedPlaylist[]) {
    return [...list].sort((a, b) =>
      sortBy === "songs"
        ? b.tracks!.total - a.tracks!.total
        : a.name.localeCompare(b.name),
    );
  }

  const playlistSearchLower = playlistSearch.toLowerCase();
  const visiblePlaylists = playlistSearch
    ? shownPlaylists.filter((p) =>
        p.name.toLowerCase().includes(playlistSearchLower),
      )
    : shownPlaylists;
  const selectedShown = sortPlaylists(
    visiblePlaylists.filter((p) => selectedPlaylistIds.has(p.id)),
  );
  const unselectedShown = sortPlaylists(
    visiblePlaylists.filter((p) => !selectedPlaylistIds.has(p.id)),
  );
  const allShownSelected =
    shownPlaylists.length > 0 && unselectedShown.length === 0;
  const someShownSelected = selectedShown.length > 0 && !allShownSelected;

  function handleSelectAll(checked: boolean) {
    setSelectedPlaylistIds((prev) => {
      const next = new Set(prev);
      shownPlaylists.forEach((p) =>
        checked ? next.add(p.id) : next.delete(p.id),
      );
      return next;
    });
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Select Playlists
      </Typography>

      <Box sx={{ mb: 2 }}>
        {categorizing ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Scanning playlist {progress.done} of {progress.total}...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(progress.done / progress.total) * 100}
            />
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={handleCategorize}
            disabled={selectedPlaylistIds.size === 0}
          >
            Categorize ({selectedPlaylistIds.size} playlists)
          </Button>
        )}
      </Box>

      <TextField
        label="Filter playlists"
        value={playlistSearch}
        onChange={(e) => setPlaylistSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      />

      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Grid size="auto">
          <FormControlLabel
            control={
              <Checkbox
                checked={allShownSelected}
                indeterminate={someShownSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label="Select All"
          />
        </Grid>
        <Grid size="auto">
          <FormControlLabel
            control={
              <Checkbox
                checked={includeFollowed}
                onChange={(e) => handleFollowedFilterChange(e.target.checked)}
              />
            }
            label="Include Followed Playlists"
          />
        </Grid>
        <Grid size="auto">
          <ToggleButtonGroup
            value={sortBy}
            exclusive
            onChange={(_, val) => val && setSortBy(val)}
            size="small"
          >
            <ToggleButton value="alpha">A–Z</ToggleButton>
            <ToggleButton value="songs"># Songs</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid size="grow">
          <Typography align="right">
            {selectedPlaylistIds.size} / {shownPlaylists.length} selected
          </Typography>
        </Grid>
      </Grid>

      {selectedShown.map((playlist) => (
        <PlaylistRow
          key={playlist.id}
          playlist={playlist}
          isSelected={true}
          onToggle={handlePlaylistToggle}
        />
      ))}

      {selectedShown.length > 0 && unselectedShown.length > 0 && (
        <Divider sx={{ my: 2, borderStyle: "dashed" }} />
      )}

      {unselectedShown.map((playlist) => (
        <PlaylistRow
          key={playlist.id}
          playlist={playlist}
          isSelected={false}
          onToggle={handlePlaylistToggle}
        />
      ))}
    </Box>
  );
}

export default FindThatArtist;
