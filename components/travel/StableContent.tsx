import React from "react";
import { View, StyleSheet, Linking, Text } from "react-native";
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

        // 1) Настраиваем кастомные рендереры для img/iframe.
        //    Здесь вы можете дополнительно обрабатывать разные сервисы (YouTube, Vimeo и т.д.)
        const renderers = {
            // Картинки будут рендериться вашим компонентом:
            img: (props) => <CustomImageRenderer {...props} contentWidth={contentWidth} />,

            // Обработка <iframe>:
            iframe: (props: TDefaultRendererProps) => {
                let { src } = props.tnode.attributes;
                // Проверяем, что src существует
                if (src) {
                    // Пример: Instagram
                    if (src.includes("instagram.com")) {
                        // Удаляем лишние части URL, если надо
                        src = src.replace("/embed/captioned/", "/").split("?")[0];
                        return <InstagramEmbed url={src} />;
                    }

                    // Пример: YouTube (минимальная демонстрация)
                    if (src.includes("youtube.com") || src.includes("youtu.be")) {
                        // В реальном проекте можно сделать отдельный <YouTubeEmbed />
                        // с полноценными элементами управления.
                        return (
                            <View style={{ marginVertical: 10 }}>

                            </View>
                        );
                    }
                }
                // Если это не Instagram и не YouTube, рендерим дефолтный iframe
                const { TDefaultRenderer, ...rest } = props;
                return <TDefaultRenderer {...rest} />;
            },
        };

        return (
            <View style={styles.htmlWrapper}>
                <RenderHTML
                    // Исходный HTML и ширина области
                    source={{ html }}
                    contentWidth={contentWidth}

                    // Подключаем модель для iframe
                    customHTMLElementModels={{ iframe: iframeModel }}

                    // Передаём наши кастомные рендереры
                    renderers={renderers}

                    // Разрешаем выделять текст (можно выключить, если нужно)
                    defaultTextProps={{ selectable: true }}

                    // Обработка кликов по ссылкам (<a>)
                    onLinkPress={(evt, href) => {
                        if (href) Linking.openURL(href);
                    }}

                    // Стили, которые будут применяться к определённым тегам
                    tagsStyles={{
                        // Пример отступов для абзацев
                        p: { marginTop: 15, marginBottom: 0 },

                        // iframe можно задать динамическую высоту
                        // Ниже пример для формата 16:9
                        iframe: {
                            width: "100%",
                            height: contentWidth * 0.5625, // 16:9 -> 0.5625
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
        // Если вы хотите классическую одну колонку (текст идёт сверху вниз):
        flexDirection: "column",

        // Если нужна верстка "газетного" типа —
        // раскомментируйте следующие строчки:
        // flexDirection: "row",
        // flexWrap: "wrap",

        // При желании: justifyContent: "flex-start" (или другой вариант)
    },
});
