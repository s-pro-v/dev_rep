const USERNAME = 's-pro-v';
const AUTH_STORAGE_KEY = 'git_scanner_auth';
const VIEW_STORAGE_KEY = 'git_scanner_view';
const OBFUSCATE_KEY = 'S-PRO-V_VFS_2027'; // do odszyfrowania w pamięci
const BOOT_PASSWORD = 'admin'; // hasło do wejścia – zmień na własne
const UNLOCK_STORAGE_KEY = 'git_scanner_unlocked'; // sessionStorage – do zamknięcia karty
let editor, currentRepo = '', currentOpenFilePath = '', currentTheme = 'dark', githubToken = '', currentView = (localStorage.getItem(VIEW_STORAGE_KEY) || 'list');
let allRepos = [], repoFilter = 'all';

function obfuscate(str) {
    let out = '';
    for (let i = 0; i < str.length; i++) {
        out += String.fromCharCode(str.charCodeAt(i) ^ OBFUSCATE_KEY.charCodeAt(i % OBFUSCATE_KEY.length));
    }
    return btoa(unescape(encodeURIComponent(out)));
}
function deobfuscate(str) {
    try {
        const raw = decodeURIComponent(escape(atob(str)));
        let out = '';
        for (let i = 0; i < raw.length; i++) {
            out += String.fromCharCode(raw.charCodeAt(i) ^ OBFUSCATE_KEY.charCodeAt(i % OBFUSCATE_KEY.length));
        }
        return out;
    } catch (e) { return ''; }
}
function loadStoredAuth() {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return;
    const token = deobfuscate(stored);
    if (token) {
        githubToken = token;
        document.getElementById('auth-status').innerHTML = '<i class="fas fa-check btn-icon" aria-hidden="true"></i> AUTH: YES';
        document.getElementById('auth-status').style.color = 'var(--success-color)';
    }
}
function saveAuth(token) {
    if (token) localStorage.setItem(AUTH_STORAGE_KEY, obfuscate(token));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
}

const getHeaders = () => {
    const h = { 'Accept': 'application/vnd.github.v3+json' };
    if (githubToken) h['Authorization'] = `token ${githubToken}`;
    return h;
};

const MONACO_SETTINGS_KEY = 'git_scanner_monaco_settings';

function getMonacoSettings() {
    try {
        const s = localStorage.getItem(MONACO_SETTINGS_KEY);
        return s ? JSON.parse(s) : {};
    } catch (e) { return {}; }
}

function saveMonacoSettings(obj) {
    try {
        localStorage.setItem(MONACO_SETTINGS_KEY, JSON.stringify(obj));
    } catch (e) { }
}

window.getMonacoSettings = getMonacoSettings;

if (typeof window.MonacoEditorSettings !== 'undefined' && window.MonacoEditorSettings.loadSettings) {
    window.MonacoEditorSettings.loadSettings();
}
window.switchSettingsTab = function (tabId) {
    if (window.MonacoEditorSettings && window.MonacoEditorSettings.switchSettingsTab) window.MonacoEditorSettings.switchSettingsTab(tabId);
};
window.updateSetting = function (key, value) {
    if (window.MonacoEditorSettings && window.MonacoEditorSettings.updateSetting) window.MonacoEditorSettings.updateSetting(key, value);
};

// Layout Toggle
function applyView() {
    document.getElementById('repo-list').className = `repo-list-container ${currentView === 'grid' ? 'grid-mode' : ''}`;
    const viewIconClass = currentView === 'grid' ? 'fas fa-th' : 'fas fa-list';
    document.getElementById('view-toggle').innerHTML = `<i class="${viewIconClass} btn-icon" aria-hidden="true"></i> VIEW: ${currentView.toUpperCase()}`;
}
document.getElementById('view-toggle').addEventListener('click', () => {
    currentView = currentView === 'list' ? 'grid' : 'list';
    localStorage.setItem(VIEW_STORAGE_KEY, currentView);
    applyView();
});

document.querySelectorAll('.md-pre-wrap .md-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
        var panelId = 'md-panel-' + (this.getAttribute('data-panel') || 'preview');
        document.querySelectorAll('.md-pre-wrap .md-tab').forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.md-pre-wrap .md-panel').forEach(function (p) { p.classList.remove('active'); });
        this.classList.add('active');
        var panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
    });
});

// System Boot
async function startBoot() {
    const steps = [
        { label: 'Init Kernel v2.7', level: 'INFO', log: 'Kernel v2.7 initialized' },
        { label: 'Mapping UI', level: 'SUCCESS', log: 'UI mapping complete' },
        { label: 'Handshake GITHUB', level: 'SUCCESS', log: 'GITHUB handshake established' },
        { label: 'Sync HUD', level: 'SUCCESS', log: 'HUD sync ready' },
        { label: 'Load repos', level: 'SUCCESS', log: 'Repositories loaded' }
    ];
    const listEl = document.getElementById('boot-status-list');
    const progressEl = document.getElementById('progress-fill');
    const bootLogEl = document.getElementById('boot-log');
    listEl.innerHTML = '';
    steps.forEach((step, idx) => {
        const li = document.createElement('li');
        li.className = 'boot-status-item';
        li.dataset.index = idx;
        li.innerHTML = `<span class="status-icon"><i class="far fa-circle" aria-hidden="true"></i></span><span class="status-text">${step.label}</span>`;
        listEl.appendChild(li);
    });
    const items = listEl.querySelectorAll('.boot-status-item');

    let logSeq = 0;
    function appendBootLogEntry(level, message) {
        logSeq += 1;
        const entry = document.createElement('div');
        entry.className = 'boot-log-entry';
        const tag = `[BOOT ${String(logSeq).padStart(2, '0')}]`;
        const levelClass = level === 'INFO' ? 'info' : 'success';
        entry.innerHTML = `
                    <div class="boot-log-head">
                        <span class="boot-log-time">${tag}</span>
                        <span class="boot-log-level ${levelClass}">${level}</span>
                    </div>
                    <div class="boot-log-msg">
                        <span class="boot-log-indent">L</span>
                        <span class="boot-log-text">${message}</span>
                    </div>`;
        bootLogEl.appendChild(entry);
        bootLogEl.scrollTop = bootLogEl.scrollHeight;
    }

    for (let i = 0; i < steps.length; i++) {
        items.forEach((el, j) => {
            const icon = el.querySelector('.status-icon i');
            el.classList.remove('loading', 'done');
            if (j < i) {
                el.classList.add('done');
                if (icon) { icon.className = 'fas fa-check'; }
            } else if (j === i) {
                el.classList.add('loading');
                if (icon) { icon.className = 'fas fa-spinner fa-spin'; }
            } else {
                if (icon) { icon.className = 'far fa-circle'; }
            }
        });
        progressEl.style.width = `${((i + 1) / steps.length) * 100}%`;
        appendBootLogEntry(steps[i].level, steps[i].log);
        if (i === steps.length - 1) {
            await fetchRepos();
        } else {
            await new Promise(r => setTimeout(r, 200));
        }
    }

    items[items.length - 1].classList.remove('loading');
    items[items.length - 1].classList.add('done');
    items[items.length - 1].querySelector('.status-icon i').className = 'fas fa-check';
    progressEl.style.width = '100%';
    await new Promise(r => setTimeout(r, 400));

    const continueEl = document.getElementById('splash-continue');
    const continueBtn = document.getElementById('splash-continue-btn');
    const authInfoEl = document.getElementById('splash-auth-info');

    function closeSplash() {
        document.getElementById('splash-screen').style.opacity = '0';
        document.getElementById('splash-screen').style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.removeEventListener('keydown', onKey);
        }, 450);
    }

    if (sessionStorage.getItem(UNLOCK_STORAGE_KEY) === '1') {
        document.body.classList.add('unlocked');
        closeSplash();
        setTimeout(preloadMonaco, 400);
        return;
    }

    if (authInfoEl) {
        if (githubToken) {
            authInfoEl.textContent = '';
            authInfoEl.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> AUTH KEY: CONNECTED';
            authInfoEl.className = 'splash-auth-info has-auth';
        } else {
            authInfoEl.textContent = '';
            authInfoEl.innerHTML = '<i class="fas fa-key" aria-hidden="true"></i> NO AUTH KEY — limited API rate (60 req/h). Set key in header to unlock.';
            authInfoEl.className = 'splash-auth-info no-auth';
        }
    }
    continueEl.classList.add('visible');

    const passwordInput = document.getElementById('splash-password');
    const passwordError = document.getElementById('splash-password-error');

    function tryUnlock() {
        const value = (passwordInput && passwordInput.value) ? passwordInput.value.trim() : '';
        if (value === BOOT_PASSWORD) {
            if (passwordError) passwordError.textContent = '';
            const logoutInfo = document.getElementById('splash-logout-info');
            if (logoutInfo) { logoutInfo.className = 'splash-logout-info'; logoutInfo.textContent = ''; }
            sessionStorage.setItem(UNLOCK_STORAGE_KEY, '1');
            document.body.classList.add('unlocked');
            closeSplash();
            setTimeout(preloadMonaco, 400);
        } else {
            if (passwordError) passwordError.textContent = 'Wrong password.';
            if (passwordInput) { passwordInput.value = ''; passwordInput.focus(); }
        }
    }

    function onKey(e) {
        if (e.key === 'Enter') tryUnlock();
    }

    document.addEventListener('keydown', onKey);
    if (continueBtn) continueBtn.addEventListener('click', tryUnlock);
    if (passwordInput) passwordInput.focus();
}

// Monaco - loader ładany dynamicznie, żeby require był zdefiniowany
const MONACO_VS = 'https://cdn.jsdelivr.net/gh/s-pro-v/maroco@main/min/vs';
const MONACO_LOADER = MONACO_VS + '/loader.js';
const MONACO_LOADER_FALLBACK = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js';
const MONACO_VS_FALLBACK = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs';
let monacoReady = false;
let monacoInitStarted = false;
function loadMonacoLoader(cb) {
    if (typeof require !== 'undefined') { cb(); return; }
    const s = document.createElement('script');
    s.src = MONACO_LOADER;
    s.onerror = () => {
        const s2 = document.createElement('script');
        s2.src = MONACO_LOADER_FALLBACK;
        s2.onload = () => { require.config({ paths: { vs: MONACO_VS_FALLBACK } }); monacoReady = true; cb(); };
        s2.onerror = () => cb();
        document.head.appendChild(s2);
    };
    s.onload = () => {
        if (typeof require !== 'undefined') {
            require.config({ paths: { vs: MONACO_VS } });
            monacoReady = true;
        }
        cb();
    };
    document.head.appendChild(s);
}
function initMonaco() {
    if (editor || monacoInitStarted) return;
    monacoInitStarted = true;
    const container = document.getElementById('monaco-container');
    const loadingEl = document.getElementById('monaco-loading');
    if (loadingEl) loadingEl.classList.remove('hidden');
    loadMonacoLoader(() => {
        if (typeof require === 'undefined') {
            monacoInitStarted = false;
            if (loadingEl) loadingEl.classList.add('hidden');
            return;
        }
        require(['vs/editor/editor.main'], () => {
            if (typeof defineMonacoThemes === 'function') defineMonacoThemes();
            const monacoTheme = currentTheme === 'dark' ? 'terminal-dark' : 'terminal-light';
            let base;
            if (typeof window.MonacoEditorSettings !== 'undefined' && typeof window.MonacoEditorSettings.getEditorOptions === 'function') {
                base = window.MonacoEditorSettings.getEditorOptions();
            } else {
                const saved = getMonacoSettings();
                base = {
                    fontFamily: saved.fontFamily || 'JetBrains Mono',
                    fontSize: saved.fontSize || 12,
                    lineHeight: saved.lineHeight || 0,
                    tabSize: saved.tabSize || 4,
                    wordWrap: (saved.wordWrap === 'on') ? 'on' : 'off',
                    minimap: { enabled: saved.minimap !== false },
                    cursorStyle: saved.cursorStyle || 'line-thin',
                    cursorBlinking: saved.cursorBlinking || 'expand',
                    cursorSmoothCaretAnimation: saved.cursorSmoothCaretAnimation !== false,
                    autoClosingBrackets: saved.autoClosingBrackets || 'always',
                    autoClosingQuotes: saved.autoClosingQuotes || 'always',
                    bracketPairColorization: saved.bracketPairColorization !== false,
                    folding: saved.folding !== false,
                    insertSpaces: saved.insertSpaces === true,
                    autoIndent: saved.autoIndent || 'full',
                    formatOnPaste: saved.formatOnPaste !== false,
                    formatOnType: saved.formatOnType !== false,
                    matchBrackets: saved.matchBrackets || 'always',
                    renderWhitespace: saved.renderWhitespace || 'selection',
                    renderIndentGuides: saved.renderIndentGuides !== false,
                    scrollBeyondLastLine: saved.scrollBeyondLastLine !== false,
                    mouseWheelZoom: saved.mouseWheelZoom !== false,
                    occurrencesHighlight: saved.occurrencesHighlight !== false,
                    selectionHighlight: saved.selectionHighlight !== false,
                    renderLineHighlight: saved.renderLineHighlight || 'line',
                    colorDecorators: saved.colorDecorators !== false,
                    links: saved.links !== false,
                    codeLens: saved.codeLens === true,
                    dragAndDrop: saved.dragAndDrop !== false,
                    emptySelectionClipboard: saved.emptySelectionClipboard !== false,
                    copyWithSyntaxHighlighting: saved.copyWithSyntaxHighlighting !== false,
                    smoothScrolling: saved.smoothScrolling !== false,
                    roundedSelection: saved.roundedSelection !== false,
                    multiCursorModifier: saved.multiCursorModifier || 'alt',
                    showFoldingControls: saved.showFoldingControls || 'mouseover',
                    suggestOnTriggerCharacters: saved.suggestOnTriggerCharacters !== false,
                    acceptSuggestionOnEnter: saved.acceptSuggestionOnEnter || 'on',
                    quickSuggestionsDelay: saved.quickSuggestionsDelay !== undefined ? saved.quickSuggestionsDelay : 100
                };
            }
            base.theme = monacoTheme;
            base.automaticLayout = true;
            base.readOnly = true;
            editor = monaco.editor.create(container, base);
            if (typeof window.MonacoEditorSettings !== 'undefined' && typeof window.MonacoEditorSettings.setEditors === 'function') {
                window.MonacoEditorSettings.setEditors(editor, null);
            }
            if (loadingEl) loadingEl.classList.add('hidden');
        });
    });
}

function preloadMonaco() {
    if (!editor && !monacoInitStarted) setTimeout(() => initMonaco(), 0);
}

// Controls – zmiana motywu bez animacji (theme-switching wyłącza transitiony, potem je przywracamy)
document.getElementById('theme-toggle').addEventListener('click', () => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('theme', currentTheme);
    if (editor) monaco.editor.setTheme(currentTheme === 'dark' ? 'terminal-dark' : 'terminal-light');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            root.classList.remove('theme-switching');
        });
    });
});

document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem(UNLOCK_STORAGE_KEY);
    document.body.classList.remove('unlocked');
    const splash = document.getElementById('splash-screen');
    splash.style.display = 'flex';
    splash.style.opacity = '1';
    splash.style.transition = 'opacity 0.4s ease';
    const logoutInfo = document.getElementById('splash-logout-info');
    if (logoutInfo) {
        logoutInfo.textContent = '';
        logoutInfo.innerHTML = '<i class="fas fa-info-circle" aria-hidden="true"></i> Wylogowano. Wprowadź hasło, aby ponownie wejść.';
        logoutInfo.className = 'splash-logout-info visible';
    }
    const pwd = document.getElementById('splash-password');
    if (pwd) { pwd.value = ''; pwd.focus(); }
    const err = document.getElementById('splash-password-error');
    if (err) err.textContent = '';
});

const authPanel = document.getElementById('auth-panel');
const ghTokenInput = document.getElementById('gh-token');
const keyToggleBtn = document.getElementById('key-toggle');
const closeAuthModal = () => {
    authPanel.classList.remove('active');
    authPanel.setAttribute('aria-hidden', 'true');
    keyToggleBtn.focus();
};
document.getElementById('key-toggle').addEventListener('click', () => {
    const isOpening = !authPanel.classList.contains('active');
    authPanel.classList.toggle('active');
    authPanel.setAttribute('aria-hidden', authPanel.classList.contains('active') ? 'false' : 'true');
    if (isOpening) setTimeout(() => ghTokenInput.focus(), 50);
});
document.getElementById('auth-modal-backdrop').addEventListener('click', closeAuthModal);
document.getElementById('auth-modal-close').addEventListener('click', closeAuthModal);

document.getElementById('apply-token').addEventListener('click', () => {
    githubToken = document.getElementById('gh-token').value.trim();
    saveAuth(githubToken);
    const authIconClass = githubToken ? 'fas fa-check' : 'far fa-circle';
    document.getElementById('auth-status').innerHTML = `<i class="${authIconClass} btn-icon" aria-hidden="true"></i> AUTH: ${githubToken ? 'YES' : 'NO'}`;
    document.getElementById('auth-status').style.color = githubToken ? 'var(--success-color)' : 'var(--danger-color)';
    document.getElementById('gh-token').value = '';
    closeAuthModal();
    fetchRepos();
});

document.getElementById('clear-token').addEventListener('click', () => {
    githubToken = '';
    saveAuth('');
    document.getElementById('gh-token').value = '';
    document.getElementById('auth-status').innerHTML = '<i class="far fa-circle btn-icon" aria-hidden="true"></i> AUTH: NO';
    document.getElementById('auth-status').style.color = 'var(--danger-color)';
    closeAuthModal();
    fetchRepos();
});

const closeBrowser = () => {
    if (typeof window.MonacoEditorSettings !== 'undefined' && window.MonacoEditorSettings.closeSettings) {
        window.MonacoEditorSettings.closeSettings();
    }
    if (editor) {
        const model = editor.getModel();
        if (model) model.dispose();
        editor.setModel(monaco.editor.createModel('', 'plaintext'));
    }
    var preWrap = document.getElementById('md-pre-wrap');
    if (preWrap) {
        preWrap.classList.remove('visible');
        preWrap.setAttribute('aria-hidden', 'true');
        var p = document.getElementById('md-pre-view');
        if (p) p.textContent = '';
        var ph = document.getElementById('md-pre-view-html');
        if (ph) ph.innerHTML = '';
    }
    document.getElementById('code-browser').classList.remove('active');
    document.body.style.overflow = 'auto';
};
window.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    var sb = document.getElementById('settingsSidebar');
    if (sb && sb.classList.contains('active') && window.MonacoEditorSettings && window.MonacoEditorSettings.closeSettings) {
        window.MonacoEditorSettings.closeSettings();
        return;
    }
    if (authPanel.classList.contains('active')) closeAuthModal();
    else closeBrowser();
});

const CDN_BRANCH = 'main';
function getCdnBase() {
    return currentRepo ? `https://cdn.jsdelivr.net/gh/${USERNAME}/${currentRepo}@${CDN_BRANCH}/` : '';
}
function setCdnUrl(path) {
    const base = getCdnBase();
    const url = path ? base + path : base;
    const el = document.getElementById('cdn-url');
    if (el) el.value = url;
}
document.getElementById('cdn-copy').addEventListener('click', () => {
    const url = document.getElementById('cdn-url').value;
    if (url) {
        navigator.clipboard.writeText(url).then(() => {
            const btn = document.getElementById('cdn-copy');
            const t = btn.textContent; btn.textContent = 'OK'; setTimeout(() => { btn.textContent = t; }, 800);
        });
    }
});

async function openBrowser(name) {
    currentRepo = name; currentOpenFilePath = '';
    document.getElementById('current-repo-name').textContent = name.toUpperCase();
    setCdnUrl('');
    document.getElementById('code-browser').classList.add('active');
    document.body.style.overflow = 'hidden';
    if (!editor) initMonaco();
    fetchFiles('');
}

const ICONIFY_BASE = 'https://api.iconify.design';
const FILE_ICONS_ICONIFY = {
    css: 'vscode-icons:file-type-css2', scss: 'vscode-icons:file-type-scss', sass: 'vscode-icons:file-type-sass', less: 'vscode-icons:file-type-less',
    html: 'vscode-icons:file-type-html', htm: 'vscode-icons:file-type-html', xhtml: 'vscode-icons:file-type-html',
    json: 'vscode-icons:file-type-light-json',
    js: 'material-icon-theme:javascript', mjs: 'material-icon-theme:javascript', cjs: 'material-icon-theme:javascript',
    ts: 'vscode-icons:file-type-typescript', tsx: 'vscode-icons:file-type-reactts', jsx: 'vscode-icons:file-type-reactjs',
    py: 'vscode-icons:file-type-python', pyw: 'vscode-icons:file-type-python',
    md: 'vscode-icons:file-type-markdown', markdown: 'vscode-icons:file-type-markdown',
    tex: 'material-icon-theme:latexmk', latex: 'material-icon-theme:latexmk',
    xml: 'vscode-icons:file-type-xml', yaml: 'vscode-icons:file-type-yaml', yml: 'vscode-icons:file-type-yaml',
    svg: 'vscode-icons:file-type-svg', png: 'vscode-icons:file-type-image', jpg: 'vscode-icons:file-type-image', jpeg: 'vscode-icons:file-type-image', gif: 'vscode-icons:file-type-image', webp: 'vscode-icons:file-type-image', ico: 'vscode-icons:file-type-image',
    pdf: 'vscode-icons:file-type-pdf2',
    zip: 'vscode-icons:file-type-zip', tar: 'vscode-icons:file-type-tar', gz: 'vscode-icons:file-type-gzip', rar: 'vscode-icons:file-type-rar',
};
function getFileIcon(name, isDir) {
    if (isDir) return { type: 'fa', icon: 'fa-folder', color: 'icon-highlight' };
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const iconifyId = FILE_ICONS_ICONIFY[ext];
    if (iconifyId) return { type: 'iconify', url: `${ICONIFY_BASE}/${iconifyId}.svg` };
    return { type: 'fa', icon: 'fa-file', color: 'icon-muted' };
}

function encodePath(p) {
    if (!p) return '';
    return p.split('/').map(encodeURIComponent).join('/');
}

async function fetchFiles(path) {
    const tree = document.getElementById('file-tree');
    tree.innerHTML = '<div class="explorer-item">FETCHING...</div>';
    try {
        const url = `https://api.github.com/repos/${USERNAME}/${currentRepo}/contents/${encodePath(path)}`;
        const res = await fetch(url, { headers: getHeaders() });
        const data = await res.json();
        tree.innerHTML = '';
        if (!res.ok) {
            const msg = (data && data.message) ? data.message : `HTTP ${res.status}`;
            tree.innerHTML = `<div class="explorer-item" style="color:var(--danger-color)">${msg}</div>`;
            return;
        }
        const files = Array.isArray(data) ? data : [data];
        if (path) {
            const b = document.createElement('div'); b.className = 'explorer-item folder';
            b.innerHTML = '<i class="fas fa-arrow-left btn-icon icon-muted" aria-hidden="true"></i> .. [BACK]';
            b.onclick = () => fetchFiles(path.split('/').slice(0, -1).join('/'));
            tree.appendChild(b);
        }
        files.sort((a, b) => (b.type === 'dir') - (a.type === 'dir')).forEach(f => {
            const isDir = f.type === 'dir';
            const iconInfo = getFileIcon(f.name, isDir);
            const extClass = !isDir && f.name.includes('.') ? ` explorer-item--${f.name.split('.').pop().toLowerCase()}` : '';
            const isActive = !isDir && f.path === currentOpenFilePath;
            const el = document.createElement('div');
            el.className = `explorer-item ${isDir ? 'folder' : 'file'}${extClass}${isActive ? ' active' : ''}`;
            el.dataset.path = f.path;
            const iconHtml = iconInfo.type === 'iconify'
                ? `<img src="${iconInfo.url}" class="explorer-file-icon" alt="" loading="lazy" decoding="async">`
                : `<i class="fas ${iconInfo.icon} btn-icon ${iconInfo.color}" aria-hidden="true"></i>`;
            el.innerHTML = `${iconHtml} ${f.name}`;
            el.onclick = () => {
                if (isDir) fetchFiles(f.path);
                else {
                    loadContent(f);
                    tree.querySelectorAll('.explorer-item').forEach(i => i.classList.remove('active'));
                    el.classList.add('active');
                }
            };
            tree.appendChild(el);
        });
    } catch (e) {
        tree.innerHTML = `<div class="explorer-item" style="color:var(--danger-color)">${e.message || 'ERR'}</div>`;
    }
}

const LANG_MAP = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript', ts: 'typescript', tsx: 'typescript', jsx: 'javascript',
    py: 'python', pyw: 'python', html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less', json: 'json',
    md: 'markdown', markdown: 'markdown', yaml: 'yaml', yml: 'yaml', xml: 'xml', svg: 'xml',
    sh: 'shell', bash: 'shell', zsh: 'shell', txt: 'plaintext'
};

function base64ToUtf8(base64) {
    const bin = atob((base64 || '').replace(/\n/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

async function loadContent(file) {
    currentOpenFilePath = file.path;
    setCdnUrl(file.path);
    const tree = document.getElementById('file-tree');
    tree.querySelectorAll('.explorer-item').forEach(i => i.classList.remove('active'));
    const safePath = (file.path || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const activeEl = tree.querySelector(`.explorer-item[data-path="${safePath}"]`);
    if (activeEl) activeEl.classList.add('active');
    try {
        const res = await fetch(file.url, { headers: getHeaders() });
        const data = await res.json();
        if (!res.ok) {
            const msg = (data && data.message) ? data.message : `HTTP ${res.status}`;
            if (editor) editor.setModel(monaco.editor.createModel(`// ${msg}`, 'plaintext'));
            return;
        }
        let content = '';
        if (data.content != null) {
            try {
                content = base64ToUtf8(data.content);
            } catch (_) {
                content = atob(data.content.replace(/\n/g, '')); // fallback Latin-1
            }
        } else if (data.download_url) {
            const raw = await fetch(data.download_url, { headers: getHeaders() });
            if (raw.ok) content = await raw.text();
            else content = '// File too large or binary. Use download_url.';
        } else {
            content = '// Binary or file too large to display.';
        }
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        const lang = LANG_MAP[ext] || 'plaintext';
        if (editor) editor.setModel(monaco.editor.createModel(content, lang));
        var preWrap = document.getElementById('md-pre-wrap');
        var preView = document.getElementById('md-pre-view');
        var previewHtml = document.getElementById('md-pre-view-html');
        if (preWrap && preView) {
            if (ext === 'md' || ext === 'markdown') {
                preView.textContent = content;
                if (previewHtml) {
                    try {
                        var html = (typeof marked !== 'undefined') ? (marked.parse ? marked.parse(content) : (typeof marked === 'function' ? marked(content) : '')) : '';
                        html = (html || '').replace(/<\/?(script|iframe)[^>]*>/gi, '');
                        previewHtml.innerHTML = html || '<em>No content</em>';
                    } catch (_) {
                        previewHtml.textContent = content;
                    }
                }
                document.getElementById('md-tab-preview').classList.add('active');
                document.getElementById('md-tab-raw').classList.remove('active');
                document.getElementById('md-panel-preview').classList.add('active');
                document.getElementById('md-panel-raw').classList.remove('active');
                preWrap.classList.add('visible');
                preWrap.setAttribute('aria-hidden', 'false');
            } else {
                preWrap.classList.remove('visible');
                preView.textContent = '';
                if (previewHtml) previewHtml.innerHTML = '';
                preWrap.setAttribute('aria-hidden', 'true');
            }
        }
    } catch (e) {
        if (editor) editor.setModel(monaco.editor.createModel(`// Error: ${e.message || 'Failed to load'}`, 'plaintext'));
        var preWrap = document.getElementById('md-pre-wrap');
        if (preWrap) { preWrap.classList.remove('visible'); preWrap.setAttribute('aria-hidden', 'true'); }
    }
}

function getRepoStatus(repo) {
    const lastPush = new Date(repo.pushed_at);
    const isStale = (new Date() - lastPush) / 86400000 > 180;
    return repo.archived ? 'ARCHIVED' : (isStale ? 'STALE' : 'ACTIVE');
}

function renderRepoList() {
    const filtered = repoFilter === 'all' ? allRepos
        : repoFilter === 'active' ? allRepos.filter(r => getRepoStatus(r) === 'ACTIVE')
            : allRepos.filter(r => r.has_pages);
    const list = document.getElementById('repo-list');
    const fragment = document.createDocumentFragment();
    for (let idx = 0; idx < filtered.length; idx++) {
        const repo = filtered[idx];
        const lastPush = new Date(repo.pushed_at);
        const status = getRepoStatus(repo);
        const ioUrl = repo.name === `${USERNAME}.github.io` ? `https://${USERNAME}.github.io/` : `https://${USERNAME}.github.io/${repo.name}/`;
        const row = document.createElement('div');
        row.className = 'agenda-row';
        row.innerHTML = `
                    <div class="index-col">${String(idx + 1).padStart(2, '0')}</div>
                    <div class="info-col">
                        <h3>${repo.name}</h3>
                        <p>${repo.description || "NO_PROTOCOL_DESCRIPTION"}</p>
                        <div class="meta-tags">
                            <span class="badge">${repo.language || "N/A"}</span>
                            <span class="status-badge ${status.toLowerCase()}">${status}</span>
                            <span class="badge">PUSH: ${lastPush.toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="stat-col">
                        <span>★ <b>${repo.stargazers_count}</b></span>
                        <span>⇅ <b>${repo.forks_count}</b></span>
                    </div>
                    <div class="action-col">
                        <a href="${repo.html_url}" target="_blank" class="btn-cmd"><i class="fab fa-github btn-icon" aria-hidden="true"></i> GITHUB</a>
                        <button class="btn code" onclick="openBrowser('${repo.name}')"><i class="fas fa-folder-open btn-icon" aria-hidden="true"></i>CODE</button>
                        ${repo.has_pages ? `<a href="${ioUrl}" target="_blank" class="btn btn-io"><i class="fas fa-globe btn-icon" aria-hidden="true"></i> LIVE</a>` : ''}
                    </div>
                `;
        fragment.appendChild(row);
    }
    list.innerHTML = '';
    list.appendChild(fragment);
}

async function fetchRepos() {
    const rateEl = document.getElementById('rate-limit');
    try {
        let repos = [];
        let page = 1;
        const perPage = 100;
        for (; ;) {
            const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=${perPage}&page=${page}`, { headers: getHeaders() });
            rateEl.textContent = `${res.headers.get('x-ratelimit-remaining') || '-'}/${res.headers.get('x-ratelimit-limit') || '-'}`;
            const chunk = await res.json();
            if (!res.ok) {
                const msg = (chunk && chunk.message) ? chunk.message : `HTTP ${res.status}`;
                console.error('fetchRepos:', msg);
                if (repos.length === 0) return;
                break;
            }
            if (!Array.isArray(chunk) || chunk.length === 0) break;
            repos = repos.concat(chunk);
            if (chunk.length < perPage) break;
            page++;
            if (page > 10) break;
        }
        allRepos = repos;
        let active = 0, pages = 0;
        repos.forEach(r => {
            if (getRepoStatus(r) === 'ACTIVE') active++;
            if (r.has_pages) pages++;
        });
        document.getElementById('stat-total').textContent = repos.length;
        document.getElementById('stat-active').textContent = active;
        document.getElementById('stat-pages').textContent = pages;
        renderRepoList();
    } catch (e) {
        console.error(e);
        rateEl.textContent = rateEl.textContent || 'ERR';
    }
}

document.querySelectorAll('.dashboard-grid .card--filter').forEach(card => {
    card.addEventListener('click', () => {
        repoFilter = card.dataset.filter;
        document.querySelectorAll('.dashboard-grid .card--filter').forEach(c => c.classList.remove('card--filter-active'));
        card.classList.add('card--filter-active');
        renderRepoList();
    });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
});

document.getElementById('session-id').textContent = Math.random().toString(16).slice(2, 10).toUpperCase();
loadStoredAuth();
applyView();

window.onload = function () {
    startBoot();
};

// Add these to your existing script section
document.addEventListener("DOMContentLoaded", function () {
    // Remove draggable attribute from all elements
    document.querySelectorAll('[draggable="true"]').forEach((el) => {
        el.removeAttribute("draggable");
    });

    // Prevent dragstart event
    document.addEventListener("dragstart", function (e) {
        e.preventDefault();
        return false;
    });

    // Prevent drop event
    document.addEventListener("drop", function (e) {
        e.preventDefault();
        return false;
    });

    // Prevent dragover event
    document.addEventListener("dragover", function (e) {
        e.preventDefault();
        return false;
    });
});