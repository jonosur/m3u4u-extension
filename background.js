chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "updateList",
        title: "Update",
        contexts: ["action"]
    });

    updateList();
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "updateList") {
        updateList();
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateList') {
        updateList()
            .then(count => sendResponse({ count }))
            .catch(err => sendResponse({ error: err.message }));
        return true;
    }
});

function updateList() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'https://epgshare01.online/epgshare01/epg_ripper_ALL_SOURCES1.txt';

    return fetch(proxyUrl + targetUrl)
        .then(response => response.text())
        .then(text => {
            const validList = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('--'));

            console.log('Processed validList:', validList);

            chrome.storage.local.set({ validList });

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'List Updated',
                message: `Extension has added ${validList.length} channels from EPGSHARE01, confirmed channels will appear as teal!`
            });

            return validList.length;
        })
        .catch(error => {
            console.error('Error fetching the list:', error);
        });
}

