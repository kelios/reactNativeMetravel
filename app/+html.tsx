import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

export default function Root({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <head>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
                name="viewport"
                content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,viewport-fit=cover"
            />

            <title>MeTravel — Найди место для путешествия и поделись своим</title>
            <meta
                name="description"
                content="MeTravel — платформа, где ты легко найдёшь вдохновение для следующего путешествия и сможешь рассказать о своём."
            />

            {/* ----------  SEO / OG   ---------- */}
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

            {/* ----------  PERFORMANCE   ---------- */}
            {/* 🔧 шрифт сразу грузим, font-display:swap прописан в css */}
            <link
                rel="preload"
                href="/fonts/roboto-latin.woff2"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
            />

            {/* 🔧 preconnect для внешних доменов, чтобы сократить TTFB */}
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://app.termly.io" />
            <link rel="preconnect" href="https://mc.yandex.ru" />

            {/* 🔧 LCP-кандидат (hero-картинка) */}
            <link
                rel="preload"
                as="image"
                href="https://metravel.by/hero.webp"
                fetchpriority="high"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                rel="stylesheet"
            />
            <ScrollViewStyleReset />
            <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
            <link rel="icon" href="/favicon.ico" />
        </head>

        <body>
        {children}

        {/* ----------  ANALYTICS & 3rd-party (deferred)  ---------- */}
        {/* Termly cookie banner — defer, чтобы не блокировал parsing */}
        {/* 🔧 data-cookieconsent="ignore" отключает автоблок сетевых запросов */}
        <script
            defer                           // 🔧
            data-cookieconsent="ignore"     // 🔧
            src="https://app.termly.io/resource-blocker/031ae6f7-458d-4853-98e5-098ad6cee542?autoBlock=on"
        ></script>

        {/* Google Tag Manager */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GBT9YNPXKB"></script>
        <script
            defer                           // 🔧: пусть выполнится после parse
            dangerouslySetInnerHTML={{
                __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GBT9YNPXKB', { transport_type: 'beacon' });
            `,
            }}
        />

        {/* TravelPayouts widget — загружаем асинхронно */}
        <script
            dangerouslySetInnerHTML={{
                __html: `
              (function () {
                var s = document.createElement("script");
                s.async = true;
                s.defer = true;                       // 🔧
                s.src = "https://mntzco.com/NDIzMjc4.js?t=423278";
                document.body.appendChild(s);
              })();
            `,
            }}
        />

        {/* Yandex Metrica */}
        <script
            defer                           // 🔧
            dangerouslySetInnerHTML={{
                __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],
                k.async=1;k.defer=1;                   // 🔧
                k.src=r;a.parentNode.insertBefore(k,a)
              })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(62803912, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                ecommerce:"dataLayer"
              });
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
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body { background-color: #000; }
}
`;
