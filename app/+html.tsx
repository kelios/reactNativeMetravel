// app/_document.tsx
import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

export default function Root({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <head>
            <meta charSet="utf-8" />
            <meta
                name="viewport"
                content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,viewport-fit=cover"
            />

            {/* Базовые, редко меняющиеся мета */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://metravel.by" />
            <meta property="og:image" content="https://metravel.by/og-preview.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content="https://metravel.by/og-preview.jpg" />

            {/* Resource Hints: дешёвый dns-prefetch вместо тяжёлого preconnect для некритичных доменов */}
            <link rel="dns-prefetch" href="//www.googletagmanager.com" />
            <link rel="dns-prefetch" href="//mc.yandex.ru" />
            <link rel="dns-prefetch" href="//app.termly.io" />
            <link rel="dns-prefetch" href="//belkraj.by" />
            <link rel="dns-prefetch" href="//mntzco.com" />

            {/* favicon */}
            <link rel="icon" href="/favicon.ico" />

            {/* Fonts */}
            <link
                rel="preload"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
                href="/fonts/roboto-var.woff2"
            />

            {/* Пример LCP preload (опционально) */}
            <link
                rel="preload"
                as="image"
                href="/images/hero.avif"
                imageSrcSet="/images/hero.avif 1x, /images/hero@2x.avif 2x"
                imageSizes="(min-width: 1024px) 60vw, 100vw"
            />

            {/* Глобальные стили и сброс прокрутки RNW */}
            <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
            <ScrollViewStyleReset />

            {/* ВАЖНО: отключаем Expo Router Inspector раньше всех скриптов */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `try { window.__EXPO_ROUTER_INSPECTOR = false; } catch(e) {}`,
                }}
            />
        </head>

        <body>
        {children}

        {/* Повышаем приоритет загрузки LCP-изображения (safe) */}
        <script
            dangerouslySetInnerHTML={{
                __html: `
(function(){
  var markLCP = function(){
    var el = document.querySelector('img[data-lcp]');
    if (!el) return;
    try { if (!el.getAttribute('fetchpriority')) el.setAttribute('fetchpriority','high'); } catch(e){}
    if (el.decode) { el.decode().catch(function(){}); }
  };
  if (document.readyState === 'complete' || document.readyState === 'interactive') markLCP();
  else document.addEventListener('DOMContentLoaded', markLCP, { once: true });
})();
`,
            }}
        />

        {/* Внешние скрипты — грузим на idle/после согласия/без GPC/DNT */}
        <script
            dangerouslySetInnerHTML={{
                __html: `
(function(){
  var armed = false;
  function onIdle(fn){
    if ('requestIdleCallback' in window) { requestIdleCallback(function(){ fn(); }, {timeout:3000}); }
    else { setTimeout(fn, 2000); }
  }

  function hasConsent(){
    try {
      var ls = localStorage.getItem('cookie_consent') || localStorage.getItem('consentShown');
      var ck = document.cookie || '';
      return !!ls || /consent=opt(in|_in)/i.test(ck);
    } catch(_) { return false; }
  }

  function privacyBlocks(){
    try {
      if (navigator.globalPrivacyControl) return true;
      if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return true;
    } catch(_){}
    return false;
  }

  function safeAppendScript(src, opts){
    if (!src) return;
    if (document.querySelector('script[src^="'+src.split('?')[0]+'"]')) return;
    var s = document.createElement('script');
    s.src = src;
    if (opts && opts.async) s.async = true;
    if (opts && opts.defer) s.defer = true;
    if (opts && opts.crossOrigin) s.crossOrigin = opts.crossOrigin;
    (opts && opts.parent === 'head' ? document.head : document.body).appendChild(s);
  }

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }

  window.addEventListener('load', function(){
    onIdle(function(){
      if (!privacyBlocks()) {
        safeAppendScript('https://www.googletagmanager.com/gtag/js?id=G-GBT9YNPXKB', { async: true, parent: 'head', crossOrigin: 'anonymous' });
        gtag('js', new Date());
        gtag('config', 'G-GBT9YNPXKB', { transport_type: 'beacon', send_page_view: false });
      }

      if (!privacyBlocks()) {
        (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          k=e.createElement(t),a=e.getElementsByTagName(t)[0];
          k.async=1;k.defer=1;k.src=r;a.parentNode.insertBefore(k,a);
        })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        if (typeof ym === 'function') {
          ym(62803912, "init", {
            clickmap:false,
            trackLinks:true,
            accurateTrackBounce:true,
            ecommerce:"dataLayer",
            defer:true
          });
        }
      }

      if (hasConsent() === false) {
        safeAppendScript('https://app.termly.io/resource-blocker/031ae6f7-458d-4853-98e5-098ad6cee542?autoBlock=on', { defer: true });
      }

      safeAppendScript('https://mntzco.com/NDIzMjc4.js?t=423278', { async: true, defer: true });
    });
  });
})();
`,
            }}
        />

        <noscript>
            <img
                src="https://mc.yandex.ru/watch/62803912"
                style={{ position: 'absolute', left: '-9999px' }}
                alt=""
            />
        </noscript>
        </body>
        </html>
    );
}

const responsiveBackground = `
* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  font-family: 'Roboto', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
  background-color: #fff;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
img, svg, video, canvas, audio, iframe, embed, object { display:block; max-width:100%; }
img { height:auto; }
figure { margin:0; }
iframe { border:0; }
.video-16x9, iframe[src*="youtube"], iframe[src*="player"] { aspect-ratio: 16 / 9; width:100%; }
.ad-slot, .tp-widget, .belkraj-slot { min-height: 520px; }
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
@media (prefers-color-scheme: dark) {
  body { background-color: #000; color: #fff; }
}
`;
