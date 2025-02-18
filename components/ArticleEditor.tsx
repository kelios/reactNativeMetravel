import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
//import { CKEditor } from '@ckeditor/ckeditor5-react';
//import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface ArticleEditorProps {
    content?: string;
    onChange: (content: string) => void;
    label?: string;
    height?: number;
    uploadUrl: string;
    idTravel?: string | null;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
                                                         content = '',
                                                         onChange,
                                                         label,
                                                         height = 400,
                                                         uploadUrl,
                                                         idTravel,
                                                     }) => {
    const [editorContent, setEditorContent] = useState<string>(content);
    const richText = useRef<any>(null);

    // Используем useCallback для предотвращения ненужных рендеров
    const handleEditorChange = useCallback((html: string) => {
        setEditorContent(html);
        onChange(html);
    }, [onChange]);

    // Обработка загрузки изображений для мобильных платформ
    const handleImageUpload = async (file: any) => {
        const data = new FormData();
        data.append('file', file);
        data.append('collection', 'description');
        if (idTravel) data.append('id', idTravel);

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: data,
            });
            const result = await response.json();
            return result.url; // Возвращаем URL загруженного изображения
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    // Адаптер для загрузки изображений в CKEditor
    class MyUploadAdapter {
        private loader: any;
        private uploadUrl: string;
        private idTravel?: string | null;

        constructor(loader: any, uploadUrl: string, idTravel?: string | null) {
            this.loader = loader;
            this.uploadUrl = uploadUrl;
            this.idTravel = idTravel;
        }

        upload() {
            return this.loader.file.then(
                (file: File) =>
                    new Promise((resolve, reject) => {
                        const data = new FormData();
                        data.append('file', file);
                        data.append('collection', 'description');
                        if (this.idTravel) data.append('id', this.idTravel);

                        fetch(this.uploadUrl, {
                            method: 'POST',
                            body: data,
                        })
                            .then(response => response.json())
                            .then(result => {
                                resolve({ default: result.url });
                            })
                            .catch(error => {
                                reject(error);
                            });
                    })
            );
        }

        abort() {
            // Abort the upload process if needed
        }
    }

    function MyCustomUploadAdapterPlugin(editor: any) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
            return new MyUploadAdapter(loader, uploadUrl, idTravel);
        };
    }

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            {Platform.OS === 'web' ? (
                <div style={{ ...styles.ckeditorContainer, height }}>


                </div>
            ) : (
                <View style={{ ...styles.editorContainer, height }}>
                    <RichEditor
                        ref={richText}
                        initialContentHTML={editorContent}
                        onChange={handleEditorChange}
                        style={styles.editor}
                        placeholder="Start typing your article here..."
                        androidHardwareAccelerationDisabled={true} // Для улучшения производительности на Android
                        useContainer={true}
                        initialHeight={height}
                        onMessage={(message) => {
                            if (message.type === 'image') {
                                handleImageUpload(message.data).then((url) => {
                                    if (url) {
                                        richText.current?.insertImage(url);
                                    }
                                });
                            }
                        }}
                    />
                    <RichToolbar
                        editor={richText}
                        actions={[
                            'bold', 'italic', 'underline', 'insertImage', 'insertLink',
                            'undo', 'redo', 'blockquote', 'orderedList', 'unorderedList',
                        ]}
                        style={styles.toolbar}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    ckeditorContainer: {
        border: '1px solid #ccc',
        borderRadius: 4,
        overflow: 'auto',
        width: '100%',
        maxHeight: 1000,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
    },
    editorContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
        backgroundColor: '#fff',
    },
    editor: {
        flex: 1,
    },
    toolbar: {
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
});

export default ArticleEditor;
