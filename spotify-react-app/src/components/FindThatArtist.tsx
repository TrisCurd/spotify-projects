import { useState, useEffect } from "react";
import { spotifyApi } from "../utils/spotify";
import { Box, Typography } from "@mui/material";
import "../types/spotifyTypes";
import { SimplifiedPlaylist } from "../types/spotifyTypes";
function FindThatArtist() {
  /**
   * @type {[SimplifiedPlaylist[], Function]}
   */
  const [allPlaylists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);
  /**
   *
   */
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error>();

  //get playlists
  useEffect(() => {
    //run get playlists
    async function getPlaylists() {
      setLoading(true);
      try {
        console.log("getting playlists");
        let allPlaylists: SimplifiedPlaylist[] = [];
        let offset = 0;
        const limit = 50;
        let total = 0;

        //get total from first
        const initCall = await spotifyApi(
          `/me/playlists?limit=${limit}&offset=${offset}`,
        );

        console.log("playlists retrieved");
        console.log(initCall);
        total = initCall.total;
        allPlaylists = [...initCall.items];
        //if the first call didn't get them all
        while (allPlaylists.length < total) {
          offset += limit;
          console.log("getting more playlists");
          const nextCall = await spotifyApi(
            `/me/playlists?limit=${limit}&offset=${offset}`,
          );
          const nextPlaylists = nextCall.items;
          //add to existing playlists
          allPlaylists = [...allPlaylists, ...nextPlaylists];
        }
        //all playlists retrieved
        console.log("all done!");
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
      {allPlaylists.map((playlist) => {
        return <Box> {playlist.name}</Box>;
      })}
    </Box>
  );
}

export default FindThatArtist;
