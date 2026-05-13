import '@astrojs/internal-helpers/path';
import '@astrojs/internal-helpers/remote';
import 'piccolore';
import { n as NOOP_MIDDLEWARE_HEADER, o as decodeKey } from './chunks/astro/server_DtUpPWNc.mjs';
import 'clsx';
import 'es-module-lexer';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/daniilsvisnakovs/cc-projects/travel2rescue/","cacheDir":"file:///Users/daniilsvisnakovs/cc-projects/travel2rescue/node_modules/.astro/","outDir":"file:///Users/daniilsvisnakovs/cc-projects/travel2rescue/dist/","srcDir":"file:///Users/daniilsvisnakovs/cc-projects/travel2rescue/src/","publicDir":"file:///Users/daniilsvisnakovs/cc-projects/travel2rescue/public/","buildClientDir":"file:///Users/daniilsvisnakovs/cc-projects/travel2rescue/dist/","buildServerDir":"file:///Users/daniilsvisnakovs/cc-projects/travel2rescue/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"always"}}},{"file":"adoptieren/formular/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/adoptieren/formular","isIndex":false,"type":"page","pattern":"^\\/adoptieren\\/formular\\/$","segments":[[{"content":"adoptieren","dynamic":false,"spread":false}],[{"content":"formular","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/adoptieren/formular.astro","pathname":"/adoptieren/formular","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"adoptieren/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/adoptieren","isIndex":true,"type":"page","pattern":"^\\/adoptieren\\/$","segments":[[{"content":"adoptieren","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/adoptieren/index.astro","pathname":"/adoptieren","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"datenschutz/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/datenschutz","isIndex":false,"type":"page","pattern":"^\\/datenschutz\\/$","segments":[[{"content":"datenschutz","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/datenschutz.astro","pathname":"/datenschutz","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"helfen/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/helfen","isIndex":false,"type":"page","pattern":"^\\/helfen\\/$","segments":[[{"content":"helfen","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/helfen.astro","pathname":"/helfen","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"impressum/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/impressum","isIndex":false,"type":"page","pattern":"^\\/impressum\\/$","segments":[[{"content":"impressum","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/impressum.astro","pathname":"/impressum","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"linktree/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/linktree","isIndex":false,"type":"page","pattern":"^\\/linktree\\/$","segments":[[{"content":"linktree","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/linktree.astro","pathname":"/linktree","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"mission/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/mission","isIndex":false,"type":"page","pattern":"^\\/mission\\/$","segments":[[{"content":"mission","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/mission.astro","pathname":"/mission","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"projekte/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/projekte","isIndex":false,"type":"page","pattern":"^\\/projekte\\/$","segments":[[{"content":"projekte","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projekte.astro","pathname":"/projekte","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"ueber-uns/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/ueber-uns","isIndex":false,"type":"page","pattern":"^\\/ueber-uns\\/$","segments":[[{"content":"ueber-uns","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/ueber-uns.astro","pathname":"/ueber-uns","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image/","pattern":"^\\/_image\\/$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image/","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/api/keystatic/[...params]","pattern":"^\\/api\\/keystatic(?:\\/(.*?))?\\/$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"keystatic","dynamic":false,"spread":false}],[{"content":"...params","dynamic":true,"spread":true}]],"params":["...params"],"component":"node_modules/@keystatic/astro/internal/keystatic-api.js","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"external","_meta":{"trailingSlash":"always"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","isIndex":false,"route":"/keystatic/[...params]","pattern":"^\\/keystatic(?:\\/(.*?))?\\/$","segments":[[{"content":"keystatic","dynamic":false,"spread":false}],[{"content":"...params","dynamic":true,"spread":true}]],"params":["...params"],"component":"node_modules/@keystatic/astro/internal/keystatic-astro-page.astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"external","_meta":{"trailingSlash":"always"}}}],"site":"https://www.travel2rescue.de","base":"/","trailingSlash":"always","compressHTML":true,"componentMetadata":[["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/adoptieren/[id].astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/adoptieren/formular.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/adoptieren/index.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/datenschutz.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/helfen.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/impressum.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/linktree.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/mission.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/projekte.astro",{"propagation":"none","containsHead":true}],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/ueber-uns.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image/index.astro.mjs","\u0000@astro-page:src/pages/adoptieren/formular@_@astro":"pages/adoptieren/formular.astro.mjs","\u0000@astro-page:src/pages/adoptieren/[id]@_@astro":"pages/adoptieren/_id_.astro.mjs","\u0000@astro-page:src/pages/adoptieren/index@_@astro":"pages/adoptieren.astro.mjs","\u0000@astro-page:node_modules/@keystatic/astro/internal/keystatic-api@_@js":"pages/api/keystatic/_---params_.astro.mjs","\u0000@astro-page:src/pages/datenschutz@_@astro":"pages/datenschutz.astro.mjs","\u0000@astro-page:src/pages/helfen@_@astro":"pages/helfen.astro.mjs","\u0000@astro-page:src/pages/impressum@_@astro":"pages/impressum.astro.mjs","\u0000@astro-page:node_modules/@keystatic/astro/internal/keystatic-astro-page@_@astro":"pages/keystatic/_---params_.astro.mjs","\u0000@astro-page:src/pages/linktree@_@astro":"pages/linktree.astro.mjs","\u0000@astro-page:src/pages/mission@_@astro":"pages/mission.astro.mjs","\u0000@astro-page:src/pages/projekte@_@astro":"pages/projekte.astro.mjs","\u0000@astro-page:src/pages/ueber-uns@_@astro":"pages/ueber-uns.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_B7H42dBe.mjs","/Users/daniilsvisnakovs/cc-projects/travel2rescue/node_modules/unstorage/drivers/netlify-blobs.mjs":"chunks/netlify-blobs_DM36vZAS.mjs","/Users/daniilsvisnakovs/cc-projects/travel2rescue/node_modules/@keystatic/astro/internal/keystatic-page.js":"_astro/keystatic-page.CVA5ns60.js","/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/adoptieren/formular.astro?astro&type=script&index=0&lang.ts":"_astro/formular.astro_astro_type_script_index_0_lang.BY1pG4xy.js","/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/components/ContactForm.astro?astro&type=script&index=0&lang.ts":"_astro/ContactForm.astro_astro_type_script_index_0_lang.D2DXfofJ.js","/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/components/Header.astro?astro&type=script&index=0&lang.ts":"_astro/Header.astro_astro_type_script_index_0_lang.DhP_aM9k.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/pages/adoptieren/formular.astro?astro&type=script&index=0&lang.ts","const s=document.getElementById(\"adoption-form\"),e=document.getElementById(\"form-result\");s?.addEventListener(\"submit\",async n=>{if(n.preventDefault(),!e)return;const t=s.querySelector('button[type=\"submit\"]');t.disabled=!0,t.textContent=\"Wird gesendet...\";const o=new FormData(s),r=await(await fetch(\"https://api.web3forms.com/submit\",{method:\"POST\",body:o})).json();e.classList.remove(\"hidden\",\"text-red-400\",\"text-green-400\"),r.success?(e.textContent=\"Danke! Eileen meldet sich so schnell wie möglich per WhatsApp bei dir.\",e.classList.add(\"text-green-400\"),s.reset(),t.textContent=\"Gesendet ✓\"):(e.textContent=\"Etwas hat nicht funktioniert. Schreib uns direkt: travel2rescue@gmail.com\",e.classList.add(\"text-red-400\"),t.disabled=!1,t.textContent=\"Formular absenden\"),e.classList.remove(\"hidden\")});"],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/components/ContactForm.astro?astro&type=script&index=0&lang.ts","const t=document.getElementById(\"contact-form\"),e=document.getElementById(\"form-result\");t?.addEventListener(\"submit\",async s=>{if(s.preventDefault(),!e)return;const n=new FormData(t),r=await(await fetch(\"https://api.web3forms.com/submit\",{method:\"POST\",body:n})).json();e.classList.remove(\"hidden\",\"text-red-400\",\"text-green-400\"),r.success?(e.textContent=\"Danke! Wir melden uns so schnell wie möglich bei dir.\",e.classList.add(\"text-green-400\"),t.reset()):(e.textContent=\"Etwas hat nicht funktioniert. Schreib uns direkt: travel2rescue@gmail.com\",e.classList.add(\"text-red-400\")),e.classList.remove(\"hidden\")});"],["/Users/daniilsvisnakovs/cc-projects/travel2rescue/src/components/Header.astro?astro&type=script&index=0&lang.ts","const e=document.getElementById(\"mobile-menu-btn\"),t=document.getElementById(\"mobile-menu\");e?.addEventListener(\"click\",()=>{const n=!t?.classList.contains(\"hidden\");t?.classList.toggle(\"hidden\"),e.setAttribute(\"aria-expanded\",String(!n)),e.setAttribute(\"aria-label\",n?\"Menü öffnen\":\"Menü schließen\")});"]],"assets":["/_astro/_id_.CCi9LIlg.css","/_redirects","/favicon.png","/logo-green.png","/logo.avif","/_astro/keystatic-page.CVA5ns60.js","/images/DSCF2189.jpeg","/images/DSCF2190.jpeg","/images/DSCF2200.jpeg","/images/DSCF2208.jpeg","/images/DSCF2212.jpeg","/images/DSCF2220.jpeg","/images/DSCF2224.jpeg","/images/DSCF2230.jpeg","/images/DSCF2232.jpeg","/images/DSCF9549.jpg","/images/IMG_0005(1).jpeg","/images/IMG_0005(1).jpg","/images/IMG_0005.jpeg","/images/IMG_0013.jpeg","/images/IMG_0020.jpeg","/images/IMG_0622.jpeg","/images/IMG_0787.jpeg","/images/IMG_0891.jpeg","/images/IMG_0891.jpg","/images/IMG_0912.jpeg","/images/IMG_0991.jpeg","/images/IMG_0991.jpg","/images/IMG_2027.jpeg","/images/IMG_2027.jpg","/images/IMG_2106.jpeg","/images/IMG_2108.jpeg","/images/IMG_2193.jpeg","/images/IMG_2198.jpeg","/images/IMG_2198.jpg","/images/IMG_2205.jpeg","/images/IMG_2322.jpeg","/images/IMG_2322.jpg","/images/IMG_2337.jpeg","/images/IMG_2346.jpeg","/images/IMG_2371.jpeg","/images/IMG_2371.jpg","/images/IMG_2384.jpeg","/images/IMG_2463.jpeg","/images/IMG_2543.jpeg","/images/IMG_2543.jpg","/images/IMG_2793.jpeg","/images/IMG_2820.jpeg","/images/IMG_2820.jpg","/images/IMG_2977.jpeg","/images/IMG_2977.jpg","/images/IMG_2994.jpeg","/images/IMG_2995.jpeg","/images/IMG_3003.jpeg","/images/IMG_3554.jpeg","/images/IMG_3554.jpg","/images/IMG_3598.jpeg","/images/IMG_3893.jpeg","/images/IMG_3893.jpg","/images/IMG_4310.jpeg","/images/IMG_4642.jpeg","/images/IMG_4737.jpeg","/images/IMG_4737.jpg","/images/IMG_5239.jpeg","/images/IMG_5371.jpeg","/images/IMG_5371.jpg","/images/IMG_5451.jpeg","/images/IMG_5452.jpeg","/images/IMG_5810.jpeg","/images/IMG_5854.jpeg","/images/IMG_6246.jpeg","/images/IMG_6582.jpeg","/images/IMG_6584.png","/images/IMG_7449.jpeg","/images/IMG_7449.jpg","/images/IMG_7758.jpeg","/images/IMG_7761.jpeg","/images/IMG_7761.jpg","/images/IMG_8309.jpeg","/images/IMG_8636.jpeg","/images/IMG_8737.jpeg","/images/IMG_8739.jpeg","/images/IMG_8749.jpeg","/images/IMG_8790.jpeg","/images/IMG_9294.jpeg","/images/IMG_9452.jpeg","/images/IMG_9452.jpg","/images/eileen portraig .jpeg","/images/fynn eileen dogs horizontal-2.jpeg","/images/fynn eileen dogs horizontal.jpeg","/images/fynn eileen dogs horizontal.jpg","/images/fynn eileen walking.jpeg","/images/fynn portrait.jpeg","/images/fynneileen dogs.jpeg","/images/logoong.png","/images/new_hero.jpeg","/images/travel2rescue favicon.png","/images/travel2rescue green font only.png","/adoptieren/formular/index.html","/adoptieren/index.html","/datenschutz/index.html","/helfen/index.html","/impressum/index.html","/linktree/index.html","/mission/index.html","/projekte/index.html","/ueber-uns/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"FkgK4FgayR6XylbdkMP+32jdZjS3NJtCbHBwki4qUdw=","sessionConfig":{"driver":"netlify-blobs","options":{"name":"astro-sessions","consistency":"strong"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/netlify-blobs_DM36vZAS.mjs');

export { manifest };
