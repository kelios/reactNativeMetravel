import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    Dimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { uploadImage } from '@/src/api/travels';

// Динамическая загрузка ReactQuill только для web
let ReactQuill: any = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    ReactQuill = require('react-quill');
    require('react-quill/dist/quill.snow.css');
}

interface ArticleEditorProps {
    label?: string;
    content: string;
    onChange: (html: string) => void;
    uploadUrl?: string;
    idTravel?: string;
}

const WebEditor: React.FC<ArticleEditorProps> = ({
                                                     label = 'Описание',
                                                     content,
                                                     onChange,
                                                     uploadUrl,
                                                     idTravel
                                                 }) => {
    const quillRef = useRef<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showHtmlMode, setShowHtmlMode] = useState(false);
    const selectionRef = useRef<{ index: number; length: number } | null>(null);
    const isControlledUpdate = useRef(false);
    const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

    // Обработчик изменения размеров окна
    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions(Dimensions.get('window'));
        };

        Dimensions.addEventListener('change', handleResize);
        return () => Dimensions.removeEventListener('change', handleResize);
    }, []);

    // Инициализация редактора и стилей
    useEffect(() => {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            setIsMounted(true);

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
        }
        .ql-toolbar {
          position: sticky;
          top: 0;
          background: white;
          z-index: 1;
        }`;
            document.head.appendChild(style);

            return () => {
                document.head.removeChild(style);
            };
        }
    }, []);

    // Сохраняем позицию курсора перед обновлениями
    const saveSelection = useCallback(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            selectionRef.current = editor.getSelection();
        }
    }, []);

    // Восстанавливаем позицию курсора
    const restoreSelection = useCallback(() => {
        if (quillRef.current && selectionRef.current) {
            const editor = quillRef.current.getEditor();
            setTimeout(() => {
                editor.setSelection(
                    selectionRef.current?.index || 0,
                    selectionRef.current?.length || 0,
                    'silent'
                );
            }, 1);
        }
    }, []);

    // Обработчик изменений контента
    const handleContentChange = useCallback((html: string) => {
        if (!isControlledUpdate.current) {
            onChange(html);
        }
    }, [onChange]);

    // Синхронизация внешнего контента с редактором
    useEffect(() => {
        if (quillRef.current && content !== quillRef.current.getEditor().root.innerHTML) {
            isControlledUpdate.current = true;
            saveSelection();
            quillRef.current.getEditor().root.innerHTML = content;
            restoreSelection();
            isControlledUpdate.current = false;
        }
    }, [content]);

    // Вставка изображения
    const handleInsertImage = useCallback(async () => {
        if (!uploadUrl || !quillRef.current) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('collection', 'description');
                if (idTravel) formData.append('id', idTravel);

                const res = await uploadImage(formData);
                if (res?.url) {
                    const editor = quillRef.current.getEditor();
                    const range = editor.getSelection();
                    const index = range?.index || 0;
                    editor.insertEmbed(index, 'image', res.url);
                    editor.setSelection(index + 1, 0);
                }
            } catch (error) {
                console.error('Ошибка загрузки изображения:', error);
                Alert.alert('Ошибка', 'Не удалось загрузить изображение');
            }
        };

        input.click();
    }, [uploadUrl, idTravel]);

    const toggleFullscreen = useCallback(() => {
        setIsFullScreen(prev => !prev);
    }, []);

    const toggleHtmlMode = useCallback(() => {
        setShowHtmlMode(prev => !prev);
    }, []);

    const renderToolbar = useCallback(() => (
        <View style={styles.toolbar}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.toolbarButtons}>
                <TouchableOpacity
                    onPress={() => quillRef.current?.getEditor().history.undo()}
                    style={styles.toolButton}
                >
                    <MaterialIcons name="undo" size={20} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => quillRef.current?.getEditor().history.redo()}
                    style={styles.toolButton}
                >
                    <MaterialIcons name="redo" size={20} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleHtmlMode} style={styles.toolButton}>
                    <MaterialIcons name="code" size={20} color="#555" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleFullscreen} style={styles.toolButton}>
                    <MaterialIcons
                        name={isFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                        size={20}
                        color="#555"
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleInsertImage} style={styles.toolButton}>
                    <MaterialIcons name="image" size={20} color="#555" />
                </TouchableOpacity>
            </View>
        </View>
    ), [label, isFullScreen, toggleFullscreen, toggleHtmlMode, handleInsertImage]);

    if (!isMounted || !ReactQuill) {
        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Загрузка редактора...</Text>
            </View>
        );
    }

    if (showHtmlMode) {
        return (
            <View style={styles.container}>
                {renderToolbar()}
                <TextInput
                    style={styles.htmlInput}
                    multiline
                    value={content}
                    onChangeText={onChange}
                />
            </View>
        );
    }

    const editorContent = (
        <>
            {renderToolbar()}
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={handleContentChange}
                onChangeSelection={(range: any) => {
                    if (range) selectionRef.current = range;
                }}
                modules={{
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ header: [1, 2, 3, false] }],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ],
                    history: {
                        delay: 2000,
                        maxStack: 100,
                        userOnly: true
                    },
                    clipboard: {
                        matchVisual: false
                    }
                }}
                style={styles.editor}
            />
        </>
    );

    if (isFullScreen) {
        return (
            <Modal visible={true} transparent={false} animationType="slide">
                <SafeAreaView style={styles.fullscreenContainer}>
                    <View style={[styles.fullscreenContent, { height: windowDimensions.height }]}>
                        {editorContent}
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    return (
        <View style={styles.container}>
            {editorContent}
        </View>
    );
};

const ArticleEditor: React.FC<ArticleEditorProps> = (props) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        return <WebEditor {...props} />;
    }
    return null;
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginVertical: 8,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    toolbarButtons: {
        flexDirection: 'row',
    },
    toolButton: {
        marginLeft: 12,
        padding: 4,
    },
    editor: {
        minHeight: 200,
        backgroundColor: '#fff',
    },
    htmlInput: {
        minHeight: 200,
        padding: 12,
        fontSize: 14,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
    },
    placeholderContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
    },
    placeholderText: {
        color: '#999',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fullscreenContent: {
        flex: 1,
        width: '100%',
    },
});

export default React.memo(ArticleEditor);