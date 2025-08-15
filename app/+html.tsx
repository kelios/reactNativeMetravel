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

            <title>MeTravel — Найди место для путешествия и поделись своим</title>
            <meta
                name="description"
                content="MeTravel — платформа, где ты легко найдёшь вдохновение для следующего путешествия и сможешь рассказать о своём."
            />

            <meta property="og:type" content="website" />
            <meta property="og:title" content="MeTravel — Найди место для путешествия и поделись своим" />
            <meta
                property="og:description"
                content="Платформа для поиска маршрутов, мест и впечатлений. Делись своим опытом и находи вдохновение от других путешественников."
            />
            <meta property="og:url" content="https://metravel.by" />
            <meta property="og:image" content="https://metravel.by/og-preview.jpg" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="MeTravel — Найди место для путешествия и поделись своим" />
            <meta
                name="twitter:description"
                content="Платформа для поиска маршрутов, мест и впечатлений. Делись своим опытом и находи вдохновение от других путешественников."
            />
            <meta name="twitter:image" content="https://metravel.by/og-preview.jpg" />

            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
            <link rel="preconnect" href="https://mc.yandex.ru" crossOrigin="" />
            <link rel="preconnect" href="https://app.termly.io" />
            <link rel="preconnect" href="https://belkraj.by" crossOrigin="" />
            <link rel="icon" href="/favicon.ico" />

            {/* Fonts (optional self-hosted) */}
            <link rel="preload" as="font" type="font/woff2" crossOrigin="" href="/fonts/roboto-var.woff2" />
            <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />

            <ScrollViewStyleReset />
        </head>

        <body>
        {children}

        <script
            dangerouslySetInnerHTML={{
                __html: `
(function(){
  const onIdle = (fn)=> {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, {timeout:3000});
    else setTimeout(fn, 2000);
  };

  // Google Analytics (GTM gtag)
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }

  window.addEventListener('load', function(){
    onIdle(function(){
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-GBT9YNPXKB';
      document.body.appendChild(s);
      gtag('js', new Date());
      gtag('config', 'G-GBT9YNPXKB', { transport_type: 'beacon' });
    });

    // Yandex Metrica
    onIdle(function(){
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        k=e.createElement(t),a=e.getElementsByTagName(t)[0];
        k.async=1;k.defer=1;
        k.src=r;a.parentNode.insertBefore(k,a);
      })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym(62803912, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        ecommerce:"dataLayer"
      });
    });

    // Termly
    onIdle(function(){
      var s = document.createElement('script');
      s.defer = true;
      s.dataset.cookieconsent = 'ignore';
      s.src = 'https://app.termly.io/resource-blocker/031ae6f7-458d-4853-98e5-098ad6cee542?autoBlock=on';
      document.body.appendChild(s);
    });

    // TravelPayouts widget
    onIdle(function(){
      var s = document.createElement("script");
      s.async = true;
      s.defer = true;
      s.src = "https://mntzco.com/NDIzMjc4.js?t=423278";
      document.body.appendChild(s);
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
/* Base */
* { box-sizing: border-box; }
html, body { height: 100%; }
body {
  margin: 0;
  font-family: 'Roboto', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
  background-color: #fff;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

/* Media defaults to prevent CLS */
img, svg, video, canvas, audio, iframe, embed, object { display:block; max-width:100%; }
img { height:auto; }
figure { margin:0; }
iframe { border:0; }
.video-16x9, iframe[src*="youtube"], iframe[src*="player"] { aspect-ratio: 16 / 9; width:100%; }

/* Ad/widgets reserve */
+.ad-slot, .tp-widget, .belkraj-slot { min-height: 520px; }

/* Optional font (self-hosted) */
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto-var.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}

/* Dark scheme */
@media (prefers-color-scheme: dark) {
  body { background-color: #000; color: #fff; }
}
`;
