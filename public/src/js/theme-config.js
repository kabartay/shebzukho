/* =====================================================================
   theme-config.js  —  Applies saved palette before body paints.
   Loaded in <head>, runs synchronously — no colour flash on page load.

   To add a palette:
     1. Add [data-palette="myname"] { ... } in theme.css
     2. Add { key: 'myname', label: '...', attr: 'myname' } to the list
   ===================================================================== */
window.SITE_PALETTES = [
    { key: 'green', label: 'Зелёный · Green',  attr: null    },
    { key: 'earth', label: 'Земляной · Earth', attr: 'earth' },
];

window.SITE_DEFAULT_PALETTE = 'green';

(function () {
    var list = window.SITE_PALETTES;

    function find(key) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].key === key) return list[i];
        }
        return null;
    }

    function apply(key) {
        var e = find(key) || list[0];
        if (!e) return;
        if (e.attr) document.documentElement.setAttribute('data-palette', e.attr);
        else        document.documentElement.removeAttribute('data-palette');
    }

    var saved    = localStorage.getItem('palette');
    var startKey = (find(saved) ? saved : window.SITE_DEFAULT_PALETTE) || list[0].key;
    apply(startKey);

    window.__paletteState = { current: startKey };

    window.__applyPalette = function (key) {
        apply(key);
        localStorage.setItem('palette', key);
        window.__paletteState.current = key;
    };

    window.__cyclePalette = function () {
        var idx = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i].key === window.__paletteState.current) { idx = i; break; }
        }
        var next = list[(idx + 1) % list.length];
        window.__applyPalette(next.key);
        return next;
    };
})();
