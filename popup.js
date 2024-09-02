// popup.js

document.getElementById('groupTabs').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'groupTabs' }, (response) => {
    document.getElementById('status').innerText = response.status;
  });
});

document.getElementById('ungroupTabs').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'ungroupTabs' }, (response) => {
    document.getElementById('status').innerText = response.status;
  });
});

document.getElementById('saveSession').addEventListener('click', () => {
  chrome.tabs.query({}, (tabs) => {
    const tabUrls = tabs.map(tab => tab.url);
    chrome.storage.local.set({ savedSession: tabUrls }, () => {
      document.getElementById('status').innerText = 'Session saved!';
    });
  });
});

document.getElementById('restoreSession').addEventListener('click', () => {
  chrome.storage.local.get('savedSession', (data) => {
    if (data.savedSession) {
      data.savedSession.forEach(url => {
        chrome.tabs.create({ url });
      });
      document.getElementById('status').innerText = 'Session restored!';
    } else {
      document.getElementById('status').innerText = 'No saved session found!';
    }
  });
});
