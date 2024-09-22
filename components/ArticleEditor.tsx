import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
                                                         height = 800, // Увеличим высоту до 400px
                                                         uploadUrl,
                                                         idTravel,
                                                     }) => {
    const [editorContent, setEditorContent] = useState<string>(content);

    useEffect(() => {
        setEditorContent(content || '');
    }, [content]);

    const handleEditorChange = useCallback((data: string) => {
        setEditorContent(data);
        onChange(data);
    }, [onChange]);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            {Platform.OS === 'web' ? (
                <div style={{ ...styles.ckeditorContainer, height }}>
                    <CKEditor
                        editor={ClassicEditor}
                        data={editorContent}
                        config={{
                            extraPlugins: [MyCustomUploadAdapterPlugin],
                            toolbar: [
                                'heading', '|', 'bold', 'italic', 'link',
                                'bulletedList', 'numberedList', 'blockQuote',
                                '|', 'undo', 'redo', 'imageUpload'
                            ],
                            placeholder: 'Start typing your article here...',
                        }}
                        onReady={(editor: any) => {
                            editor.editing.view.change((writer: any) => {
                                // Устанавливаем минимальную высоту и скролл внутри редактора
                                writer.setStyle(
                                    'min-height',
                                    `${height}px`,
                                    editor.editing.view.document.getRoot()
                                );
                                writer.setStyle(
                                    'max-height',
                                    `${height}px`,
                                    editor.editing.view.document.getRoot()
                                );
                                writer.setStyle('overflow', 'auto', editor.editing.view.document.getRoot());
                            });

                            // Подключаем адаптер для загрузки изображений
                            editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
                                return new MyUploadAdapter(loader, uploadUrl, idTravel);
                            };
                        }}
                        onChange={(event: any, editor: any) => {
                            const data = editor.getData();
                            handleEditorChange(data);
                        }}
                    />
                </div>
            ) : (
                <Text style={styles.mobileText}>Mobile editor not implemented</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
        overflow: 'auto', // Важное свойство для включения скроллинга внутри CKEditor
        width: '100%',
        maxHeight: 1000, // Ограничение по высоте, чтобы текст не выходил за пределы видимой области
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
    },
    mobileText: {
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
    },
});

// Upload adapter class for handling file uploads
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
        return new MyUploadAdapter(loader, editor.config.get('uploadUrl'));
    };
}

export default ArticleEditor;
