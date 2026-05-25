/**
 * Next.js 14.2.35 ships block-cross-site.js calling parseUrl() from dist/lib/url.js,
 * but that module no longer exports parseUrl — dev WebSocket/HMR then throws
 * "(0 , _url.parseUrl) is not a function". This postinstall adds a minimal parseUrl.
 * Safe to run on any install; no-op if already present or file missing.
 */
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'lib', 'url.js')
if (!fs.existsSync(file)) process.exit(0)

let code = fs.readFileSync(file, 'utf8')
if (/\bparseUrl\s*:\s*function/.test(code) && /function parseUrl\(/.test(code)) {
  process.exit(0)
}

const dead = `0 && (module.exports = {
    getPathname: null,
    isFullStringUrl: null
});`
const deadNew = `0 && (module.exports = {
    getPathname: null,
    isFullStringUrl: null,
    parseUrl: null
});`

const exportsBlock = `_export(exports, {
    getPathname: function() {
        return getPathname;
    },
    isFullStringUrl: function() {
        return isFullStringUrl;
    }
});
const DUMMY_ORIGIN = "http://n";`

const exportsNew = `_export(exports, {
    getPathname: function() {
        return getPathname;
    },
    isFullStringUrl: function() {
        return isFullStringUrl;
    },
    parseUrl: function() {
        return parseUrl;
    }
});
function parseUrl(urlString) {
    try {
        const u = new URL(urlString);
        return {
            hostname: u.hostname
        };
    } catch {
        return null;
    }
}
const DUMMY_ORIGIN = "http://n";`

if (code.includes(dead)) code = code.replace(dead, deadNew)
if (code.includes(exportsBlock)) code = code.replace(exportsBlock, exportsNew)

if (!/function parseUrl\(/.test(code)) {
  console.warn('[fix-next-parseurl] Could not patch next/dist/lib/url.js — format unexpected. If dev WebSockets fail, reinstall next@14.2.35.')
  process.exit(0)
}

fs.writeFileSync(file, code)
console.log('[fix-next-parseurl] Applied parseUrl shim to next/dist/lib/url.js')
