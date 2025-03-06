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

// Иконки (Material Design)
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// 1) Mобильный редактор (Pell)
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';

// 2) Веб-редактор (React Quill)
let ReactQuill: any = null;
if (Platform.OS === 'web') {
    ReactQuill = require('react-quill');
    require('react-quill/dist/quill.snow.css'); // стили Quill
}

// Пример функции загрузки (для insertImage)
import { uploadImage } from '@/src/api/travels';

interface ArticleEditorProps {
    label?: string;
    content: string;               // HTML-содержимое
    onChange: (html: string) => void;
    uploadUrl?: string;            // Куда грузить изображения
    idTravel?: string;             // Для FormData
}

/* =========================================
   Веб-версия (React Quill) + стандартный Quill Toolbar
========================================= */
function WebEditor(props: ArticleEditorProps) {
    const {
        label = 'Описание',
        content,
        onChange,
        uploadUrl,
        idTravel
    } = props;

    // Локальное состояние + реф на Quill
    const [html, setHtml] = useState(content);
    const quillRef = useRef<any>(null);

    const [showHtmlMode, setShowHtmlMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Если props.content меняется извне (Undo/Redo из родителя) - синхронизируемся
    useEffect(() => {
        setHtml(content);
    }, [content]);

    const handleChange = useCallback((val: string) => {
        setHtml(val);
        onChange(val);
    }, [onChange]);

    // Подключаем стандартный тулбар + history-модуль
    const quillModules = {
        toolbar: [
            // Стандартный набор кнопок:
            ['bold', 'italic', 'underline', 'strike'],  // жирный, курсив, подчёркнутый, зачёркнутый
            [{ header: [1, 2, 3, false] }],             // заголовки
            [{ list: 'ordered' }, { list: 'bullet' }], // списки
            [{ align: [] }],                            // выравнивание
            [{ color: [] }, { background: [] }],        // цвет текста, цвет фона
            ['link'],                 // вставка ссылки, картинки, видео
            ['clean']                                   // очистить форматирование
        ],
        history: {
            // Добавляет поддержку Ctrl+Z, Ctrl+Y
            userOnly: true
        }
    };

    /**
     * Undo / Redo (на вебе вручную, если хотим свои кнопки)
     */
    const handleUndoWeb = () => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.history.undo();
        }
    };
    const handleRedoWeb = () => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.history.redo();
        }
    };

    // Вставка изображения
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
                if (idTravel) {
                    formData.append('id', idTravel);
                }
                try {
                    const res = await uploadImage(formData);
                    if (res.url) {
                        // Добавляем <img src="..." />
                        handleChange(html + `<img src="${res.url}" alt="img" />`);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки картинки', error);
                }
            }
        };
        input.click();
    };

    const toggleFullscreen = () => setIsFullScreen(!isFullScreen);

    // Минималистичная панель (Undo/Redo, HTML, Fullscreen, Insert Image)
    const renderTopBar = () => (
        <View style={styles.topBar}>
            <Text style={styles.labelText}>{label}</Text>
            <View style={styles.topBarButtons}>
                {/* Undo */}
                <TouchableOpacity style={styles.iconButton} onPress={handleUndoWeb}>
                    <MaterialIcons name="undo" size={20} color="#555" />
                </TouchableOpacity>
                {/* Redo */}
                <TouchableOpacity style={styles.iconButton} onPress={handleRedoWeb}>
                    <MaterialIcons name="redo" size={20} color="#555" />
                </TouchableOpacity>

                {/* HTML Mode */}
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowHtmlMode(!showHtmlMode)}>
                    <MaterialIcons name="code" size={20} color="#555" />
                </TouchableOpacity>

                {/* Fullscreen */}
                <TouchableOpacity style={styles.iconButton} onPress={toggleFullscreen}>
                    <MaterialIcons
                        name={isFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                        size={20}
                        color="#555"
                    />
                </TouchableOpacity>

                {/* Image */}
                <TouchableOpacity style={styles.iconButton} onPress={handleInsertImage}>
                    <MaterialIcons name="image" size={20} color="#555" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Сам редактор (WYSIWYG или HTML)
    const renderEditor = (
        <>
            {renderTopBar()}
            {/* Внимание: теперь у нас ЕСТЬ штатная панель Quill */}
            {!showHtmlMode ? (
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    modules={quillModules}
                    value={html}
                    onChange={handleChange}
                    style={styles.quillArea}
                />
            ) : (
                <TextInput
                    style={styles.htmlArea}
                    multiline
                    value={html}
                    onChangeText={handleChange}
                />
            )}
        </>
    );

    // Полноэкранный режим
    if (isFullScreen) {
        return (
            <Modal visible={true} animationType="fade">
                <SafeAreaView style={styles.fullscreenRoot}>
                    {renderTopBar()}
                    <View style={styles.fullscreenContent}>
                        {!showHtmlMode ? (
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                modules={quillModules}
                                value={html}
                                onChange={handleChange}
                                style={styles.fullscreenQuill}
                            />
                        ) : (
                            <ScrollView>
                                <TextInput
                                    style={[styles.htmlArea, { minHeight: 600 }]}
                                    multiline
                                    value={html}
                                    onChangeText={handleChange}
                                />
                            </ScrollView>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    // Обычный вид
    return <View style={styles.container}>{renderEditor}</View>;
}

/* =========================================
   Мобильная версия (RichEditor + RichToolbar)
========================================= */
function MobileEditor(props: ArticleEditorProps) {
    const {
        label = 'Описание',
        content,
        onChange,
        uploadUrl,
        idTravel
    } = props;

    // Локальное состояние
    const [html, setHtml] = useState(content);
    const richTextRef = useRef<RichEditor>(null);

    const [showHtmlMode, setShowHtmlMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Если меняется проп content, обновим локальный html
    useEffect(() => {
        setHtml(content);
    }, [content]);

    const handleChange = useCallback((val: string) => {
        setHtml(val);
        onChange(val);
    }, [onChange]);

    // Undo / Redo (mobile, через RichEditor)
    const handleUndoMobile = () => {
        richTextRef.current?.undo();
    };
    const handleRedoMobile = () => {
        richTextRef.current?.redo();
    };

    // Вставка изображения
    const handleInsertImage = async () => {
        if (!uploadUrl) {
            Alert.alert('Ошибка', 'Не указан uploadUrl');
            return;
        }
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Ошибка', 'Нет доступа к галерее');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images
            });
            if (!result.cancelled) {
                const formData = new FormData();
                formData.append('file', {
                    uri: result.uri,
                    type: 'image/jpeg',
                    name: 'photo.jpg'
                } as any);
                formData.append('collection', 'description');
                if (idTravel) formData.append('id', idTravel);

                const res = await uploadImage(formData);
                if (res.url) {
                    richTextRef.current?.insertImage(res.url);
                }
            }
        } catch (err) {
            console.error('Ошибка загрузки картинки', err);
        }
    };

    const toggleFullscreen = () => setIsFullScreen(!isFullScreen);

    // Верхняя панель (Undo/Redo, HTML, Fullscreen, Image)
    const renderTopBar = () => (
        <View style={styles.topBar}>
            <Text style={styles.labelText}>{label}</Text>
            <View style={styles.topBarButtons}>
                {/* Undo */}
                <TouchableOpacity style={styles.iconButton} onPress={handleUndoMobile}>
                    <MaterialIcons name="undo" size={20} color="#555" />
                </TouchableOpacity>
                {/* Redo */}
                <TouchableOpacity style={styles.iconButton} onPress={handleRedoMobile}>
                    <MaterialIcons name="redo" size={20} color="#555" />
                </TouchableOpacity>

                {/* HTML Mode */}
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowHtmlMode(!showHtmlMode)}>
                    <MaterialIcons name="code" size={20} color="#555" />
                </TouchableOpacity>

                {/* Fullscreen */}
                <TouchableOpacity style={styles.iconButton} onPress={toggleFullscreen}>
                    <MaterialIcons
                        name={isFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                        size={20}
                        color="#555"
                    />
                </TouchableOpacity>

                {/* Image */}
                <TouchableOpacity style={styles.iconButton} onPress={handleInsertImage}>
                    <MaterialIcons name="image" size={20} color="#555" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEditor = (
        <>
            {renderTopBar()}

            {!showHtmlMode ? (
                <>
                    {/* Встроенный тулбар Pell */}
                    <RichToolbar
                        editor={richTextRef}
                        actions={[
                            actions.undo,
                            actions.redo,
                            actions.heading1,
                            actions.heading2,
                            actions.heading3,
                            actions.bold,
                            actions.italic,
                            actions.underline,
                            actions.strikethrough,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.alignLeft,
                            actions.alignCenter,
                            actions.alignRight,
                            actions.alignFull
                        ]}
                        style={styles.richToolbar}
                    />
                    <RichEditor
                        ref={richTextRef}
                        initialContentHTML={html}
                        onChange={handleChange}
                        style={styles.richArea}
                    />
                </>
            ) : (
                <ScrollView>
                    <TextInput
                        style={[styles.htmlArea, { minHeight: 200 }]}
                        multiline
                        value={html}
                        onChangeText={handleChange}
                    />
                </ScrollView>
            )}
        </>
    );

    if (isFullScreen) {
        // Полноэкранный режим
        return (
            <Modal visible={true} animationType="fade">
                <SafeAreaView style={styles.fullscreenRoot}>
                    {renderTopBar()}
                    <View style={styles.fullscreenContent}>
                        {!showHtmlMode ? (
                            <>
                                {/* Pell toolbar в полноэкране (при желании) */}
                                <RichToolbar
                                    editor={richTextRef}
                                    actions={[
                                        actions.undo,
                                        actions.redo,
                                        actions.bold,
                                        actions.italic,
                                        actions.underline,
                                        actions.heading1
                                    ]}
                                    style={styles.richToolbar}
                                />
                                <RichEditor
                                    ref={richTextRef}
                                    initialContentHTML={html}
                                    onChange={handleChange}
                                    style={[styles.richArea, { flex: 1 }]}
                                />
                            </>
                        ) : (
                            <ScrollView style={{ flex: 1 }}>
                                <TextInput
                                    style={[styles.htmlArea, { minHeight: 500 }]}
                                    multiline
                                    value={html}
                                    onChangeText={handleChange}
                                />
                            </ScrollView>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    return <View style={styles.container}>{renderEditor}</View>;
}

/* =========================================
   Главный экспорт: ArticleEditor
========================================= */
export default function ArticleEditor(props: ArticleEditorProps) {
    if (Platform.OS === 'web') {
        return <WebEditor {...props} />;
    }
    return <MobileEditor {...props} />;
}

/* =========================================
   Стили
========================================= */
const styles = StyleSheet.create({
    container: {
        marginVertical: 8
    },
    // Верхняя панель (Undo/Redo, HTML, Fullscreen, Image)
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
    labelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333'
    },
    topBarButtons: {
        flexDirection: 'row'
    },
    iconButton: {
        marginLeft: 12
    },

    // Pell toolbar (mobile)
    richToolbar: {
        backgroundColor: '#f6f6f6',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    // Pell editor area (mobile)
    richArea: {
        minHeight: 200,
        backgroundColor: '#fff'
    },

    // Quill area (web)
    quillArea: {
        minHeight: 200
    },
    // HTML TextInput (web)
    htmlArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        fontSize: 14,
        textAlignVertical: 'top'
    },

    // Полноэкранный “корень”
    fullscreenRoot: {
        flex: 1,
        backgroundColor: '#fff'
    },
    fullscreenContent: {
        flex: 1,
        margin: 8
    },
    fullscreenQuill: {
        minHeight: 600
    }
});
