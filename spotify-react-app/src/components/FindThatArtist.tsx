import { useState, useEffect } from "react";
import { getSpotifyClient } from "../utils/spotify";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { MaxInt, SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";

function FindThatArtist() {
  const [allPlaylists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);
  const [shownPlaylists, setShownPlaylists] = useState<SimplifiedPlaylist[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [includeFollowed, setIncludeFollowed] = useState<boolean>(true);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  const [artistQuery, setArtistQuery] = useState<string>("");

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
        let limit: MaxInt<50> = 50;

        const initCall = await spotify.currentUser.playlists.playlists(limit, offset);
        total = initCall.total;
        allPlaylists = [...initCall.items];

        while (allPlaylists.length < total) {
          offset += limit;
          const nextCall = await spotify.currentUser.playlists.playlists(limit, offset);
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
      if (checked) next.add(id);
      else next.delete(id);
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

  if (loading) {
    return (
      <Box>
        <Typography>Preparing the system...</Typography>
      </Box>
    );
  }

  const selectedShown = shownPlaylists.filter((p) => selectedPlaylistIds.has(p.id));
  const unselectedShown = shownPlaylists.filter((p) => !selectedPlaylistIds.has(p.id));
  const allShownSelected = shownPlaylists.length > 0 && unselectedShown.length === 0;
  const someShownSelected = selectedShown.length > 0 && !allShownSelected;

  function handleSelectAll(checked: boolean) {
    setSelectedPlaylistIds((prev) => {
      const next = new Set(prev);
      shownPlaylists.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)));
      return next;
    });
  }

  function PlaylistRow({ playlist }: { playlist: SimplifiedPlaylist }) {
    return (
      <Box key={playlist.id}>
        <Grid container spacing={2} alignItems="center">
          <Grid size="auto">
            <Checkbox
              checked={selectedPlaylistIds.has(playlist.id)}
              onChange={(e) => handlePlaylistToggle(playlist.id, e.target.checked)}
            />
          </Grid>
          <Grid size={6}>
            <Typography>{playlist.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {playlist.owner.display_name ?? playlist.owner.id}
              {playlist.collaborative ? " · collaborative" : ""}
            </Typography>
          </Grid>
        </Grid>
        <Divider />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Search by artist"
        value={artistQuery}
        onChange={(e) => setArtistQuery(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      />

      <Divider sx={{ mb: 2 }} />

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
        <Grid size="grow">
          <Typography align="right">
            {selectedPlaylistIds.size} / {shownPlaylists.length} selected
          </Typography>
        </Grid>
      </Grid>

      {selectedShown.map((playlist) => (
        <PlaylistRow key={playlist.id} playlist={playlist} />
      ))}

      {selectedShown.length > 0 && unselectedShown.length > 0 && (
        <Divider sx={{ my: 2, borderStyle: "dashed" }} />
      )}

      {unselectedShown.map((playlist) => (
        <PlaylistRow key={playlist.id} playlist={playlist} />
      ))}
    </Box>
  );
}

export default FindThatArtist;
