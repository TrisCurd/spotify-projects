import { useState, useEffect, use } from "react";
import { getSpotifyClient } from "../utils/spotify";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { MaxInt, SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
function FindThatArtist() {
  /**
   * @type {[SimplifiedPlaylist[], Function]}
   */
  const [allPlaylists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);
  const [shownPlaylists, setShownPlaylists] = useState<SimplifiedPlaylist[]>(
    [],
  );
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [includeFollowed, setIncludeFollowed] = useState<boolean>(true);
  //get playlists
  useEffect(() => {
    //run get playlists
    async function getPlaylists() {
      setLoading(true);
      try {
        const spotify = getSpotifyClient();

        const userId = (await spotify.currentUser.profile()).id;
        setUserId(userId);

        //get all playlists with the iterator
        let allPlaylists: SimplifiedPlaylist[] = [];
        let total = 0;
        let offset = 0;
        let limit: MaxInt<50> = 50;

        //get total from first
        const initCall = await spotify.currentUser.playlists.playlists(
          limit,
          offset,
        );

        total = initCall.total;
        allPlaylists = [...initCall.items];
        //if the first call didn't get them all
        while (allPlaylists.length < total) {
          offset += limit;
          const nextCall = await spotify.currentUser.playlists.playlists(
            limit,
            offset,
          );
          const nextPlaylists = nextCall.items;
          //add to existing playlists
          allPlaylists = [...allPlaylists, ...nextPlaylists];
        }
        //all playlists retrieved
        setPlaylists(allPlaylists);
        setShownPlaylists(allPlaylists);
      } catch (error) {
        console.error("error setting up Find That Artist", error);
      } finally {
        setLoading(false);
      }
    }
    getPlaylists();
  }, []);

  function handleFilterChange(checked: boolean) {
    setIncludeFollowed(checked);
    if (checked) {
      setShownPlaylists(allPlaylists);
    } else {
      const filtered = allPlaylists.filter(
        (playlist) => playlist.owner.id === userId,
      );
      setShownPlaylists(filtered);
    }
  }

  //if loading send that over
  if (loading) {
    return (
      <Box>
        <Typography> Preparing the system...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography>This is a test</Typography>
      <Divider />
      {/* make filters for if they want to include or exclude collab playlists or ones they follow */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid size={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeFollowed}
                onChange={(e) => handleFilterChange(e.target.checked)}
              />
            }
            label="Include Followed Playlists"
          />
        </Grid>
      </Grid>
      {shownPlaylists.map((playlist) => {
        //TODO:
        // allow ability to filter by collab or created playlists
        // add all songs/artists to dictionary {artist name, [songs]}
        //allow person to search for artist names to see if they appear in existing playlists
        //make appearance saying {artist} has the song {songName} in playlist {playlistName}
        //make for each artist entry?
        return (
          <Box>
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: playlist.primary_color || "gray",
                mr: 2,
                borderRadius: 1,
              }}
            />
            {playlist.name} by {playlist.owner.id} collab:{" "}
            {playlist.collaborative.toString()}
            <Divider />{" "}
          </Box>
        );
      })}
    </Box>
  );
}

export default FindThatArtist;
