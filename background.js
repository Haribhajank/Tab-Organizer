// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'groupTabs') {
    organizeTabs().then(() => {
      sendResponse({ status: 'Tabs grouped successfully!' });
    }).catch(error => {
      sendResponse({ status: `Error: ${error.message}` });
    });
    return true; // Keeps the message channel open for async response
  } else if (message.action === 'ungroupTabs') {
    ungroupTabs().then(() => {
      sendResponse({ status: 'Tabs ungrouped successfully!' });
    }).catch(error => {
      sendResponse({ status: `Error: ${error.message}` });
    });
    return true; // Keeps the message channel open for async response
  }
});

async function organizeTabs() {
  try {
    const tabs = await chrome.tabs.query({});

    const groups = {
      Work: { tabIds: [], match: [/work.com/, /docs.google.com/] },
      Social: { tabIds: [], match: [/facebook.com/, /twitter.com/, /instagram.com/] },
      Entertainment: { tabIds: [], match: [/youtube.com/, /netflix.com/] },
      Others: { tabIds: [], match: [] },
    };

    tabs.forEach((tab) => {
      let matched = false;
      for (const [key, group] of Object.entries(groups)) {
        if (group.match.some((regex) => regex.test(tab.url))) {
          group.tabIds.push(tab.id);
          matched = true;
          break;
        }
      }
      if (!matched) {
        groups.Others.tabIds.push(tab.id);
      }
    });

    for (const [key, group] of Object.entries(groups)) {
      if (group.tabIds.length > 0) {
        const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
        await chrome.tabGroups.update(groupId, { title: key, color: getGroupColor(key) });
      }
    }
  } catch (error) {
    console.error('Error organizing tabs:', error);
  }
}

async function ungroupTabs() {
  try {
    // Query all tabs that are in any group
    const groupedTabs = await chrome.tabs.query({ grouped: true });

    // Extract tab IDs to ungroup
    const tabIds = groupedTabs.map(tab => tab.id);

    // Check if there are any tabs to ungroup
    if (tabIds.length > 0) {
      // Ungroup all grouped tabs
      await chrome.tabs.ungroup(tabIds);
      console.log(`Ungrouped ${tabIds.length} tabs successfully.`);
    } else {
      console.log('No tabs found to ungroup.');
    }
  } catch (error) {
    console.error('Error ungrouping tabs:', error);
  }
}

function getGroupColor(category) {
  switch (category) {
    case 'Work': return 'blue';
    case 'Social': return 'red';
    case 'Entertainment': return 'yellow';
    default: return 'grey';
  }
}
