# Name That Artist

- ~~note how many songs are in each playlist~~
- ~~sort playlists by song #, date made, alphabetical~~

- ~~once the correct playlists are selected, click "Categorize" to begin the artist process. I want to make a dictionary of Artists names and the songs from them that are in my selected playlists~~

- ~~add timer for how long that took~~

- ~~search for specific playlist names during the selection process~~

- ~~add header that changes between Selection and Categorization process~~

- ~~instead of showing all artists in the dictionary, make a list and let me search for specific names~~

- ~~sort by artist name and number of songs they have in my playlists~~
- Exploration: what info is available of the artist
- add picture of artist
- details of artist like real name, age, popularity if easy to grab
- add play button after each song that lets you play a snippet of the song, similar to how instagram does it
- suggestions of other songs from that artist you might like based on the songs already in your playlists? (might be another feature where you feed songs in)
- if the same song appears multiple times in playlists, make it one entry (like "stick season" in playlists 2 and 14)
- sort songs under each artist alphabetically
-

- ~~add info of which playlist has each song~~

# Spotimer

Description: you input timer length and playlists you want to pull from. it then creates a playlist that runs for exactly that amount of time using the songs in the playlist.

- select playlists option (should be similar to find that artist)
- add timer (hours minutes seconds)
- take all songs from the playlists, order by times
- knapsack problem (technically not a solved problem but we can get close enough). if we can't get the exact time aim for the closest time up to it but not going over the timer limit
- signal or something at the end of the timer reminding them that it's done
- if it's a timer without a specific second, maybe combining songs that work together into whole minutes (eg 1:34 paired with 2:26)
- progress bar saying what step it's on
- option to save playlist or just run it through once

# Your next new song

Description: this is all about how spotify rates the various qualities of songs. we're not using ml or anything like that to review songs. we just want to input playlists and analyze them. User inputs a playlist they want you to analyze. Go through all the songs and record avg bpm, genre, emotion, whatever spotify provides. based off of those averages, recommend a song that is within those ranges.

- select playlist
- Exploration: what info about a given song is provided by spotify
- once playlist is selected, add details about the playlist comprised of its songs
- search for a song matching those qualities or within a similar range. display those qualities
- allow user to find an indie artist (<2k monthly listeners). Actually let them listen to song
- allow user to find a new song by an artist already in the playlist. Actually let them listen to song
- allow user to rate these new songs found by them. build profile for user based on this
- if user likes a song, give them an option to add it to a playlist of their choosing

# 6 degrees of CRJ

Description: given a specific artist, how many song features are they away from Carly Rae Jepson

- Exploration: what does spotify say when a song has multiple artists? Can we collect that info?
- start with a list of all artists CRJ has collabed with, then go off of what those artists have collabed with. start with web of 3 and see how fast this is
- is there a way to focus on songs that have collabs and that's it? make it a set so dupes aren't counted
- is there a fast way to traverse this kind of info? Maybe focus on top 3 most popular artists from the og connection to continue the web
