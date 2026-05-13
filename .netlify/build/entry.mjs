import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_B7H42dBe.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image/index.astro.mjs');
const _page1 = () => import('./pages/adoptieren/formular.astro.mjs');
const _page2 = () => import('./pages/adoptieren/_id_.astro.mjs');
const _page3 = () => import('./pages/adoptieren.astro.mjs');
const _page4 = () => import('./pages/api/keystatic/_---params_.astro.mjs');
const _page5 = () => import('./pages/datenschutz.astro.mjs');
const _page6 = () => import('./pages/helfen.astro.mjs');
const _page7 = () => import('./pages/impressum.astro.mjs');
const _page8 = () => import('./pages/keystatic/_---params_.astro.mjs');
const _page9 = () => import('./pages/linktree.astro.mjs');
const _page10 = () => import('./pages/mission.astro.mjs');
const _page11 = () => import('./pages/projekte.astro.mjs');
const _page12 = () => import('./pages/ueber-uns.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/adoptieren/formular.astro", _page1],
    ["src/pages/adoptieren/[id].astro", _page2],
    ["src/pages/adoptieren/index.astro", _page3],
    ["node_modules/@keystatic/astro/internal/keystatic-api.js", _page4],
    ["src/pages/datenschutz.astro", _page5],
    ["src/pages/helfen.astro", _page6],
    ["src/pages/impressum.astro", _page7],
    ["node_modules/@keystatic/astro/internal/keystatic-astro-page.astro", _page8],
    ["src/pages/linktree.astro", _page9],
    ["src/pages/mission.astro", _page10],
    ["src/pages/projekte.astro", _page11],
    ["src/pages/ueber-uns.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "ea11b206-2ec7-4488-b9a4-7439d1d536fc"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
