/**
 * Moduł zdalnej autoryzacji GitHub API z deszyfrowaniem XOR
 * Źródło tokena: https://raw.githubusercontent.com/s-pro-v/json-lista/refs/heads/main/dev/auth.json
 */
(function (global) {
  "use strict";

  const AUTH_REMOTE_URL =
    "https://raw.githubusercontent.com/s-pro-v/json-lista/refs/heads/main/dev/auth.json";
  const OBFUSCATE_KEY =
    String.fromCharCode(119) +
    String.fromCharCode(53) +
    String.fromCharCode(103);

  let cachedToken = null;

  function base64ToUtf8(b64) {
    const bin = atob(b64); //[cite: 6, 16]
    const bytes = new Uint8Array(bin.length); //[cite: 6, 16]
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff; //[cite: 6, 16]
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes); //[cite: 6, 16]
  }

  function deobfuscate(str) {
    try {
      const raw = base64ToUtf8(str); //[cite: 6, 16]
      let out = ""; //[cite: 6, 16]
      for (let i = 0; i < raw.length; i++) {
        out += String.fromCharCode(
          raw.charCodeAt(i) ^
            OBFUSCATE_KEY.charCodeAt(i % OBFUSCATE_KEY.length),
        ); //[cite: 6, 16]
      }
      return out; //[cite: 6, 16]
    } catch (e) {
      return ""; //[cite: 6, 16]
    }
  }

  /**
   * Pobiera i odszyfrowuje klucz ze zdalnego repozytorium (z pamięcią podręczną).
   * @param {boolean} forceRefresh - Wymuszenie ponownego pobrania z pominięciem cache.
   * @returns {Promise<string>}
   */
  async function getAuthToken(forceRefresh = false) {
    if (cachedToken && !forceRefresh) {
      return cachedToken;
    }

    const res = await fetch(AUTH_REMOTE_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Błąd pobierania auth.json (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (!data || !data.sys_state) {
      throw new Error("Nieprawidłowa struktura: brak pola sys_state.");
    }

    const decrypted = deobfuscate(data.sys_state);
    if (!decrypted) {
      throw new Error("Błąd deszyfrowania tokena XOR.");
    }

    cachedToken = decrypted;
    return decrypted;
  }

  /**
   * Wymusza wyczyszczenie zapisanego w pamięci tokena.
   */
  function clearAuthCache() {
    cachedToken = null;
  }

  global.RemoteAuth = {
    getToken: getAuthToken,
    clearCache: clearAuthCache,
    deobfuscate: deobfuscate,
  };
})(typeof window !== "undefined" ? window : this);
