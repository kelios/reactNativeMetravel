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
            <script type="text/javascript" src="https://app.termly.io/resource-blocker/031ae6f7-458d-4853-98e5-098ad6cee542?autoBlock=on" />
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
