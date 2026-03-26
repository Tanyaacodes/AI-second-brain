const API_BASE = 'http://localhost:5000/api/v1/knowledge';
const statusEl = document.getElementById('status');
const saveBtn = document.getElementById('saveBtn');

let currentTab = null;

// Get current tab info and capture selection
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  currentTab = tabs[0];
  document.getElementById('title').textContent = currentTab.title;
  document.getElementById('url').textContent = currentTab.url;

  // Attempt to capture selected text on page
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
  } catch (err) {
    console.log("Could not access page content directly (maybe restricted page)");
  }
});

saveBtn.addEventListener('click', async () => {
  if (!currentTab) return;

  const url = currentTab.url;
  const title = currentTab.title;
  const tagsText = document.getElementById('tags').value;
  const contentText = document.getElementById('content').value;

  // Smart Type Detection
  let type = 'article';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    type = 'video';
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    type = 'social';
  }

  const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()) : [];

  saveBtn.disabled = true;
  saveBtn.textContent = 'NEURAL BINDING...';
  statusEl.textContent = 'Transmitting neuron signal...';

  try {
    const response = await fetch(`${API_BASE}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        title,
        content: contentText || "Saved via Mirror Extension",
        tags,
        type,
        user: "extension_user"
      })
    });

    const data = await response.json();

    if (data.success) {
      statusEl.textContent = 'SAVED TO SECOND BRAIN';
      statusEl.classList.add('success');
      saveBtn.style.background = '#10b981';
      saveBtn.style.color = 'white';
      saveBtn.textContent = 'MIRROR COMPLETE';
      
      setTimeout(() => {
        window.close();
      }, 1500);
    } else {
      throw new Error(data.message || 'Transmission failed.');
    }
  } catch (error) {
    console.error('Mirror Error:', error);
    statusEl.textContent = 'ERROR: Neural link lost.';
    saveBtn.disabled = false;
    saveBtn.textContent = 'RETRY MIRROR';
    saveBtn.style.background = '#ef4444';
  }
});
