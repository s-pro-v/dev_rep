/**
 * SETTINGS MODULE (settings.js)
 * Manages Monaco Editor settings UI and configuration persistence.
 */

const SETTINGS_CONFIG = [
    {
        id: 'general',
        title: 'GENERAL',
        icon: 'fas fa-cog',
        items: [
            {
                key: 'fontSize',
                label: 'Font Size',
                icon: 'fas fa-font',
                type: 'range',
                min: 10,
                max: 24,
                default: 14,
                formatValue: (v) => `${v}px`
            },
            {
                key: 'lineHeight',
                label: 'Line Height',
                icon: 'fas fa-text-height',
                type: 'range',
                min: 0,
                max: 50,
                default: 0,
                formatValue: (v) => v == 0 ? 'Auto' : `${v}px`
            },
            {
                key: 'fontFamily',
                label: 'Font Family',
                icon: 'fas fa-font',
                type: 'select',
                default: '"JetBrains Mono", monospace',
                options: [
                    { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
                    { label: 'Share Tech Mono', value: '"Share Tech Mono", monospace' },
                    { label: 'Courier New', value: '"Courier New", monospace' },
                    { label: 'System Monospace', value: 'monospace' }
                ]
            },
            {
                key: 'tabSize',
                label: 'Tab Size',
                icon: 'fas fa-indent',
                type: 'range',
                min: 2,
                max: 8,
                default: 4,
                formatValue: (v) => `${v}`
            },
            {
                key: 'wordWrap',
                label: 'Word Wrap',
                icon: 'fas fa-text-width',
                type: 'select',
                default: 'off',
                options: [
                    { label: 'ON', value: 'on' },
                    { label: 'OFF', value: 'off' }
                ]
            },
            {
                key: 'minimap',
                label: 'Minimap',
                icon: 'fas fa-map',
                type: 'checkbox',
                default: true
            }
        ]
    },
    {
        id: 'cursor',
        title: 'CURSOR',
        icon: 'fas fa-mouse-pointer',
        items: [
            {
                key: 'cursorStyle',
                label: 'Cursor Style',
                icon: 'fas fa-mouse-pointer',
                type: 'select',
                default: 'line',
                options: [
                    { label: 'LINE', value: 'line' },
                    { label: 'BLOCK', value: 'block' },
                    { label: 'UNDERLINE', value: 'underline' },
                    { label: 'LINE THIN', value: 'line-thin' },
                    { label: 'BLOCK OUTLINE', value: 'block-outline' }
                ]
            },
            {
                key: 'cursorBlinking',
                label: 'Cursor Blinking',
                icon: 'fas fa-circle',
                type: 'select',
                default: 'blink',
                options: [
                    { label: 'BLINK', value: 'blink' },
                    { label: 'SMOOTH', value: 'smooth' },
                    { label: 'PHASE', value: 'phase' },
                    { label: 'EXPAND', value: 'expand' },
                    { label: 'SOLID', value: 'solid' }
                ]
            },
            {
                key: 'cursorSmoothCaretAnimation',
                label: 'Smooth Caret Animation',
                icon: 'fas fa-magic',
                type: 'checkbox',
                default: true
            }
        ]
    },
    {
        id: 'formatting',
        title: 'FORMATTING',
        icon: 'fas fa-code',
        items: [
            {
                key: 'autoClosingBrackets',
                label: 'Auto Close Brackets',
                icon: 'fas fa-brackets-curly',
                type: 'select',
                default: 'always',
                options: [
                    { label: 'ALWAYS', value: 'always' },
                    { label: 'LANGUAGE DEFINED', value: 'languageDefined' },
                    { label: 'BEFORE WHITESPACE', value: 'beforeWhitespace' },
                    { label: 'NEVER', value: 'never' }
                ]
            },
            {
                key: 'autoClosingQuotes',
                label: 'Auto Close Quotes',
                icon: 'fas fa-quote-right',
                type: 'select',
                default: 'always',
                options: [
                    { label: 'ALWAYS', value: 'always' },
                    { label: 'LANGUAGE DEFINED', value: 'languageDefined' },
                    { label: 'BEFORE WHITESPACE', value: 'beforeWhitespace' },
                    { label: 'NEVER', value: 'never' }
                ]
            },
            {
                key: 'bracketPairColorization',
                label: 'Bracket Pair Colorization',
                icon: 'fas fa-palette',
                type: 'checkbox',
                default: true
            },
            {
                key: 'folding',
                label: 'Folding',
                icon: 'fas fa-code-branch',
                type: 'checkbox',
                default: true
            },
            {
                key: 'insertSpaces',
                label: 'Insert Spaces',
                icon: 'fas fa-indent',
                type: 'select',
                default: 'true',
                options: [
                    { label: 'SPACES', value: 'true' },
                    { label: 'TABS', value: 'false' }
                ]
            },
            {
                key: 'autoIndent',
                label: 'Auto Indent',
                icon: 'fas fa-align-left',
                type: 'select',
                default: 'full',
                options: [
                    { label: 'NONE', value: 'none' },
                    { label: 'KEEP', value: 'keep' },
                    { label: 'BRACKETS', value: 'brackets' },
                    { label: 'ADVANCED', value: 'advanced' },
                    { label: 'FULL', value: 'full' }
                ]
            },
            {
                key: 'formatOnPaste',
                label: 'Format on Paste',
                icon: 'fas fa-paste',
                type: 'checkbox',
                default: true
            },
            {
                key: 'formatOnType',
                label: 'Format on Type',
                icon: 'fas fa-keyboard',
                type: 'checkbox',
                default: true
            },
            {
                key: 'matchBrackets',
                label: 'Match Brackets',
                icon: 'fas fa-brackets-curly',
                type: 'select',
                default: 'always',
                options: [
                    { label: 'ALWAYS', value: 'always' },
                    { label: 'NEAR', value: 'near' },
                    { label: 'NEVER', value: 'never' }
                ]
            }
        ]
    },
    {
        id: 'display',
        title: 'DISPLAY',
        icon: 'fas fa-eye',
        items: [
            {
                key: 'renderWhitespace',
                label: 'Render Whitespace',
                icon: 'fas fa-eye-slash',
                type: 'select',
                default: 'none',
                options: [
                    { label: 'NONE', value: 'none' },
                    { label: 'BOUNDARY', value: 'boundary' },
                    { label: 'SELECTION', value: 'selection' },
                    { label: 'TRAILING', value: 'trailing' },
                    { label: 'ALL', value: 'all' }
                ]
            },
            {
                key: 'renderIndentGuides',
                label: 'Render Indent Guides',
                icon: 'fas fa-align-left',
                type: 'checkbox',
                default: true
            },
            {
                key: 'scrollBeyondLastLine',
                label: 'Scroll Beyond Last Line',
                icon: 'fas fa-arrows-alt-v',
                type: 'checkbox',
                default: false
            },
            {
                key: 'mouseWheelZoom',
                label: 'Mouse Wheel Zoom',
                icon: 'fas fa-search-plus',
                type: 'checkbox',
                default: true
            },
            {
                key: 'occurrencesHighlight',
                label: 'Occurrences Highlight',
                icon: 'fas fa-highlighter',
                type: 'checkbox',
                default: true
            },
            {
                key: 'selectionHighlight',
                label: 'Selection Highlight',
                icon: 'fas fa-marker',
                type: 'checkbox',
                default: true
            },
            {
                key: 'renderLineHighlight',
                label: 'Render Line Highlight',
                icon: 'fas fa-highlighter',
                type: 'select',
                default: 'all',
                options: [
                    { label: 'NONE', value: 'none' },
                    { label: 'GUTTER', value: 'gutter' },
                    { label: 'LINE', value: 'line' },
                    { label: 'ALL', value: 'all' }
                ]
            }
        ]
    },
    {
        id: 'advanced',
        title: 'ADVANCED',
        icon: 'fas fa-sliders-h',
        items: [
            {
                key: 'colorDecorators',
                label: 'Color Decorators',
                icon: 'fas fa-palette',
                type: 'checkbox',
                default: true
            },
            {
                key: 'links',
                label: 'Links',
                icon: 'fas fa-link',
                type: 'checkbox',
                default: true
            },
            {
                key: 'codeLens',
                label: 'Code Lens',
                icon: 'fas fa-code',
                type: 'checkbox',
                default: true
            },
            {
                key: 'dragAndDrop',
                label: 'Drag and Drop',
                icon: 'fas fa-mouse',
                type: 'checkbox',
                default: true
            },
            {
                key: 'emptySelectionClipboard',
                label: 'Empty Selection Clipboard',
                icon: 'fas fa-copy',
                type: 'checkbox',
                default: true
            },
            {
                key: 'copyWithSyntaxHighlighting',
                label: 'Copy with Syntax Highlighting',
                icon: 'fas fa-highlighter',
                type: 'checkbox',
                default: true
            },
            {
                key: 'smoothScrolling',
                label: 'Smooth Scrolling',
                icon: 'fas fa-sliders-h',
                type: 'checkbox',
                default: true
            },
            {
                key: 'roundedSelection',
                label: 'Rounded Selection',
                icon: 'fas fa-circle',
                type: 'checkbox',
                default: true
            },
            {
                key: 'multiCursorModifier',
                label: 'Multi Cursor Modifier',
                icon: 'fas fa-mouse-pointer',
                type: 'select',
                default: 'alt',
                options: [
                    { label: 'CTRL/CMD', value: 'ctrlCmd' },
                    { label: 'ALT', value: 'alt' }
                ]
            },
            {
                key: 'showFoldingControls',
                label: 'Show Folding Controls',
                icon: 'fas fa-code-branch',
                type: 'select',
                default: 'mouseover',
                options: [
                    { label: 'ALWAYS', value: 'always' },
                    { label: 'MOUSEOVER', value: 'mouseover' },
                    { label: 'NEVER', value: 'never' }
                ]
            },
            {
                key: 'suggestOnTriggerCharacters',
                label: 'Suggest on Trigger Characters',
                icon: 'fas fa-lightbulb',
                type: 'checkbox',
                default: true
            },
            {
                key: 'acceptSuggestionOnEnter',
                label: 'Accept Suggestion on Enter',
                icon: 'fas fa-keyboard',
                type: 'select',
                default: 'on',
                options: [
                    { label: 'ON', value: 'on' },
                    { label: 'SMART', value: 'smart' },
                    { label: 'OFF', value: 'off' }
                ]
            },
            {
                key: 'quickSuggestionsDelay',
                label: 'Quick Suggestions Delay',
                icon: 'fas fa-clock',
                type: 'range',
                min: 0,
                max: 1000,
                step: 50,
                default: 100,
                formatValue: (v) => `${v}ms`
            }
        ]
    }
];

// Helper to retrieve saved settings from localStorage with fallback support
function getSavedSettings() {
    let saved = {};
    try {
        const primary = localStorage.getItem('monacoSettings');
        if (primary) {
            saved = JSON.parse(primary);
        } else {
            const legacy = localStorage.getItem('git_scanner_monaco_settings') || localStorage.getItem('codeEditorSettings');
            if (legacy) saved = JSON.parse(legacy);
        }
    } catch (e) {
        console.warn('Could not read saved Monaco settings', e);
    }
    return saved || {};
}

// --- SETTINGS UI RENDERER ---
function buildSettingItemHTML(item, saved = {}) {
    const currentVal = (saved && saved[item.key] !== undefined) ? saved[item.key] : item.default;

    if (item.type === 'range') {
        const initialVal = currentVal;
        const formattedVal = item.formatValue ? item.formatValue(initialVal) : initialVal;
        const stepAttr = item.step ? `step="${item.step}"` : '';
        return `
            <div class="setting-item setting-range">
                <label class="setting-label">
                    <i class="${item.icon} setting-icon"></i>
                    <span>${item.label}</span>
                </label>
                <div class="setting-control">
                    <input type="range" data-setting="${item.key}" min="${item.min}" max="${item.max}" ${stepAttr} value="${initialVal}">
                    <span class="setting-value">${formattedVal}</span>
                </div>
            </div>
        `;
    }

    if (item.type === 'checkbox') {
        const checkedAttr = currentVal ? 'checked' : '';
        return `
            <div class="setting-item">
                <label class="setting-label">
                    <i class="${item.icon} setting-icon"></i>
                    <span>${item.label}</span>
                    <input type="checkbox" data-setting="${item.key}" ${checkedAttr}>
                </label>
            </div>
        `;
    }

    if (item.type === 'select') {
        const selectedOpt = item.options.find(o => String(o.value) === String(currentVal)) || item.options[0];
        const optionsHTML = item.options.map(o => {
            const isSelected = String(o.value) === String(selectedOpt.value) ? 'ja-selected' : '';
            // Escape quote entities if present
            const safeVal = String(o.value).replace(/"/g, '&quot;');
            return `<div class="ja-select-item ${isSelected}" data-value="${safeVal}"><span class="ja-select-prefix">»</span>${o.label}</div>`;
        }).join('');

        return `
            <div class="setting-item setting-select">
                <label class="setting-label">
                    <i class="${item.icon} setting-icon"></i>
                    <span>${item.label}</span>
                </label>
                <div class="ja-select-wrap" data-setting="${item.key}">
                    <div class="btn-bg full-width">
                        <button type="button" class="ja-select-btn">
                            <span class="ja-select-label">${selectedOpt.label}</span>
                            <span class="ja-select-arrow">▼</span>
                        </button>
                    </div>
                    <div class="ja-select-list">
                        ${optionsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    return '';
}

function renderSettingsPanel() {
    const container = document.getElementById('settingsContainer');
    const existingSidebarBody = document.getElementById('settingsSidebarBody');
    if (!container && !existingSidebarBody) return;

    const saved = getSavedSettings();

    const tabsHTML = SETTINGS_CONFIG.map((category, idx) => `
        <div class="settings-tab ${idx === 0 ? 'active' : ''}" data-tab="${category.id}">
            <i class="${category.icon} settings-tab-icon"></i> ${category.title}
        </div>
    `).join('');

    const contentsHTML = SETTINGS_CONFIG.map((category, idx) => `
        <div id="settings-${category.id}" class="settings-tab-content ${idx === 0 ? 'active' : ''}">
            ${category.items.map(item => buildSettingItemHTML(item, saved)).join('')}
        </div>
    `).join('');

    if (container) {
        container.innerHTML = `
            <div id="settingsOverlay" class="settings-sidebar-overlay"></div>
            <aside id="settingsSidebar" class="settings-sidebar" aria-label="Ustawienia edytora">
                <div class="settings-sidebar-header">
                    <span class="settings-sidebar-title"><i class="fas fa-sliders-h"></i> Monaco Editor</span>
                    <button class="action-btn close-settings" id="closeSettingsButton" type="button" aria-label="Zamknij">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="settingsSidebarBody" class="settings-sidebar-body">
                    <div class="settings-tabs">
                        ${tabsHTML}
                    </div>
                    ${contentsHTML}
                </div>
            </aside>
        `;
    } else if (existingSidebarBody) {
        existingSidebarBody.innerHTML = `
            <div class="settings-tabs">
                ${tabsHTML}
            </div>
            ${contentsHTML}
        `;
    }

    setupSettingsEventListeners();
}

// --- SETTINGS CONTROLLER ---
window.openSettings = function () {
    if (!document.getElementById('settingsSidebar')) {
        renderSettingsPanel();
    }
    document.getElementById('settingsSidebar')?.classList.add('active');
    document.getElementById('settingsOverlay')?.classList.add('active');
};

window.closeSettings = function () {
    document.getElementById('settingsSidebar')?.classList.remove('active');
    document.getElementById('settingsOverlay')?.classList.remove('active');
};

window.showSettings = window.openSettings;

window.switchSettingsTab = function (tabName) {
    const sidebar = document.getElementById('settingsSidebar');
    if (!sidebar) return;

    const tabs = sidebar.querySelectorAll('.settings-tab');
    tabs.forEach(t => {
        if (t.dataset.tab === tabName) t.classList.add('active');
        else t.classList.remove('active');
    });

    const tabContents = sidebar.querySelectorAll('.settings-tab-content');
    tabContents.forEach(c => c.classList.remove('active'));

    const targetContent = document.getElementById(`settings-${tabName}`);
    if (targetContent) targetContent.classList.add('active');
};

window.updateSetting = function (key, val) {
    const saved = getSavedSettings();
    saved[key] = val;
    try {
        localStorage.setItem('monacoSettings', JSON.stringify(saved));
        localStorage.setItem('git_scanner_monaco_settings', JSON.stringify(saved));
        localStorage.setItem('codeEditorSettings', JSON.stringify(saved));
    } catch (e) { }

    const editor = window.monacoEditor;
    if (!editor) return;

    const options = {};
    if (key === 'fontSize') options.fontSize = val;
    else if (key === 'lineHeight') options.lineHeight = val;
    else if (key === 'fontFamily') options.fontFamily = val;
    else if (key === 'tabSize') {
        editor.getModel()?.updateOptions({ tabSize: val });
        options.tabSize = val;
    }
    else if (key === 'wordWrap') options.wordWrap = val;
    else if (key === 'minimap') options.minimap = { enabled: val };
    else if (key === 'cursorStyle') options.cursorStyle = val;
    else if (key === 'cursorBlinking') options.cursorBlinking = val;
    else if (key === 'cursorSmoothCaretAnimation') options.cursorSmoothCaretAnimation = val ? "on" : "off";
    else if (key === 'autoClosingBrackets') options.autoClosingBrackets = val;
    else if (key === 'autoClosingQuotes') options.autoClosingQuotes = val;
    else if (key === 'bracketPairColorization') options.bracketPairColorization = { enabled: val };
    else if (key === 'folding') options.folding = val;
    else if (key === 'insertSpaces') options.insertSpaces = (val === 'true' || val === true);
    else if (key === 'autoIndent') options.autoIndent = val;
    else if (key === 'formatOnPaste') options.formatOnPaste = val;
    else if (key === 'formatOnType') options.formatOnType = val;
    else if (key === 'matchBrackets') options.matchBrackets = val;
    else if (key === 'renderWhitespace') options.renderWhitespace = val;
    else if (key === 'renderIndentGuides') options.guides = { indent: val };
    else if (key === 'scrollBeyondLastLine') options.scrollBeyondLastLine = val;
    else if (key === 'mouseWheelZoom') options.mouseWheelZoom = val;
    else if (key === 'occurrencesHighlight') options.occurrencesHighlight = val;
    else if (key === 'selectionHighlight') options.selectionHighlight = val;
    else if (key === 'renderLineHighlight') options.renderLineHighlight = val;
    else if (key === 'colorDecorators') options.colorDecorators = val;
    else if (key === 'links') options.links = val;
    else if (key === 'codeLens') options.codeLens = val;
    else if (key === 'dragAndDrop') options.dragAndDrop = val;
    else if (key === 'emptySelectionClipboard') options.emptySelectionClipboard = val;
    else if (key === 'copyWithSyntaxHighlighting') options.copyWithSyntaxHighlighting = val;
    else if (key === 'smoothScrolling') options.smoothScrolling = val;
    else if (key === 'roundedSelection') options.roundedSelection = val;
    else if (key === 'multiCursorModifier') options.multiCursorModifier = val;
    else if (key === 'showFoldingControls') options.showFoldingControls = val;
    else if (key === 'suggestOnTriggerCharacters') options.suggestOnTriggerCharacters = val;
    else if (key === 'acceptSuggestionOnEnter') options.acceptSuggestionOnEnter = val;
    else if (key === 'quickSuggestionsDelay') options.quickSuggestionsDelay = val;

    editor.updateOptions(options);
};

function setupSettingsEventListeners() {
    // Header triggers in top HUD / UI
    const toggleSettingsBtn = document.getElementById('toggleSettingsButton');
    if (toggleSettingsBtn) {
        toggleSettingsBtn.addEventListener('click', window.openSettings);
    }

    const openSettingsBtn = document.getElementById('openSettingsButton');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', window.openSettings);
    }

    // Close button & overlay
    document.querySelectorAll('.close-settings').forEach(btn => {
        btn.addEventListener('click', window.closeSettings);
    });
    document.getElementById('closeSettingsButton')?.addEventListener('click', window.closeSettings);
    document.getElementById('settingsOverlay')?.addEventListener('click', window.closeSettings);

    // Settings Tab Switching
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            if (tabId) window.switchSettingsTab(tabId);
        });
    });

    // Dynamic Range Inputs Listener
    document.querySelectorAll('input[type="range"][data-setting]').forEach(input => {
        const key = input.dataset.setting;
        const valSpan = input.nextElementSibling;

        input.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (valSpan) {
                if (key === 'fontSize' || key === 'lineHeight') {
                    valSpan.textContent = (key === 'lineHeight' && val == 0) ? 'Auto' : `${val}px`;
                } else if (key === 'quickSuggestionsDelay') {
                    valSpan.textContent = `${val}ms`;
                } else {
                    valSpan.textContent = val;
                }
            }
        });

        input.addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            window.updateSetting(key, val);
        });
    });

    // Dynamic Checkbox Inputs Listener
    document.querySelectorAll('input[type="checkbox"][data-setting]').forEach(checkbox => {
        const key = checkbox.dataset.setting;
        checkbox.addEventListener('change', (e) => {
            window.updateSetting(key, e.target.checked);
        });
    });

    // Ja-select custom dropdown delegation (bound once globally)
    if (!window._jaSelectSettingsBound) {
        window._jaSelectSettingsBound = true;
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.ja-select-btn');
            if (btn) {
                const wrap = btn.closest('.ja-select-wrap');
                const list = wrap?.querySelector('.ja-select-list');
                const isOpen = btn.classList.contains('ja-open');

                document.querySelectorAll('.ja-select-btn').forEach(b => b.classList.remove('ja-open'));
                document.querySelectorAll('.ja-select-list').forEach(l => l.classList.remove('ja-visible'));
                document.querySelectorAll('.setting-item').forEach(s => s.classList.remove('ja-open'));

                if (!isOpen && list) {
                    btn.classList.add('ja-open');
                    list.classList.add('ja-visible');
                    btn.closest('.setting-item')?.classList.add('ja-open');
                }
                return;
            }

            const item = e.target.closest('.ja-select-item');
            if (item) {
                const wrap = item.closest('.ja-select-wrap');
                if (wrap) {
                    const btn = wrap.querySelector('.ja-select-btn');
                    const label = wrap.querySelector('.ja-select-label');
                    const list = wrap.querySelector('.ja-select-list');
                    const settingName = wrap.getAttribute('data-setting');
                    let val = item.getAttribute('data-value');

                    if (val === 'true') val = true;
                    else if (val === 'false') val = false;

                    if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1);
                    }

                    if (label) label.textContent = item.textContent.replace('»', '').trim();
                    wrap.querySelectorAll('.ja-select-item').forEach(i => i.classList.remove('ja-selected'));
                    item.classList.add('ja-selected');

                    if (btn) btn.classList.remove('ja-open');
                    if (list) list.classList.remove('ja-visible');
                    wrap.closest('.setting-item')?.classList.remove('ja-open');

                    if (settingName) {
                        window.updateSetting(settingName, val);
                    }
                }
                return;
            }

            if (!e.target.closest('.ja-select-wrap')) {
                document.querySelectorAll('.ja-select-btn').forEach(b => b.classList.remove('ja-open'));
                document.querySelectorAll('.ja-select-list').forEach(l => l.classList.remove('ja-visible'));
                document.querySelectorAll('.setting-item').forEach(s => s.classList.remove('ja-open'));
            }
        });
    }
}

window.loadSavedSettings = function () {
    const saved = getSavedSettings();
    if (!saved || Object.keys(saved).length === 0) return;

    for (const [key, value] of Object.entries(saved)) {
        if (window.monacoEditor) {
            window.updateSetting(key, value);
        }

        // Range inputs
        const rangeInput = document.querySelector(`input[type="range"][data-setting="${key}"]`);
        if (rangeInput) {
            rangeInput.value = value;
            const nextSpan = rangeInput.nextElementSibling;
            if (nextSpan && nextSpan.classList.contains('setting-value')) {
                if (key === 'fontSize' || key === 'lineHeight') {
                    nextSpan.textContent = (key === 'lineHeight' && value == 0) ? 'Auto' : value + 'px';
                } else if (key === 'quickSuggestionsDelay') {
                    nextSpan.textContent = value + 'ms';
                } else {
                    nextSpan.textContent = value;
                }
            }
        }

        // Checkbox inputs
        const checkboxInput = document.querySelector(`input[type="checkbox"][data-setting="${key}"]`);
        if (checkboxInput) {
            checkboxInput.checked = Boolean(value);
        }

        // Ja-select wraps
        const selectWrap = document.querySelector(`.ja-select-wrap[data-setting="${key}"]`);
        if (selectWrap) {
            const strVal = String(value);
            const items = selectWrap.querySelectorAll('.ja-select-item');
            let matchedItem = null;

            items.forEach(item => {
                let dVal = item.getAttribute('data-value');
                if (typeof dVal === 'string' && dVal.startsWith('"') && dVal.endsWith('"')) {
                    dVal = dVal.slice(1, -1);
                }
                if (String(dVal) === strVal) {
                    matchedItem = item;
                }
            });

            if (matchedItem) {
                items.forEach(i => i.classList.remove('ja-selected'));
                matchedItem.classList.add('ja-selected');

                const label = selectWrap.querySelector('.ja-select-label');
                if (label) {
                    label.textContent = matchedItem.textContent.replace('»', '').trim();
                }
            }
        }
    }
};

// Monaco Editor integration helpers
function setEditors(inputEditor, outputEditor) {
    window.monacoEditor = inputEditor || outputEditor || window.monacoEditor;
}

function getEditorOptions() {
    const saved = getSavedSettings();
    const opts = {
        automaticLayout: true,
        lineNumbersMinChars: 2,
        lineDecorationsWidth: 8,
        tabCompletion: 'on',
        snippetSuggestions: 'top',
        wordBasedSuggestions: 'matchingDocuments',
        suggestSelection: 'first',
        suggest: {
            showKeywords: true, showSnippets: true, showClasses: true, showFunctions: true,
            showVariables: true, showFields: true, showInterfaces: true, showStructs: true,
            showModules: true, showProperties: true, showEvents: true, showOperators: true,
            showUnits: true, showValues: true, showConstants: true, showEnums: true,
            showEnumMembers: true, showColors: true, showFiles: true, showReferences: true,
            showFolders: true, showTypeParameters: true, showIssues: true, showUsers: true,
            showText: true, showCustomcolors: true, showIcons: true
        },
        parameterHints: { enabled: true, cycle: false }
    };

    SETTINGS_CONFIG.forEach(category => {
        category.items.forEach(item => {
            const val = (saved[item.key] !== undefined) ? saved[item.key] : item.default;
            if (item.key === 'minimap') {
                opts.minimap = { enabled: Boolean(val) };
            } else if (item.key === 'bracketPairColorization') {
                opts.bracketPairColorization = { enabled: Boolean(val) };
            } else if (item.key === 'renderIndentGuides') {
                opts.guides = { indent: Boolean(val) };
            } else if (item.key === 'cursorSmoothCaretAnimation') {
                opts.cursorSmoothCaretAnimation = val ? "on" : "off";
            } else if (item.key === 'insertSpaces') {
                opts.insertSpaces = (val === 'true' || val === true);
            } else {
                opts[item.key] = val;
            }
        });
    });

    return opts;
}

function applyEditorOptions() {
    if (window.monacoEditor && typeof window.monacoEditor.updateOptions === 'function') {
        window.monacoEditor.updateOptions(getEditorOptions());
    }
}

// Export backward-compatible MonacoEditorSettings namespace
window.MonacoEditorSettings = {
    loadSettings: window.loadSavedSettings,
    getEditorOptions,
    applyEditorOptions,
    setEditors,
    showSettings: window.openSettings,
    openSettings: window.openSettings,
    closeSettings: window.closeSettings,
    switchSettingsTab: window.switchSettingsTab,
    updateSetting: window.updateSetting,
    getSettingsConfig: () => SETTINGS_CONFIG
};

// Initialize UI on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderSettingsPanel);
} else {
    renderSettingsPanel();
}
