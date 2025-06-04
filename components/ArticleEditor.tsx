import React, {
    useCallback,
    useEffect,
    useMemo,
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
    Dimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { uploadImage } from '@/src/api/travels';

// Helpers ————————————————————————————————————————————————————————————
const isWeb = Platform.OS === 'web';
const win = isWeb && typeof window !== 'undefined' ? window : undefined;

/**
 * Stable debounce hook that preserves the last callback reference
 * yet never changes the debounced fn identity, so it is safe to use
 * in dependency arrays.
 */
function useDebounce<T extends unknown[]>(fn: (...args: T) => void, ms = 300) {
    const timeout = useRef<NodeJS.Timeout>();
    const fnRef = useRef(fn);
    fnRef.current = fn; // always latest
    return useCallback(
        (...args: T) => {
            if (timeout.current) clearTimeout(timeout.current);
            timeout.current = setTimeout(() => fnRef.current(...args), ms);
        },
        [ms],
    );
}

/**
 * Lazy-load Quill only on web to avoid native bundle bloat and SSR issues.
 * NB: casting to any to prevent breaking TS when Quill types are absent on native.
 */
const QuillEditor = isWeb && win
    ? (React.lazy(() => import('react-quill')) as any)
    : undefined;

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
};

export interface ArticleEditorProps {
    label?: string;
    placeholder?: string;
    content: string;
    onChange: (html: string) => void;
    onAutosave?: (html: string) => Promise<void>;
    autosaveDelay?: number;
    idTravel?: string;
    /**
     * Forward ref gets actual Quill instance on web or undefined on native.
     */
    editorRef?: Ref<any>;
}

// ——————————————————————————————— WEB VERSION —————————————————————————
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
    // state
    const [html, setHtml] = useState(content);
    const [fullscreen, setFullscreen] = useState(false);
    const [showHtml, setShowHtml] = useState(false);

    // refs
    const quillRef = useRef<any>(null);
    const lastRange = useRef<{ index: number; length: number } | null>(null);
    const tmpStoredRange = useRef<{ index: number; length: number } | null>(null);

    // expose forwardRef
    useEffect(() => {
        if (!editorRef) return;
        if (typeof editorRef === 'function') editorRef(quillRef.current);
        else (editorRef as any).current = quillRef.current;
    });

    // debounce upstream change
    const debouncedParentChange = useDebounce(onChange, 250);

    // keep external changes in sync
    useEffect(() => {
        if (content !== html) {
            setHtml(content);
        }
    }, [content]);

    // add sticky-toolbar colour-scheme styles once
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
        return () => {
            win.document.head.removeChild(style);
        };
    }, []);

    // AUTOSAVE — save after user has paused typing
    useEffect(() => {
        if (!onAutosave) return;
        const t = setTimeout(() => onAutosave(html), autosaveDelay);
        return () => clearTimeout(t);
    }, [html, onAutosave, autosaveDelay]);

    // MAIN CHANGE HANDLER — do NOT blindly restore selection, that caused caret glitches
    const fireChange = useCallback(
        (val: string) => {
            setHtml(val);
            debouncedParentChange(val);
        },
        [debouncedParentChange],
    );

    /** Insert uploaded image at caret */
    const insertImage = useCallback(
        (url: string) => {
            if (!quillRef.current) return;
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection() || { index: editor.getLength(), length: 0 };
            editor.insertEmbed(range.index, 'image', url);
            editor.setSelection(range.index + 1, 0, 'silent');
            // programmatic change — we DO restore selection after re-render
            lastRange.current = { index: range.index + 1, length: 0 };
            setTimeout(() => {
                if (lastRange.current) editor.setSelection(lastRange.current, 'silent');
            });
            fireChange(editor.root.innerHTML);
        },
        [fireChange],
    );

    /** Handle physical file → upload → insert */
    const uploadAndInsert = useCallback(
        async (file: File) => {
            try {
                const form = new FormData();
                form.append('file', file);
                form.append('collection', 'description');
                if (idTravel) form.append('id', idTravel);
                const res = await uploadImage(form);
                if (!res?.url) throw new Error('no url');
                insertImage(res.url);
            } catch (err) {
                console.error(err);
                Alert.alert('Ошибка', 'Не удалось загрузить изображение');
            }
        },
        [idTravel, insertImage],
    );

    // Paste / Drop listeners
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
            if (file) uploadAndInsert(file);
        };
        root.addEventListener('drop', onDrop);
        root.addEventListener('paste', onPaste);
        return () => {
            root.removeEventListener('drop', onDrop);
            root.removeEventListener('paste', onPaste);
        };
    }, [uploadAndInsert]);

    // Toolbar button component
    const IconButton: React.FC<{ name: keyof typeof MaterialIcons.glyphMap; onPress: () => void }> = ({ name, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.btn}>
            <MaterialIcons name={name} size={20} color="#555" />
        </TouchableOpacity>
    );

    // Toolbar view
    const Toolbar = () => (
        <View style={styles.bar}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.row}>
                <IconButton name="undo" onPress={() => quillRef.current?.getEditor().history.undo()} />
                <IconButton name="redo" onPress={() => quillRef.current?.getEditor().history.redo()} />
                <IconButton
                    name="code"
                    onPress={() => {
                        // store caret before switching to HTML mode
                        tmpStoredRange.current = quillRef.current?.getEditor().getSelection();
                        setShowHtml(v => !v);
                    }}
                />
                <IconButton
                    name={fullscreen ? 'fullscreen-exit' : 'fullscreen'}
                    onPress={() => {
                        tmpStoredRange.current = quillRef.current?.getEditor().getSelection();
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

    // restore selection after exiting fullscreen / html mode
    useEffect(() => {
        if (!fullscreen && !showHtml && tmpStoredRange.current && quillRef.current) {
            quillRef.current.getEditor().setSelection(tmpStoredRange.current, 'silent');
        }
    }, [fullscreen, showHtml]);

    // Loader for lazy Quill
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
            onChangeText={t => fireChange(t)}
            placeholder={placeholder}
            placeholderTextColor="#999"
        />
    ) : (
        <Suspense fallback={<Loader />}>
            <QuillEditor
                ref={quillRef}
                theme="snow"
                value={html}
                onChange={(val: string, _delta: any, _src: any, editor: any) => {
                    fireChange(val);
                    lastRange.current = editor.getSelection();
                }}
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

// —————————————————————————— NATIVE VERSION ——————————————————————————
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
    }, [content]);

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

// ——————————————————————————————— EXPORT ———————————————————————————
const ArticleEditor = forwardRef<any, ArticleEditorProps>((props, ref) => {
    return isWeb ? <WebEditor {...props} editorRef={ref} /> : <NativeEditor {...props} />;
});

export default React.memo(ArticleEditor);

// ——————————————————————————————— STYLES ———————————————————————————
const styles = StyleSheet.create({
    wrap: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        backgroundColor: 'var(--bg)',
        marginVertical: 8,
    },
    bar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'var(--bar)',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    label: { fontSize: 15, fontWeight: '600', color: 'var(--fg)' },
    row: { flexDirection: 'row' },
    btn: { marginLeft: 12, padding: 4 },
    editor: { minHeight: 200 },
    html: {
        minHeight: 200,
        padding: 12,
        fontSize: 14,
        color: 'var(--fg)',
    },
    loadBox: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadTxt: { color: '#999' },
    fullWrap: { flex: 1, backgroundColor: 'var(--bg)' },
});