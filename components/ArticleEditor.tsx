import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { uploadImage } from '@/src/api/travels';

let ReactQuill: any = null;

const isWeb = Platform.OS === 'web';
const isClient = typeof window !== 'undefined';

if (isWeb && isClient) {
    ReactQuill = require('react-quill');
    require('react-quill/dist/quill.snow.css');

    const style = document.createElement('style');
    style.innerHTML = `
    .ql-editor {
      min-height: 200px;
      font-size: 16px;
      line-height: 1.5;
      padding: 12px;
    }
    .ql-editor img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 12px auto;
      display: block;
    }`;
    document.head.appendChild(style);
}

interface ArticleEditorProps {
    label?: string;
    content: string;
    onChange: (html: string) => void;
    uploadUrl?: string;
    idTravel?: string;
}

function cleanHtml(html: string): string {
    return (typeof html === 'string' ? html : '')
        .replace(/<p><br><\/p>/g, '')
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/(<br>\s*){2,}/g, '<br>')
        .replace(/(<p><\/p>\s*)+/g, '')
        .trim();
}

const WebEditor: React.FC<ArticleEditorProps> = ({ label = 'Описание', content, onChange, uploadUrl, idTravel }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showHtmlMode, setShowHtmlMode] = useState(false);
    const lastHtmlRef = useRef(content);
    const quillRef = useRef<any>(null);

    useEffect(() => {
        if (isWeb && isClient) setIsMounted(true);
    }, []);

    const handleHtmlChange = (text: string) => {
        const cleaned = cleanHtml(text);
        if (cleaned !== lastHtmlRef.current) {
            lastHtmlRef.current = cleaned;
            onChange(cleaned);
        }
    };

    const handleInsertImage = async () => {
        if (!uploadUrl || !quillRef.current) {
            Alert.alert('Ошибка', 'Редактор не готов или не указан uploadUrl');
            return;
        }

        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        const index = range?.index || 0;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('collection', 'description');
                if (idTravel) formData.append('id', idTravel);

                const res = await uploadImage(formData);
                if (res?.url) {
                    editor.insertEmbed(index, 'image', res.url);
                    setTimeout(() => editor.setSelection(index + 1, 0), 50);
                }
            } catch (error) {
                console.error('Ошибка загрузки картинки', error);
                Alert.alert('Ошибка', 'Не удалось загрузить изображение');
            }
        };
        input.click();
    };

    const toggleFullscreen = () => setIsFullScreen(!isFullScreen);

    const renderTopBar = () => (
        <View style={styles.topBar}>
            <Text style={styles.labelText}>{label}</Text>
            <View style={styles.topBarButtons}>
                <TouchableOpacity style={styles.iconButton} onPress={() => quillRef.current?.getEditor().history.undo()}>
                    <MaterialIcons name="undo" size={20} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => quillRef.current?.getEditor().history.redo()}>
                    <MaterialIcons name="redo" size={20} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowHtmlMode(!showHtmlMode)}>
                    <MaterialIcons name="code" size={20} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleFullscreen}>
                    <MaterialIcons name={isFullScreen ? 'fullscreen-exit' : 'fullscreen'} size={20} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleInsertImage}>
                    <MaterialIcons name="image" size={20} color="#555" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEditor = () => {
        if (!isMounted || !ReactQuill) {
            return <Text style={styles.placeholderText}>Загрузка редактора...</Text>;
        }

        if (showHtmlMode) {
            return (
                <ScrollView>
                    <TextInput
                        style={[styles.htmlArea, isFullScreen && { minHeight: 600 }]}
                        multiline
                        value={content}
                        onChangeText={handleHtmlChange}
                    />
                </ScrollView>
            );
        }

        return (
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={handleHtmlChange}
                modules={{
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ header: [1, 2, 3, false] }],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ],
                }}
                style={isFullScreen ? styles.fullscreenQuill : styles.quillArea}
            />
        );
    };

    const contentView = (
        <View style={styles.container}>
            {renderTopBar()}
            {renderEditor()}
        </View>
    );

    if (isFullScreen) {
        return (
            <Modal visible={true} animationType="fade">
                <SafeAreaView style={styles.fullscreenRoot}>
                    {renderTopBar()}
                    <View style={styles.fullscreenContent}>{renderEditor()}</View>
                </SafeAreaView>
            </Modal>
        );
    }

    return contentView;
};

export default function ArticleEditor(props: ArticleEditorProps) {
    if (isWeb && isClient) {
        return <WebEditor {...props} />;
    }
    return null;
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    topBar: {
        backgroundColor: '#f5f5f5',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        justifyContent: 'space-between',
    },
    labelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    topBarButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 12,
    },
    quillArea: {
        minHeight: 200,
        backgroundColor: '#fff',
    },
    fullscreenQuill: {
        minHeight: '80vh',
        backgroundColor: '#fff',
    },
    htmlArea: {
        borderWidth: 1,
        borderColor: '#eee',
        padding: 12,
        fontSize: 14,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        minHeight: 200,
    },
    fullscreenRoot: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fullscreenContent: {
        flex: 1,
        padding: 8,
    },
    placeholderText: {
        padding: 20,
        textAlign: 'center',
        color: '#999',
    },
});
