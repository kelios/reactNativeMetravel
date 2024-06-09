import React, { useRef, useState } from 'react';
import { Platform, View, Text, StyleSheet, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'react-native-image-picker';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ label, value, onChange }) => {
    const webviewRef = useRef<WebView>(null);
    const [editorHtml, setEditorHtml] = useState(value);

    const handleImagePicker = () => {
        ImagePicker.launchImageLibrary(
            {
                mediaType: 'photo',
                includeBase64: true,
            },
            (response) => {
                if (response.assets && response.assets.length > 0) {
                    const base64Image = `data:image/jpeg;base64,${response.assets[0].base64}`;
                    if (Platform.OS === 'web') {
                        onChange(value + `<img src="${base64Image}" />`);
                    } else {
                        webviewRef.current?.injectJavaScript(`
              const quill = window.quill;
              const range = quill.getSelection();
              quill.insertEmbed(range.index, 'image', '${base64Image}');
            `);
                    }
                }
            }
        );
    };

    const handleMessage = (event: any) => {
        const { data } = event.nativeEvent;
        onChange(data);
        setEditorHtml(data);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            {Platform.OS === 'web' ? (
                <View style={styles.editorContainer}>
                    <ReactQuill value={editorHtml} onChange={onChange} />
                    <Button title="Добавить изображение" onPress={handleImagePicker} />
                </View>
            ) : (
                <WebView
                    ref={webviewRef}
                    originWhitelist={['*']}
                    source={{
                        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>React Quill</title>
              <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
              <style>
                body, html { height: 100%; margin: 0; padding: 0; }
                .quill-editor { height: 100%; }
              </style>
            </head>
            <body>
              <div id="editor-container" class="quill-editor"></div>
              <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
              <script>
                const quill = new Quill('#editor-container', {
                  theme: 'snow',
                  modules: {
                    toolbar: [
                      [{ header: [1, 2, false] }],
                      ['bold', 'italic', 'underline'],
                      ['image', 'code-block']
                    ]
                  },
                  placeholder: 'Compose an epic...',
                });
                window.quill = quill;
                quill.on('text-change', () => {
                  const html = quill.root.innerHTML;
                  window.ReactNativeWebView.postMessage(html);
                });
              </script>
            </body>
            </html>
          `,
                    }}
                    onMessage={handleMessage}
                    style={{ height: 300 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
    },
    editorContainer: {
        width: '100%',
        height: 300,
    },
});

export default RichTextEditor;
