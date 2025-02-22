import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';

interface ArticleEditorProps {
    content?: string;
    onChange: (content: string) => void;
    label?: string;
    height?: number;
    uploadUrl: string; // URL для загрузки изображений
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
                                                         content = '',
                                                         onChange,
                                                         label,
                                                         height = 200,
                                                         uploadUrl,
                                                     }) => {
    const [editorContent, setEditorContent] = useState(content);
    const [showHtml, setShowHtml] = useState(false); // Показ HTML-кода
    const [isFullScreen, setIsFullScreen] = useState(false); // Полноэкранный режим
    const editorRef = useRef(null);

    const handleEditorChange = (text: string) => {
        setEditorContent(text);
        onChange(text);
    };

    const applyFormat = (command: string, value?: string) => {
        if (Platform.OS === 'web') {
            document.execCommand(command, false, value);
        } else {
            // Для мобильных платформ можно добавить кастомное форматирование
            if (command === 'bold') {
                setEditorContent((prev) => `<b>${prev}</b>`);
            }
        }
    };

    const handleImageUpload = async () => {
        if (Platform.OS === 'web') {
            // Для веб-платформы используем input[type="file"]
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                        const response = await fetch(uploadUrl, {
                            method: 'POST',
                            body: formData,
                        });
                        const data = await response.json();
                        const imageUrl = data.url; // Предполагаем, что сервер возвращает URL изображения
                        document.execCommand('insertImage', false, imageUrl);
                    } catch (error) {
                        Alert.alert('Ошибка', 'Не удалось загрузить изображение');
                    }
                }
            };
            input.click();
        } else {
            // Для мобильных платформ используем react-native-image-picker
            Alert.alert('Информация', 'Загрузка изображений на мобильных платформах требует дополнительной настройки.');
        }
    };

    const clearFormatting = () => {
        if (Platform.OS === 'web') {
            document.execCommand('removeFormat');
        } else {
            // Для мобильных платформ можно очистить форматирование
            setEditorContent((prev) => prev.replace(/<[^>]+>/g, ''));
        }
    };

    const toggleHtmlView = () => {
        setShowHtml((prev) => !prev);
    };

    const toggleFullScreen = () => {
        setIsFullScreen((prev) => !prev);
    };

    const insertLink = () => {
        const url = prompt('Введите URL ссылки:');
        if (url) {
            if (Platform.OS === 'web') {
                document.execCommand('createLink', false, url);
            } else {
                setEditorContent((prev) => `<a href="${url}">${prev}</a>`);
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
            {label && <Text style={styles.label}>{label}</Text>}

            {/* Панель инструментов */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={() => applyFormat('bold')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>B</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => applyFormat('italic')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>I</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => applyFormat('underline')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>U</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => applyFormat('insertUnorderedList')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>•</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => applyFormat('insertOrderedList')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>1.</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => applyFormat('justifyLeft')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>◀️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => applyFormat('justifyCenter')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>🔘</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => applyFormat('justifyRight')} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>▶️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearFormatting} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>🧹</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleImageUpload} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>📷</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={insertLink} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>🔗</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleHtmlView} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>{showHtml ? '👁️' : '</>'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleFullScreen} style={styles.toolbarButton}>
                    <Text style={styles.toolbarButtonText}>{isFullScreen ? '⬜' : '⬛'}</Text>
                </TouchableOpacity>
            </View>

            {/* Редактор */}
            {Platform.OS === 'web' ? (
                showHtml ? (
                    <textarea
                        style={{ ...styles.webEditor, height: isFullScreen ? Dimensions.get('window').height - 100 : height }}
                        value={editorContent}
                        onChange={(e) => handleEditorChange(e.target.value)}
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        style={{ ...styles.webEditor, height: isFullScreen ? Dimensions.get('window').height - 100 : height }}
                        onInput={(e) => handleEditorChange(e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: editorContent }}
                        dir="auto" // Указываем направление текста
                    />
                )
            ) : (
                <TextInput
                    style={{ ...styles.mobileEditor, height: isFullScreen ? Dimensions.get('window').height - 100 : height }}
                    multiline
                    value={editorContent}
                    onChangeText={handleEditorChange}
                    placeholder="Начните писать..."
                    textAlignVertical="top" // Выравнивание текста по верхнему краю
                    textAlign="left" // Выравнивание текста по левому краю
                />
            )}

            {/* Показ отформатированного HTML на веб-платформе */}
            {Platform.OS === 'web' && !showHtml && (
                <View style={styles.preview}>
                    <Text style={styles.previewLabel}>Предпросмотр:</Text>
                    <div dangerouslySetInnerHTML={{ __html: editorContent }} />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        width: '100%',
        backgroundColor: '#f9f9f9',
    },
    fullScreenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    mobileEditor: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        fontSize: 16,
        textAlign: 'left', // Выравнивание текста по левому краю
        backgroundColor: '#fff',
    },
    webEditor: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        textAlign: 'left', // Выравнивание текста по левому краю
        backgroundColor: '#fff',
    },
    toolbar: {
        flexDirection: 'row',
        marginBottom: 10,
        flexWrap: 'wrap',
        gap: 5,
    },
    toolbarButton: {
        padding: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolbarButtonText: {
        fontSize: 16,
        color: '#333',
    },
    preview: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
    },
    previewLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
});

export default ArticleEditor;