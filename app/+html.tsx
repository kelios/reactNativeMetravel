import { ScrollViewStyleReset } from 'expo-router/html'
import React from "react";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta
                name="viewport"
                content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,viewport-fit=cover"
            />
            <meta name="description" content="Your site description here" />
            <meta name="keywords" content="your, keywords, here" />
            <title>My App</title>

            {/* Link to Google Fonts or any other font provider */}
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />

            {/* Disable body scrolling on web */}
            <ScrollViewStyleReset />

            {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
            <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
        {children}
        </body>
        </html>
    )
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
