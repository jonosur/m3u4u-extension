document.getElementById('updateBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'updateList' }, (response) => {
        document.getElementById('status').innerText = `Updated ${response.count} channels.`;
    });
});

