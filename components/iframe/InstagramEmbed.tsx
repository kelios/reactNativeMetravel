import React, { useEffect, useRef, useState } from "react";
import { View, Platform, StyleSheet } from "react-native";

interface InstagramEmbedProps {
    url: string;
}

const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ url }) => {
    const embedRef = useRef<HTMLDivElement | null>(null);
    const scriptLoaded = useRef(false);
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (Platform.OS === "web") {
            const scriptId = "instagram-embed-script";

            if (!document.getElementById(scriptId)) {
                const script = document.createElement("script");
                script.src = "https://www.instagram.com/embed.js";
                script.async = true;
                script.id = scriptId;
                document.body.appendChild(script);

                script.onload = () => {
                    scriptLoaded.current = true;
                    if (window.instgrm) {
                        window.instgrm.Embeds.process();
                    }
                    setIsRendered(true);
                };
            } else if (window.instgrm && !scriptLoaded.current) {
                scriptLoaded.current = true;
                setTimeout(() => {
                    window.instgrm.Embeds.process();
                    setIsRendered(true);
                }, 500);
            }
        }
    }, []);

    useEffect(() => {
        if (Platform.OS === "web" && window.instgrm) {
            const observer = new MutationObserver(() => {
                if (!isRendered && embedRef.current) {
                    window.instgrm.Embeds.process();
                    setIsRendered(true);
                }
            });

            if (embedRef.current) {
                observer.observe(embedRef.current, { childList: true, subtree: true });
            }

            return () => observer.disconnect();
        }
    }, [isRendered]);

    if (Platform.OS === "web") {
        return (
            <View style={styles.container}>
                <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={url}
                    data-instgrm-version="14"
                    ref={embedRef}
                />
            </View>
        );
    }

    const WebView = require("react-native-webview").WebView;
    return (
        <View style={styles.container}>
            <WebView source={{ uri: url }} style={styles.webview} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 600,
        width: "100%",
        overflow: "hidden",
    },
    webview: {
        flex: 1,
    },
});

export default React.memo(InstagramEmbed);
