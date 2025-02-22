import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    StatusBar,
    Dimensions,
    Platform,
    Modal
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import RenderHtml from 'react-native-render-html';
import { uploadImage } from "@/src/api/travels";

interface UniversalEditorProps {
    initialContent?: string;
    onChange: (content: string) => void;
    label?: string;
    uploadUrl?: string;
    idTravel?: string;
}

const ArticleEditor: React.FC<UniversalEditorProps> = ({
                                                           initialContent = '',
                                                           onChange,
                                                           label = 'Редактор',
                                                           uploadUrl,
                                                           idTravel
                                                       }) => {
    const [editorContent, setEditorContent] = useState(initialContent);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showHtml, setShowHtml] = useState(false);
    const editorRef = useRef<TextInput | null>(null);

    const handleEditorChange = useCallback((text: string) => {
        setEditorContent(text);
        onChange(text);
    }, [onChange]);

    const applyTag = (tag: string, wrapper = false) => {
        const wrappedText = wrapper
            ? `<${tag}>${editorContent}</${tag}>`
            : `<${tag} />`;
        handleEditorChange(editorContent + wrappedText);
    };

    const insertLink = () => {
        const url = prompt('Введите URL:');
        if (url) {
            applyTag(`a href="${url}"`, true);
        }
    };

    const changeTextColor = () => {
        const color = prompt('Введите цвет (например, red или #ff0000):');
        if (color) {
            applyTag(`span style="color:${color};"`, true);
        }
    };

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    const handleImageUpload = useCallback(() => {
        if (uploadUrl) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e: any) => {
                const file = e.target.files[0];
                if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('collection', 'description');
                    formData.append('id', idTravel);

                    const response = await uploadImage(formData);

                    if (response.url) {
                        applyTag(`img src="${response.url}"`);
                    } else {
                        Alert.alert('Ошибка', 'Сервер не вернул URL изображения');
                    }
                }
            };
            input.click();
        } else {
            Alert.alert('Ошибка', 'uploadUrl не указан');
        }
    }, [uploadUrl, handleEditorChange]);

    const renderToolbar = () => (
        <View style={styles.toolbar}>
            {[
                { icon: 'format-bold', title: 'Жирный', action: () => applyTag('b', true) },
                { icon: 'format-italic', title: 'Курсив', action: () => applyTag('i', true) },
                { icon: 'format-underline', title: 'Подчеркнутый', action: () => applyTag('u', true) },
                { icon: 'format-align-center', title: 'Центрировать', action: () => applyTag('div style="text-align:center;"', true) },
                { icon: 'link', title: 'Добавить ссылку', action: insertLink },
                { icon: 'palette', title: 'Цвет текста', action: changeTextColor },
                { icon: 'image', title: 'Изображение', action: handleImageUpload },
                { icon: 'code', title: 'HTML', action: () => setShowHtml(!showHtml) },
                { icon: isFullScreen ? 'fullscreen-exit' : 'fullscreen', title: 'На весь экран', action: toggleFullScreen },
            ].map(({ icon, action }) => (
                <TouchableOpacity key={icon} onPress={action} style={styles.toolbarButton}>
                    <MaterialIcons name={icon} size={24} color="#333" />
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.separator} />
            {renderToolbar()}
            <ScrollView contentContainerStyle={styles.scrollView}>
                {showHtml ? (
                    <RenderHtml contentWidth={Dimensions.get('window').width} source={{ html: editorContent }} />
                ) : (
                    <TextInput
                        ref={editorRef}
                        style={styles.textEditor}
                        multiline
                        value={editorContent}
                        onChangeText={handleEditorChange}
                    />
                )}
            </ScrollView>

            {/* Полноэкранный режим */}
            <Modal visible={isFullScreen} animationType="slide" presentationStyle="fullScreen">
                <SafeAreaView style={styles.fullScreenContainer}>
                    <View style={styles.fullScreenToolbar}>
                        <TouchableOpacity onPress={toggleFullScreen} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    {renderToolbar()}
                    <ScrollView contentContainerStyle={styles.scrollView}>
                        {showHtml ? (
                            <RenderHtml contentWidth={Dimensions.get('window').width} source={{ html: editorContent }} />
                        ) : (
                            <TextInput
                                ref={editorRef}
                                style={styles.fullScreenEditor}
                                multiline
                                value={editorContent}
                                onChangeText={handleEditorChange}
                            />
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    separator: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 10
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f4f4f4',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    toolbarButton: {
        padding: 10,
        borderRadius: 8,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flexGrow: 1,
    },
    textEditor: {
        minHeight: 300,
        padding: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        fontSize: 16,
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fullScreenToolbar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        backgroundColor: '#f4f4f4',
    },
    closeButton: {
        padding: 10,
    },
    fullScreenEditor: {
        flex: 1,
        padding: 16,
        fontSize: 18,
    },
});

export default ArticleEditor;
