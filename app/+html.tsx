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
            <meta name="description" content="Платформа путешествий MeTravel" />
            <title>MeTravel</title>

            <ScrollViewStyleReset />
            <script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="415100ea-b563-49ce-964d-ccf2c2dd2be5" type="text/javascript" async></script>
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
