### M3U4U EXTENSION

This is a unpacked chrome extension for m3u4u and EPGSHARE01, this is a third party extension.

To load an unpacked extension in Chrome, you can: 
1. Go to the Extensions page by opening chrome://extensions/
2. Turn on Developer mode in the top right corner
3. Click Load unpacked
4. Select the extension folder

Make sure you visit https://cors-anywhere.herokuapp.com/corsdemo and request temporary access to the proxy server, this is needed to fetch the txt from EPGSHARE01.

Report all bugs to me **@gratefuljono** on the m3u4u discord.

Currently it will mark input fields teal if it matches a result on EPGSHARE01 and will provide a moveable suggestions dropdown menu while typing. 

### TODO

- Add theme selection so it doesn't have to be teal color if people don't want teal.
- Change source for cors proxy server, maybe run locally.
- Change it so that loading the extension and pressing the update list from the extension menu are the only external fetch of the EPGSHARE01.txt, accessing m3u4u.com should pull from a local file.
