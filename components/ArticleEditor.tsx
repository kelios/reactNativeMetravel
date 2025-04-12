/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Platform,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView
} from 'react-native';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '@/src/api/travels';

let ReactQuill: any = null;
if (Platform.OS === 'web') {
    ReactQuill = require('react-quill');
    require('react-quill/dist/quill.snow.css');

    // Добавим стили для изображений в редакторе
    const style = document.createElement('style');
    style.innerHTML = `
        .ql-editor img {
            max-width: 30% !important;
            height: auto;
            border-radius: 8px;
            margin: 12px auto;
            display: block;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    return html
        .replace(/<p><br><\/p>/g, '')
        .replace(/<p>\s*<\/p>/g, '')
        .replace(/(<br>\s*){2,}/g, '<br>')
        .replace(/(<p><\/p>\s*)+/g, '')
        .trim();
}

function WebEditor(props: ArticleEditorProps) {
    const { label = 'Описание', content, onChange, uploadUrl, idTravel } = props;
    const [html, setHtml] = useState(content);
    const quillRef = useRef<any>(null);
    const [showHtmlMode, setShowHtmlMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (cleanHtml(content) !== cleanHtml(html)) {
            setHtml(content);
        }
    }, [content, html]);

    const handleChange = useCallback((val: string) => {
        const cleaned = cleanHtml(val);
        if (cleaned !== html) {
            setHtml(cleaned);
            onChange(cleaned);
        }
    }, [html, onChange]);

    const handleInsertImage = async () => {
        if (!uploadUrl) {
            Alert.alert('Ошибка', 'Не указан uploadUrl');
            return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('collection', 'description');
                if (idTravel) formData.append('id', idTravel);
                try {
                    const res = await uploadImage(formData);
                    if (res?.url && quillRef.current) {
                        const editor = quillRef.current.getEditor();
                        const range = editor.getSelection();
                        editor.insertEmbed(range?.index || 0, 'image', res.url);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки картинки', error);
                }
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

    const editorProps = {
        ref: quillRef,
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ header: [1, 2, 3, false] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                [{ align: [] }],
                [{ color: [] }, { background: [] }],
                ['link'],
                ['clean']
            ],
            history: { userOnly: true }
        },
        value: html,
        onChange: handleChange,
        style: isFullScreen ? styles.fullscreenQuill : styles.quillArea
    };

    const editor = showHtmlMode ? (
        <ScrollView>
            <TextInput
                style={[styles.htmlArea, isFullScreen && { minHeight: 600 }]}
                multiline
                value={html}
                onChangeText={handleChange}
            />
        </ScrollView>
    ) : (
        <ReactQuill {...editorProps} />
    );

    if (isFullScreen) {
        return (
            <Modal visible={true} animationType="fade">
                <SafeAreaView style={styles.fullscreenRoot}>
                    {renderTopBar()}
                    <View style={styles.fullscreenContent}>{editor}</View>
                </SafeAreaView>
            </Modal>
        );
    }

    return <View style={styles.container}>{renderTopBar()}{editor}</View>;
}

export default function ArticleEditor(props: ArticleEditorProps) {
    if (Platform.OS === 'web') {
        return <WebEditor {...props} />;
    }
    return null; // Мобильную часть можно добавить аналогично, если надо
}

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    topBar: {
        backgroundColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        justifyContent: 'space-between'
    },
    labelText: { fontSize: 15, fontWeight: '600', color: '#333' },
    topBarButtons: { flexDirection: 'row' },
    iconButton: { marginLeft: 12 },
    quillArea: { minHeight: 200 },
    fullscreenQuill: { minHeight: 600 },
    htmlArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        fontSize: 14,
        textAlignVertical: 'top',
        backgroundColor: '#fff'
    },
    fullscreenRoot: { flex: 1, backgroundColor: '#fff' },
    fullscreenContent: { flex: 1, margin: 8 }
});
