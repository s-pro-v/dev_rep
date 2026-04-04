/**
 * Powiadomienia w stylu Industrial HUD (alert.css).
 * API: HudNotify.toast(level, title, message?, durationMs?)
 *      HudNotify.confirm({ type, title, message, confirmText, cancelText }) -> Promise<boolean>
 */
(function (global) {
    'use strict';

    const TOAST_LEVEL_CLASS = {
        info: 'toast-info',
        success: 'toast-success',
        warning: 'toast-warning',
        critical: 'toast-critical'
    };
    const TOAST_LABEL = {
        info: 'INFO',
        success: 'OK',
        warning: 'WARN',
        critical: 'CRIT'
    };

    let confirmCallback = null;
    let confirmModalBound = false;

    function escapeHtml(str) {
        if (str == null) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    function closeConfirm(result) {
        const overlay = document.getElementById('hud-confirm-overlay');
        const modal = document.getElementById('hud-confirm-modal');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
        const fn = confirmCallback;
        confirmCallback = null;
        if (fn) fn(!!result);
    }

    function bindConfirmOnce() {
        if (confirmModalBound) return;
        confirmModalBound = true;
        document.getElementById('hud-confirm-close')?.addEventListener('click', function () { closeConfirm(false); });
        document.getElementById('hud-confirm-cancel')?.addEventListener('click', function () { closeConfirm(false); });
        document.getElementById('hud-confirm-ok')?.addEventListener('click', function () { closeConfirm(true); });
        document.getElementById('hud-confirm-overlay')?.addEventListener('click', function () { closeConfirm(false); });
        document.getElementById('hud-confirm-modal')?.addEventListener('click', function (e) { e.stopPropagation(); });
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            const modal = document.getElementById('hud-confirm-modal');
            if (!modal || !modal.classList.contains('active')) return;
            closeConfirm(false);
            e.preventDefault();
        });
    }

    function toast(level, title, message, durationMs) {
        const container = document.getElementById('hud-toast-container');
        if (!container) return;
        const lv = TOAST_LEVEL_CLASS[level] ? level : 'info';
        const duration = durationMs === undefined ? 5500 : durationMs;

        const el = document.createElement('div');
        el.className = ('toast ' + TOAST_LEVEL_CLASS[lv]).trim();
        el.setAttribute('role', 'status');
        el.innerHTML =
            '<div class="toast-header">' +
            '<span class="toast-label">' + escapeHtml(TOAST_LABEL[lv]) + '</span>' +
            '<button type="button" class="toast-close" aria-label="Zamknij"><i class="fas fa-times" aria-hidden="true"></i></button>' +
            '</div>' +
            '<div class="toast-title">' + escapeHtml(title || '') + '</div>' +
            (message ? '<div class="toast-message">' + escapeHtml(message) + '</div>' : '');

        function removeToast() {
            if (el.classList.contains('closing')) return;
            el.classList.add('closing');
            setTimeout(function () { el.remove(); }, 320);
        }

        const closeBtn = el.querySelector('.toast-close');
        if (closeBtn) closeBtn.addEventListener('click', removeToast);
        container.appendChild(el);

        let timer = duration > 0 ? setTimeout(removeToast, duration) : null;
        if (timer) {
            el.addEventListener('mouseenter', function () { if (timer) { clearTimeout(timer); timer = null; } });
            el.addEventListener('mouseleave', function () {
                if (!el.classList.contains('closing') && duration > 0) timer = setTimeout(removeToast, 2800);
            });
        }
    }

    function confirm(options) {
        bindConfirmOnce();
        return new Promise(function (resolve) {
            const overlay = document.getElementById('hud-confirm-overlay');
            const modal = document.getElementById('hud-confirm-modal');
            if (!overlay || !modal) {
                resolve(false);
                return;
            }
            options = options || {};
            const type = options.type || 'info';
            const title = options.title || 'Potwierdzenie';
            const message = options.message || '';
            const confirmText = options.confirmText || 'OK';
            const cancelText = options.cancelText || 'Anuluj';

            modal.setAttribute('data-alert-type', type);
            const t1 = document.getElementById('hud-confirm-title');
            const t2 = document.getElementById('hud-confirm-main-title');
            const msg = document.getElementById('hud-confirm-message');
            if (t1) t1.textContent = title;
            if (t2) t2.textContent = title;
            if (msg) msg.textContent = message;
            const okBtn = document.getElementById('hud-confirm-ok');
            const cancelBtn = document.getElementById('hud-confirm-cancel');
            if (okBtn) okBtn.textContent = confirmText;
            if (cancelBtn) cancelBtn.textContent = cancelText;

            confirmCallback = resolve;
            overlay.classList.add('active');
            modal.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
            modal.setAttribute('aria-hidden', 'false');
        });
    }

    function init() {
        bindConfirmOnce();
    }

    global.HudNotify = { toast: toast, confirm: confirm, init: init };
})(typeof window !== 'undefined' ? window : this);

document.addEventListener('DOMContentLoaded', function () {
    if (window.HudNotify) window.HudNotify.init();
});
