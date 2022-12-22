# the goal is to take an artist's name and generate all songs in all your playlists to see which ones match

import requests
# set to just my acount, could change in the future
user_id = 'swiftsushi'
num_playlists = 50
# used to get playlists
spotify_get_playlists_url = f'https://api.spotify.com/v1/users/{user_id}/playlists?limit={num_playlists}'


# token grabbed from the console api. Will need to be changedif I want to make this a website
access_token = 'BQBxCT8oCuAP9wDlljZT0MYHHOFxJjuaK835CAZV8eGx6Sjv1NhPmOzV0dH97hYEpMqmIXhSPG3jhFTXgVGdBo6g_K4Dx9vnBeXIxv3XAr05mruj2KVoLDMsQWP_5dOq4eK8tsTstMZ7Zh32fEhVq46vTXUND80gPcAgByMnqpnu39Y'

designated_artist = "mxmtoon"


def get_playlists():
    response = requests.get(spotify_get_playlists_url,
                            headers={
                                "Authorization": f"Bearer {access_token}"
                            })
    json_resp = response.json()

    just_playlists = json_resp['items']

    return just_playlists


def get_songs_from_playlist(playlist_id):
    # using the fields tab to just get the relevant info
    get_songs_url = f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks?fields=items(track(artists(name)%2Cname))'
    response = requests.get(get_songs_url,
                            headers={
                                "Authorization": f"Bearer {access_token}"
                            })
    json_resp = response.json()

    just_songs = json_resp['items']

    return just_songs


def get_relevant_playlist_data(playlist_data):

    relevant_info = [{'name': playlist['name'], 'total_tracks':playlist['tracks']
                      ['total'], 'id': playlist['id']} for playlist in playlist_data]

    return relevant_info


def get_relevant_song_data(song_data):

    relevant_info = [{'artist_names': [artist['name'] for artist in song['track']['artists']],
                      'song_name': song['track']['name'], } for song in song_data]
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
    playlists = get_playlists()
    # want to throw these into a single list that has all the info
    # 2.
    actual_playlists = get_relevant_playlist_data(playlists)

    # 3.
    songs_by_artist = []

    for playlist in actual_playlists:
        playlist_songs = get_songs_from_playlist(playlist['id'])
        actual_songs = get_relevant_song_data(playlist_songs)

        for song in actual_songs:
            if designated_artist in song['artist_names']:
                songs_by_artist.append(song)

    # print results
    print(f"{designated_artist} sang the following songs from your playlists:")
    for artist_song in songs_by_artist:
        print(artist_song['song_name'])


if __name__ == '__main__':
    main()
