const API_BASE = 'http://localhost:5000/api/v1';
const statusEl = document.getElementById('status');
const saveBtn = document.getElementById('saveBtn');
const saveView = document.getElementById('saveView');
const loginView = document.getElementById('loginView');
const logoutBtn = document.getElementById('logoutBtn');

let currentTab = null;

// Initialize: Check Auth
chrome.storage.local.get('burfi_token', (result) => {
    if (result.burfi_token) {
        showSaveView();
    } else {
        showLoginView();
    }
});

function showSaveView() {
    saveView.classList.remove('hidden');
    loginView.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    initSaveLogic();
}

function showLoginView() {
    saveView.classList.add('hidden');
    loginView.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
}

// --- AUTH LOGIC ---
document.getElementById('doLoginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginStatus = document.getElementById('loginStatus');

    if (!email || !password) return;

    try {
        loginStatus.textContent = 'Verifying signature...';
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            await chrome.storage.local.set({ 'burfi_token': data.token });
            showSaveView();
        } else {
            loginStatus.textContent = 'Access Denied: ' + (data.message || 'Invalid keys');
        }
    } catch (err) {
        loginStatus.textContent = 'Link error: Check backend.';
    }
});

logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove('burfi_token');
    showLoginView();
});

// --- SAVE LOGIC ---
async function initSaveLogic() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        currentTab = tabs[0];
        document.getElementById('title').textContent = currentTab.title;
        document.getElementById('url').textContent = currentTab.url;
        
        // Fetch suggested tags/metadata from backend
        fetchMetadata(currentTab.url);

        // Capture selection
        try {
            const results = await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: () => window.getSelection().toString(),
            });

            if (results && results[0] && results[0].result) {
                document.getElementById('content').value = results[0].result;
                statusEl.textContent = 'NEURAL HIGHLIGHT DETECTED';
                statusEl.style.color = '#F59E0B';
            }
        } catch (err) {}
    });
}

async function fetchMetadata(url) {
    const tagEl = document.getElementById('suggestedTags');
    try {
        const response = await fetch(`${API_BASE}/knowledge/scrape?url=${encodeURIComponent(url)}`);
        const { data } = await response.json();
        if (data && data.title) {
            tagEl.textContent = 'TOPIC: ' + (data.source || 'General');
            if (data.image) {
                // Future: show mini preview
            }
        } else {
            tagEl.textContent = 'NEW RESOURCE';
        }
    } catch (err) {
        tagEl.textContent = 'OFFLINE';
    }
}

saveBtn.addEventListener('click', async () => {
  if (!currentTab) return;

  const { burfi_token } = await chrome.storage.local.get('burfi_token');
  const tagsText = document.getElementById('tags').value;
  const contentText = document.getElementById('content').value;

  let type = 'article';
  if (currentTab.url.includes('youtube.com') || currentTab.url.includes('youtu.be')) type = 'video';
  if (currentTab.url.includes('twitter.com') || currentTab.url.includes('x.com')) type = 'social';

  const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()) : [];

  saveBtn.disabled = true;
  saveBtn.textContent = 'BINDING...';

  try {
    const response = await fetch(`${API_BASE}/knowledge/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${burfi_token}`
      },
      body: JSON.stringify({
        url: currentTab.url,
        title: currentTab.title,
        content: contentText || "Saved via Burfi Mirror",
        tags,
        type
      })
    });

    const data = await response.json();
    if (data.success) {
      statusEl.textContent = 'SAVED TO BRAIN';
      statusEl.classList.add('success');
      saveBtn.style.background = '#10b981';
      saveBtn.textContent = 'COMPLETE';
      setTimeout(() => window.close(), 1500);
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    statusEl.textContent = 'ERROR: Link lost.';
    saveBtn.disabled = false;
    saveBtn.textContent = 'RETRY';
  }
});
