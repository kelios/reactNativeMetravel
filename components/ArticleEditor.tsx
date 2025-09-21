import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    Suspense,
    forwardRef,
    type Ref,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    SafeAreaView,
    Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { uploadImage } from '@/src/api/travels';

const isWeb = Platform.OS === 'web';
const win = isWeb && typeof window !== 'undefined' ? window : undefined;

function useDebounce<T extends unknown[]>(fn: (...args: T) => void, ms = 300) {
    const timeout = useRef<ReturnType<typeof setTimeout>>();
    const fnRef = useRef(fn);
    fnRef.current = fn;
    return useCallback((...args: T) => {
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => fnRef.current(...args), ms);
    }, [ms]);
}

// Важно: грузим ТОЛЬКО default-экспорт — это гарантирует отдельный чанк
const QuillEditor =
    isWeb && win
        ? (React.lazy(async () => ({ default: (await import('react-quill')).default })) as any)
        : undefined;

// CSS темы подключаем один раз и только на web
if (isWeb && win) {
    const href = 'https://cdn.jsdelivr.net/npm/react-quill@2/dist/quill.snow.css';
    if (!win.document.querySelector(`link[href="${href}"]`)) {
        const link = win.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        win.document.head.appendChild(link);
    }
}

const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: [1, 2, 3, false] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
    ],
    history: { delay: 2000, maxStack: 100, userOnly: true },
    clipboard: { matchVisual: false },
} as const;

export interface ArticleEditorProps {
    label?: string;
    placeholder?: string;
    content: string;
    onChange: (html: string) => void;
    onAutosave?: (html: string) => Promise<void>;
    autosaveDelay?: number;
    idTravel?: string;
    editorRef?: Ref<any>;
}

const WebEditor: React.FC<ArticleEditorProps> = ({
                                                     label = 'Описание',
                                                     placeholder = 'Введите описание…',
                                                     content,
                                                     onChange,
                                                     onAutosave,
                                                     autosaveDelay = 5000,
                                                     idTravel,
                                                     editorRef,
                                                 }) => {
    const [html, setHtml] = useState(content);
    const [fullscreen, setFullscreen] = useState(false);
    const [showHtml, setShowHtml] = useState(false);

    const quillRef = useRef<any>(null);
    const tmpStoredRange = useRef<{ index: number; length: number } | null>(null);

    useEffect(() => {
        if (!editorRef) return;
        if (typeof editorRef === 'function') editorRef(quillRef.current);
        else (editorRef as any).current = quillRef.current;
    });

    const debouncedParentChange = useDebounce(onChange, 250);

    useEffect(() => {
        if (content !== html) setHtml(content);
    }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!win) return;
        const style = win.document.createElement('style');
        style.innerHTML = `
      :root{--bg:#fff;--fg:#333;--bar:#f5f5f5}
      @media(prefers-color-scheme:dark){:root{--bg:#1e1e1e;--fg:#e0e0e0;--bar:#2a2a2a}}
      .ql-editor{background:var(--bg);color:var(--fg)}
      .ql-toolbar{background:var(--bar);position:sticky;top:0;z-index:10}
    `;
        win.document.head.appendChild(style);
        return () => { win.document.head.removeChild(style); };
    }, []);

    useEffect(() => {
        if (!onAutosave) return;
        const t = setTimeout(() => onAutosave(html), autosaveDelay);
        return () => clearTimeout(t);
    }, [html, onAutosave, autosaveDelay]);

    const fireChange = useCallback((val: string) => {
        setHtml(val);
        debouncedParentChange(val);
    }, [debouncedParentChange]);

    const insertImage = useCallback((url: string) => {
        if (!quillRef.current) return;
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection() || { index: editor.getLength(), length: 0 };
        editor.insertEmbed(range.index, 'image', url);
        editor.setSelection(range.index + 1, 0, 'silent');
        fireChange(editor.root.innerHTML);
    }, [fireChange]);

    const uploadAndInsert = useCallback(async (file: File) => {
        try {
            const form = new FormData();
            form.append('file', file);
            form.append('collection', 'description');
            if (idTravel) form.append('id', idTravel);
            const res = await uploadImage(form);
            if (!res?.url) throw new Error('no url');
            insertImage(res.url);
        } catch {
            Alert.alert('Ошибка', 'Не удалось загрузить изображение');
        }
    }, [idTravel, insertImage]);

    useEffect(() => {
        if (!quillRef.current) return;
        const root = quillRef.current.getEditor().root as HTMLElement;
        const onDrop = (e: DragEvent) => {
            if (!e.dataTransfer?.files?.length) return;
            e.preventDefault();
            uploadAndInsert(e.dataTransfer.files[0]);
        };
        const onPaste = (e: ClipboardEvent) => {
            const file = Array.from(e.clipboardData?.files ?? [])[0];
            if (file) { e.preventDefault(); uploadAndInsert(file); }
        };
        root.addEventListener('drop', onDrop);
        root.addEventListener('paste', onPaste);
        return () => {
            root.removeEventListener('drop', onDrop);
            root.removeEventListener('paste', onPaste);
        };
    }, [uploadAndInsert]);

    const IconButton = React.memo(function IconButton({
                                                          name, onPress,
                                                      }: { name: keyof typeof MaterialIcons.glyphMap; onPress: () => void }) {
        return (
            <TouchableOpacity onPress={onPress} style={styles.btn}>
                <MaterialIcons name={name} size={20} color="#555" />
            </TouchableOpacity>
        );
    });

    const Toolbar = () => (
        <View style={styles.bar}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.row}>
                <IconButton name="undo" onPress={() => quillRef.current?.getEditor().history.undo()} />
                <IconButton name="redo" onPress={() => quillRef.current?.getEditor().history.redo()} />
                <IconButton
                    name="code"
                    onPress={() => {
                        tmpStoredRange.current = quillRef.current?.getEditor().getSelection() ?? null;
                        setShowHtml(v => !v);
                    }}
                />
                <IconButton
                    name={fullscreen ? 'fullscreen-exit' : 'fullscreen'}
                    onPress={() => {
                        tmpStoredRange.current = quillRef.current?.getEditor().getSelection() ?? null;
                        setFullscreen(v => !v);
                    }}
                />
                <IconButton
                    name="image"
                    onPress={() => {
                        if (!win) return;
                        const input = win.document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = () => {
                            const file = input.files?.[0];
                            if (file) uploadAndInsert(file);
                        };
                        input.click();
                    }}
                />
            </View>
        </View>
    );

    useEffect(() => {
        if (!fullscreen && !showHtml && tmpStoredRange.current && quillRef.current) {
            quillRef.current.getEditor().setSelection(tmpStoredRange.current, 'silent');
        }
    }, [fullscreen, showHtml]);

    const Loader = () => (
        <View style={styles.loadBox}>
            <Text style={styles.loadTxt}>Загрузка…</Text>
        </View>
    );

    if (!QuillEditor) return <Loader />;

    const editorArea = showHtml ? (
        <TextInput
            style={styles.html}
            multiline
            value={html}
            onChangeText={fireChange}
            placeholder={placeholder}
            placeholderTextColor="#999"
        />
    ) : (
        <Suspense fallback={<Loader />}>
            <QuillEditor
                ref={quillRef}
                theme="snow"
                value={html}
                onChange={(val: string) => fireChange(val)}
                modules={quillModules}
                placeholder={placeholder}
                style={styles.editor}
            />
        </Suspense>
    );

    const body = (
        <>
            <Toolbar />
            {editorArea}
        </>
    );

    return fullscreen ? (
        <Modal visible animationType="slide">
            <SafeAreaView style={styles.fullWrap}>{body}</SafeAreaView>
        </Modal>
    ) : (
        <View style={styles.wrap}>{body}</View>
    );
};

const NativeEditor: React.FC<ArticleEditorProps> = ({
                                                        label = 'Описание',
                                                        placeholder = 'Введите описание…',
                                                        content,
                                                        onChange,
                                                        onAutosave,
                                                        autosaveDelay = 5000,
                                                    }) => {
    const [text, setText] = useState(content);
    const debouncedParentChange = useDebounce(onChange, 250);

    useEffect(() => {
        if (content !== text) setText(content);
    }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!onAutosave) return;
        const t = setTimeout(() => onAutosave(text), autosaveDelay);
        return () => clearTimeout(t);
    }, [text, onAutosave, autosaveDelay]);

    const onEdit = (t: string) => {
        setText(t);
        debouncedParentChange(t);
    };

    return (
        <View style={styles.wrap}>
            <Text style={[styles.label, { padding: 8 }]}>{label}</Text>
            <TextInput
                multiline
                value={text}
                onChangeText={onEdit}
                placeholder={placeholder}
                placeholderTextColor="#999"
                style={styles.html}
                textAlignVertical="top"
            />
        </View>
    );
};

const ArticleEditor = forwardRef<any, ArticleEditorProps>((props, ref) => {
    return isWeb ? <WebEditor {...props} editorRef={ref} /> : <NativeEditor {...props} />;
});

export default React.memo(ArticleEditor);

const styles = StyleSheet.create({
    wrap: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        marginVertical: 8,
        backgroundColor: Platform.OS === 'web' ? ('var(--bg)' as any) : '#fff',
    },
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: Platform.OS === 'web' ? ('var(--bar)' as any) : '#f5f5f5',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: Platform.OS === 'web' ? ('var(--fg)' as any) : '#333',
    },
    row: { flexDirection: 'row' },
    btn: { marginLeft: 12, padding: 4 },
    editor: { minHeight: 200 },
    html: {
        minHeight: 200,
        padding: 12,
        fontSize: 14,
        color: Platform.OS === 'web' ? ('var(--fg)' as any) : '#333',
    },
    loadBox: { padding: 20, alignItems: 'center', justifyContent: 'center' },
    loadTxt: { color: '#999' },
    fullWrap: { flex: 1, backgroundColor: Platform.OS === 'web' ? ('var(--bg)' as any) : '#fff' },
});
