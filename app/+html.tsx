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
                content="MeTravel — платформа, где ты легко найдёшь вдохновение для следующего путешествия и сможешь рассказать о своём. Реальные маршруты, впечатления, места и советы от других путешественников."
            />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content="MeTravel — Найди место для путешествия и поделись своим" />
            <meta
                property="og:description"
                content="Платформа для поиска маршрутов, мест и впечатлений. Делись своим опытом и находи вдохновение от других путешественников."
            />
            <meta property="og:url" content="https://metravel.by" />
            <meta property="og:image" content="https://metravel.by/og-preview.jpg" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="MeTravel — Найди место для путешествия и поделись своим" />
            <meta
                name="twitter:description"
                content="Платформа для поиска маршрутов, мест и впечатлений. Делись своим опытом и находи вдохновение от других путешественников."
            />
            <meta name="twitter:image" content="https://metravel.by/og-preview.jpg" />

            <script type="text/javascript" src="https://app.termly.io/resource-blocker/031ae6f7-458d-4853-98e5-098ad6cee542?autoBlock=on" />
            {/* Google Tag Manager */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-GBT9YNPXKB"></script>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                          window.dataLayer = window.dataLayer || [];
                          function gtag(){dataLayer.push(arguments);}
                          gtag('js', new Date());
                          gtag('config', 'G-GBT9YNPXKB');
                        `,
                }}
            />
            {/*https://app.travelpayouts.com/*/}
            <script
                data-noptimize="1"
                data-cfasync="false"
                data-wpfc-render="false"
                dangerouslySetInnerHTML={{
                    __html: `
            (function () {
              var script = document.createElement("script");
              script.async = 1;
              script.src = 'https://mntzco.com/NDIzMjc4.js?t=423278';
              document.head.appendChild(script);
            })();
        `
                }}
            />

            {/* Yandex Metrica */}
            <script
                type="text/javascript"
                dangerouslySetInnerHTML={{
                    __html: `
                            (function(m,e,t,r,i,k,a){
                                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                                m[i].l=1*new Date();
                                k=e.createElement(t),a=e.getElementsByTagName(t)[0],
                                k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                            })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                            ym("62803912", "init", {
                                clickmap:true,
                                trackLinks:true,
                                accurateTrackBounce:true,
                                ecommerce:"dataLayer"
                            });
                        `,
                }}
            />
            <noscript>
                <div>
                    <img
                        src={`https://mc.yandex.ru/watch/62803912`}
                        style={{ position: 'absolute', left: '-9999px' }}
                        alt=""
                    />
                </div>
            </noscript>

            <ScrollViewStyleReset />
            <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body>{children}</body>
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
  body {
    background-color: #000;
  }
}
`;
