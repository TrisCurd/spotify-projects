# the goal is to take an artist's name and generate all songs in all your playlists to see which ones match

import requests
import time

# set to just my acount, could change in the future
user_id = 'swiftsushi'
num_playlists = 50
# used to get playlists
spotify_get_playlists_url = f'https://api.spotify.com/v1/users/{user_id}/playlists?limit={num_playlists}'

# token grabbed from the console api. Will need to be changed if I want to make this a website
access_token = 'BQB8VUnF_GMt9DNDCNDFCbL7aTSeWYldwlCWv1I8lgkQ_0Lu4BZozxDXq8oa62_oT24f84MyO3f9r-to_BwgeIm_4YmYQrGgWI0ASQVhfp9jOVARl53VgwQKre4Mmfljnxk4rxmyIC-n5689mzhKURBx0VUKsnBDQUYsrkzb4869ihTFpJ9HZ2Zompmhofk'
designated_artist = "Eminem"

#an idea is filling this out, so if there's a way to keep data you only need to run the program once
primary_artists_dict = {}

def get_playlists():
    response = requests.get(
        spotify_get_playlists_url,
        headers={"Authorization": f"Bearer {access_token}"})
    json_resp = response.json()

    just_playlists = json_resp['items']

    return just_playlists


def get_songs_from_playlist(playlist_id):
    # using the fields tab to just get the relevant info
    get_songs_url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks?fields=items(track(artists(name)%2Cname))'
    response = requests.get(
        get_songs_url, headers={"Authorization": f"Bearer {access_token}"})
    json_resp = response.json()

    just_songs = json_resp['items']

    return just_songs


def get_relevant_playlist_data(playlist_data):

    relevant_info = [{
        'name': playlist['name'],
        'total_tracks': playlist['tracks']['total'],
        'id': playlist['id']
    } for playlist in playlist_data]

    return relevant_info


def get_relevant_song_data(song_data):

    relevant_info = [{
        'artist_names':
        [artist['name'] for artist in song['track']['artists']],
        'song_name':
        song['track']['name'],
    } for song in song_data]
    return relevant_info


'''
Steps
1. get list of playlists from spotify
2. get playlist ids from that list
3. for each playlist id, get a list of the songs
4. for each song, compare it to the chosen singer's name 
'''


def main():
    # 1.
    start_time = time.perf_counter()
    print("Retrieving Playlists")
    untrimmed_playlists = get_playlists()
    end_time = time.perf_counter()
    time_diff_sec = end_time - start_time
    print(f"Playlists Retrieved. Time Elapsed: {time_diff_sec}")
    # want to throw these into a single list that has all the info
    # 2.
    start_time = time.perf_counter()
    trimmed_playlists = get_relevant_playlist_data(untrimmed_playlists)
    end_time = time.perf_counter()
    time_diff_sec = end_time - start_time
    print(f"Playlists trimmed. Time elapsed: {time_diff_sec}")
    # 3.
    songs_by_artist = []
    print("getting songs for artist")
    print(trimmed_playlists[0])
    start_time = time.perf_counter()
    for curr_playlist in trimmed_playlists:
        untrimmed_song_data = get_songs_from_playlist(curr_playlist['id'])
        trimmed_song_data = get_relevant_song_data(untrimmed_song_data)

        for curr_song in trimmed_song_data:
            if designated_artist in curr_song['artist_names']:
                curr_song['playlist_name'] = curr_playlist['name']
                songs_by_artist.append(curr_song)

    # print results
    end_time = time.perf_counter()
    time_diff_sec = end_time - start_time
    print(f"Done. Time elapsed: {time_diff_sec}")
    print(
        f"\n{designated_artist} sang the following songs from your playlists:")
    for artist_song in songs_by_artist:
        print(
            f"{artist_song['song_name']} is in '{artist_song['playlist_name']}'"
        )


if __name__ == '__main__':
    main()
