import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import RenderHTML, { TDefaultRendererProps } from "react-native-render-html";
import { iframeModel } from "@native-html/iframe-plugin";
import CustomImageRenderer from "@/components/CustomImageRenderer";
import InstagramEmbed from "@/components/iframe/InstagramEmbed";

interface StableContentProps {
    html: string;
    contentWidth: number;
}

const StableContent: React.FC<StableContentProps> = React.memo(
    ({ html, contentWidth }) => {
        const renderers = {
            img: (props) => <CustomImageRenderer {...props} contentWidth={contentWidth} />,
            iframe: (props: TDefaultRendererProps) => {
                let { src } = props.tnode.attributes;
                if (src) {
                    if (src.includes("instagram.com")) {
                        src = src.replace("/embed/captioned/", "/").split("?")[0];
                        return <InstagramEmbed url={src} />;
                    }
                    if (src.includes("youtube.com") || src.includes("youtu.be")) {
                        return (
                            <View style={{ marginVertical: 10 }}>
                                {/* YouTube embed placeholder */}
                            </View>
                        );
                    }
                }
                const { TDefaultRenderer, ...rest } = props;
                return <TDefaultRenderer {...rest} />;
            },
        };

        return (
            <View style={styles.htmlWrapper}>
                <RenderHTML
                    source={{ html }}
                    contentWidth={contentWidth}
                    customHTMLElementModels={{ iframe: iframeModel }}
                    renderers={renderers}
                    defaultTextProps={{ selectable: true }}
                    onLinkPress={(_, href) => {
                        if (href) Linking.openURL(href);
                    }}
                    tagsStyles={{
                        p: { marginTop: 15, marginBottom: 0 },
                        iframe: {
                            width: "100%",
                            height: contentWidth * 0.5625,
                        },
                    }}
                />
            </View>
        );
    }
);

export default StableContent;

const styles = StyleSheet.create({
    htmlWrapper: {
        flexDirection: "column",
    },
});
