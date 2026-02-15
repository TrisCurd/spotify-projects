import { useState, useEffect } from "react";
import { spotifyApi } from "../utils/spotify";
import { Box, Divider, Typography } from "@mui/material";
import { SimplifiedPlaylist } from "@spotify/web-api-ts-sdk";
function FindThatArtist() {
  /**
   * @type {[SimplifiedPlaylist[], Function]}
   */
  const [allPlaylists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  //get playlists
  useEffect(() => {
    //run get playlists
    async function getPlaylists() {
      setLoading(true);
      try {
        let allPlaylists: SimplifiedPlaylist[] = [];
        let offset = 0;
        const limit = 50;
        let total = 0;

        //get total from first
        const initCall = await spotifyApi(
          `/me/playlists?limit=${limit}&offset=${offset}`,
        );

        total = initCall.total;
        allPlaylists = [...initCall.items];
        //if the first call didn't get them all
        while (allPlaylists.length < total) {
          offset += limit;
          const nextCall = await spotifyApi(
            `/me/playlists?limit=${limit}&offset=${offset}`,
          );
          const nextPlaylists = nextCall.items;
          //add to existing playlists
          allPlaylists = [...allPlaylists, ...nextPlaylists];
        }
        //all playlists retrieved
        setPlaylists(allPlaylists);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }
    getPlaylists();
  }, []);

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
      {allPlaylists.map((playlist) => {
        //TODO:
        // allow ability to filter by collab or created playlists
        // add all songs/artists to dictionary {artist name, [songs]}
        //allow person to search for artist names to see if they appear in existing playlists
        //make appearance saying {artist} has the song {songName} in playlist {playlistName}
        //make for each artist entry?
        return (
          <Box>
            {playlist.name} <Divider />{" "}
          </Box>
        );
      })}
    </Box>
  );
}

export default FindThatArtist;
