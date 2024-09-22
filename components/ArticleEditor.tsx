import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, TextInput } from 'react-native';
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
                                                         height = 400, // Увеличим стандартную высоту до 400px
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
                            height: 'auto', // Автоматическая настройка высоты
                            placeholder: 'Start typing your article here...', // Placeholder для UX
                        }}
                        onReady={(editor: any) => {
                            editor.editing.view.change((writer: any) => {
                                // Устанавливаем минимальную высоту и скролл
                                writer.setStyle(
                                    'min-height',
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
                <TextInput
                    style={{ ...styles.mobileEditor, height }}
                    multiline
                    numberOfLines={10}
                    value={editorContent}
                    onChangeText={handleEditorChange}
                    placeholder="Введите контент..."
                />
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
        overflow: 'hidden',
        width: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
    },
    mobileEditor: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        textAlignVertical: 'top',
        fontSize: 16,
        backgroundColor: '#fff',
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
