import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface ArticleEditorProps {
    content?: string;
    onChange: (content: string) => void;
    label?: string;
    height?: number;
    uploadUrl: string;
    idTravel?: string|null;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ content,
                                                         onChange,
                                                         label,
                                                         height = 300,
                                                         uploadUrl,
                                                         idTravel
}) => {
    const [editorContent, setEditorContent] = useState<string>(content || '');

    const handleEditorChange = (data: string) => {
        setEditorContent(data);
        onChange && onChange(data);
    };

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
                        }}
                        onReady={(editor: any) => {
                            editor.editing.view.change((writer:any) => {
                                writer.setStyle(
                                    "height",
                                    `${height}px`,
                                    editor.editing.view.document.getRoot()
                                );
                            });
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
                <Text>Mobile editor not implemented in this example</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
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
    },
});

export default ArticleEditor;

class MyUploadAdapter {
    private loader: any;
    private uploadUrl: string;

    private idTravel? :string|null;

    constructor(loader: any, uploadUrl: string, idTravel?:string|null ) {
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
                    data.append('id', this.idTravel);

                    fetch(this.uploadUrl, {
                        method: 'POST',
                        body: data,
                    })
                        .then(response => response.json())
                        .then(result => {
                            // Resolve with the image URL that will be inserted into the editor
                            resolve({
                                default: result.url,
                            });
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
