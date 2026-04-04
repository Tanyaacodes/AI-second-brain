const API_BASE = 'http://localhost:5000/api/v1';
let burfiToken = null;

// Inject Burfi UI
const burfiOverlay = document.createElement('div');
burfiOverlay.id = 'burfi-overlay';
document.body.appendChild(burfiOverlay);

const burfiSidebar = document.createElement('div');
burfiSidebar.id = 'burfi-sidebar';
burfiSidebar.innerHTML = `
    <div class="burfi-sidebar-header">
        <div class="burfi-jar-title">BURFI JAR ✨</div>
        <div id="burfi-close" style="cursor:pointer; font-size: 24px;">✕</div>
    </div>
    <div class="burfi-sidebar-content">
        <div id="burfi-drop-zone" class="burfi-drop-zone">
            <div style="font-size: 32px; margin-bottom: 10px;">🍯</div>
            <div style="font-weight: 700;">Drag anything here</div>
            <div style="font-size: 11px; opacity: 0.5;">Images, Links, or Selected Text</div>
        </div>
        
        <div id="burfi-edit-zone" style="display:none;">
            <div style="margin-bottom: 16px;">
                <label style="font-size: 10px; font-weight: 800; color: #f59e0b;">NEURAL TITLE</label>
                <input id="burfi-title" class="burfi-input" type="text">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="font-size: 10px; font-weight: 800; color: #f59e0b;">TAGS</label>
                <input id="burfi-tags" class="burfi-input" type="text" placeholder="e.g., tech, ai, design">
            </div>
            <div style="margin-bottom: 16px;">
                <label style="font-size: 10px; font-weight: 800; color: #f59e0b;">QUICK NOTE</label>
                <textarea id="burfi-note" class="burfi-input" style="height: 100px; resize: none;" placeholder="Why save this?"></textarea>
            </div>
            <button id="burfi-save-btn" class="burfi-btn">MIRROR TO BRAIN</button>
            <div id="burfi-status" style="font-size: 11px; text-align: center; margin-top: 12px; opacity: 0.6;"></div>
        </div>

        <div id="burfi-login-warning" style="text-align: center; margin-top: 50px;">
            <p style="opacity: 0.7;">Link lost. Please sign in via the extension popup to use the Jar.</p>
        </div>
    </div>
`;
document.body.appendChild(burfiSidebar);

const burfiJar = document.createElement('div');
burfiJar.id = 'burfi-jar-floating';
burfiJar.innerHTML = '✨';
document.body.appendChild(burfiJar);

// --- Functions ---
function openBurfi() {
    burfiSidebar.classList.add('open');
    burfiOverlay.classList.add('open');
    checkAuth();
}

function closeBurfi() {
    burfiSidebar.classList.remove('open');
    burfiOverlay.classList.remove('open');
}

async function checkAuth() {
    const result = await chrome.storage.local.get('burfi_token');
    burfiToken = result.burfi_token;
    
    if (burfiToken) {
        document.getElementById('burfi-edit-zone').style.display = 'block';
        document.getElementById('burfi-login-warning').style.display = 'none';
    } else {
        document.getElementById('burfi-edit-zone').style.display = 'none';
        document.getElementById('burfi-login-warning').style.display = 'block';
    }
}

// --- Event Listeners ---
burfiJar.addEventListener('click', openBurfi);
document.getElementById('burfi-close').addEventListener('click', closeBurfi);
burfiOverlay.addEventListener('click', closeBurfi);

// Keyboard Shortcut Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle-burfi") {
        burfiSidebar.classList.contains('open') ? closeBurfi() : openBurfi();
    }
});

// Drag & Drop
const dropZone = document.getElementById('burfi-drop-zone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    const imageUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('URL');
    const linkUrl = e.dataTransfer.getData('text/plain');
    const selection = window.getSelection().toString();

    document.getElementById('burfi-title').value = document.title;
    document.getElementById('burfi-note').value = selection || "Dragged content from " + window.location.hostname;
    
    // Switch to edit mode
    dropZone.style.display = 'none';
    document.getElementById('burfi-edit-zone').style.display = 'block';

    if (imageUrl) {
        window.tempSaveData = { url: imageUrl, type: 'image' };
    } else {
        window.tempSaveData = { url: window.location.href, type: 'article' };
    }
});

document.getElementById('burfi-save-btn').addEventListener('click', async () => {
    if (!burfiToken) return;

    const btn = document.getElementById('burfi-save-btn');
    const status = document.getElementById('burfi-status');
    const title = document.getElementById('burfi-title').value;
    const tags = document.getElementById('burfi-tags').value.split(',').map(t => t.trim());
    const note = document.getElementById('burfi-note').value;

    btn.disabled = true;
    btn.textContent = 'BINDING...';
    status.textContent = 'Transmitting to brain...';

    const saveData = window.tempSaveData || { url: window.location.href, type: 'article' };

    try {
        const response = await fetch(`${API_BASE}/knowledge/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${burfiToken}`
            },
            body: JSON.stringify({
                ...saveData,
                title,
                content: note,
                tags
            })
        });

        const data = await response.json();
        if (data.success) {
            status.textContent = 'SAVED TO NEURAL NETWORK ✨';
            status.style.color = '#f59e0b';
            setTimeout(() => {
                closeBurfi();
                // Reset UI
                btn.disabled = false;
                btn.textContent = 'MIRROR TO BRAIN';
                status.textContent = '';
                dropZone.style.display = 'block';
                document.getElementById('burfi-edit-zone').style.display = 'none';
            }, 2000);
        }
    } catch (err) {
        status.textContent = 'LINK ERROR: BRAIN OFFLINE';
        btn.disabled = false;
    }
});
