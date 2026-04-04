const API_BASE = 'http://localhost:5000/api/v1/knowledge';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-to-burfi",
    title: "Save selection to Burfi",
    contexts: ["selection", "image", "link"]
  });
});

// Keyboard Shortcut (Alt+B)
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-burfi-jar") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggle-burfi" });
            }
        });
    }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-burfi") {
    const { burfi_token } = await chrome.storage.local.get('burfi_token');
    
    if (!burfi_token) {
        console.error("No token found. Please login via extension popup.");
        return;
    }

    let content = info.selectionText || "Saved via context menu";
    let url = info.linkUrl || tab.url;
    let type = info.selectionText ? 'highlight' : 'article';
    
    if (info.mediaType === 'image') {
        url = info.srcUrl;
        type = 'image';
        content = "Image saved via context menu";
    }

    try {
        const response = await fetch(`${API_BASE}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${burfi_token}`
            },
            body: JSON.stringify({
                url,
                title: tab.title || "External Resource",
                content,
                type
            })
        });
        const data = await response.json();
        if (data.success) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'Saved to Burfi',
                message: 'Neural link established. Content stored.'
            });
        }
    } catch (err) {
        console.error("Save error:", err);
    }
  }
});
