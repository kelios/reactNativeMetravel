// ArticleEditor.tsx
import React, {
    useRef,
    useState,
    useEffect,
    useMemo,
    useCallback,
    Suspense,
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

/* ─────────── Helpers ─────────── */
const isWeb = Platform.OS === 'web';
const debounce = <T extends unknown[]>(fn: (...args: T) => void, ms = 300) => {
    let timer: NodeJS.Timeout;
    return (...args: T) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
};

/* ─────────── Quill lazy-load (web only) ─────────── */
let QuillEditor: any = null;
if (isWeb && typeof window !== 'undefined') {
    QuillEditor = React.lazy(() => import('react-quill'));
    const href = 'https://cdn.jsdelivr.net/npm/react-quill@2/dist/quill.snow.css';
    if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
}

/* ─────────── Quill toolbar config ─────────── */
const quillModules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: [1, 2, 3, false] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
    ],
    history: { delay: 2_000, maxStack: 100, userOnly: true },
    clipboard: { matchVisual: false },
};

/* ─────────── Props ─────────── */
export interface ArticleEditorProps {
    label?: string;
    content: string;
    onChange: (html: string) => void;
    onAutosave?: (html: string) => Promise<void>;
    autosaveDelay?: number;
    idTravel?: string;
}

/* ─────────── Main (web) component ─────────── */
const WebEditor: React.FC<ArticleEditorProps> = ({
                                                     label = 'Описание',
                                                     content,
                                                     onChange,
                                                     onAutosave,
                                                     autosaveDelay = 5_000,
                                                     idTravel,
                                                 }) => {
    /* ---------- state ---------- */
    const [html, setHtml] = useState(content);
    const [fullscreen, setFullscreen] = useState(false);
    const [showHtml, setShowHtml] = useState(false);
    const [dims, setDims] = useState(Dimensions.get('window'));

    /* ---------- refs ---------- */
    const quillRef = useRef<any>(null);
    const savedRange = useRef<{ index: number; length: number } | null>(null);

    /* ---------- derived ---------- */
    const debouncedParentChange = useMemo(
        () => debounce(onChange, 250),
        [onChange],
    );

    /* ---------- sync external content ---------- */
    useEffect(() => {
        if (content !== html) setHtml(content);
    }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ---------- dimensions listener ---------- */
    useEffect(() => {
        const sub = Dimensions.addEventListener('change', () =>
            setDims(Dimensions.get('window')),
        );
        return () => sub.remove();
    }, []);

    /* ---------- CSS vars & sticky-toolbar ---------- */
    useEffect(() => {
        if (!isWeb) return;

        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
      :root { --bg:#fff; --fg:#333; --bar:#f5f5f5; }
      @media (prefers-color-scheme:dark){
        :root{ --bg:#1e1e1e; --fg:#e0e0e0; --bar:#2a2a2a; }
      }
      .ql-editor {background:var(--bg);color:var(--fg);}
      .ql-toolbar{background:var(--bar);position:sticky;top:0;z-index:10;}
    `;
        document.head.appendChild(styleEl);
        return () => document.head.removeChild(styleEl);
    }, []);

    /* ---------- change handler ---------- */
    const fireChange = useCallback(
        (
            val: string,
            restoreSelection = false,
            range?: { index: number; length: number } | null,
        ) => {
            setHtml(val);
            debouncedParentChange(val);

            if (restoreSelection && range && quillRef.current) {
                requestAnimationFrame(() => {
                    quillRef.current.getEditor().setSelection(range, 'silent');
                });
            }
        },
        [debouncedParentChange],
    );

    /* ---------- autosave ---------- */
    useEffect(() => {
        if (!onAutosave) return;
        const t = setTimeout(() => onAutosave(html), autosaveDelay);
        return () => clearTimeout(t);
    }, [html, onAutosave, autosaveDelay]);

    /* ---------- upload helper ---------- */
    const uploadAndInsert = useCallback(
        async (file: File) => {
            try {
                const form = new FormData();
                form.append('file', file);
                form.append('collection', 'description');
                if (idTravel) form.append('id', idTravel);

                const res = await uploadImage(form);
                if (!res?.url) throw new Error('No url');

                if (quillRef.current) {
                    const editor = quillRef.current.getEditor();
                    const r = editor.getSelection() || { index: 0, length: 0 };
                    editor.insertEmbed(r.index, 'image', res.url);
                    editor.setSelection(r.index + 1, 0, 'silent');
                    fireChange(editor.root.innerHTML, true, r);
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Ошибка', 'Не удалось загрузить изображение');
            }
        },
        [fireChange, idTravel],
    );

    /* ---------- drag / paste listeners ---------- */
    useEffect(() => {
        if (!quillRef.current) return;
        const root = quillRef.current.getEditor().root as HTMLElement;

        const onDrop = (e: DragEvent) => {
            if (!e.dataTransfer?.files?.length) return;
            e.preventDefault();
            uploadAndInsert(e.dataTransfer.files[0]);
        };
        const onPaste = (e: ClipboardEvent) => {
            const f = Array.from(e.clipboardData?.files ?? [])[0];
            if (f) uploadAndInsert(f);
        };

        root.addEventListener('drop', onDrop);
        root.addEventListener('paste', onPaste);
        return () => {
            root.removeEventListener('drop', onDrop);
            root.removeEventListener('paste', onPaste);
        };
    }, [uploadAndInsert]);

    /* ---------- toolbar ---------- */
    const Btn: React.FC<{
        icon: keyof typeof MaterialIcons.glyphMap;
        onPress: () => void;
    }> = ({ icon, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.btn}>
            <MaterialIcons name={icon} size={20} color="#555" />
        </TouchableOpacity>
    );

    const Toolbar = () => (
        <View style={styles.bar}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.row}>
                <Btn
                    icon="undo"
                    onPress={() => quillRef.current?.getEditor().history.undo()}
                />
                <Btn
                    icon="redo"
                    onPress={() => quillRef.current?.getEditor().history.redo()}
                />
                <Btn icon="code" onPress={() => setShowHtml((v) => !v)} />
                <Btn
                    icon={fullscreen ? 'fullscreen-exit' : 'fullscreen'}
                    onPress={() => {
                        savedRange.current = quillRef.current
                            ?.getEditor()
                            .getSelection();
                        setFullscreen((v) => !v);
                    }}
                />
                <Btn
                    icon="image"
                    onPress={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = () => {
                            const f = input.files?.[0];
                            if (f) uploadAndInsert(f);
                        };
                        input.click();
                    }}
                />
            </View>
        </View>
    );

    /* ---------- restore cursor after exiting fullscreen ---------- */
    useEffect(() => {
        if (!fullscreen && savedRange.current && quillRef.current) {
            quillRef.current
                .getEditor()
                .setSelection(savedRange.current, 'silent');
        }
    }, [fullscreen]);

    /* ---------- loader ---------- */
    const Loader = () => (
        <View style={styles.loadBox}>
            <Text style={styles.loadTxt}>Загрузка…</Text>
        </View>
    );

    /* ---------- body ---------- */
    const editorBody = showHtml ? (
        <TextInput
            style={styles.html}
            multiline
            value={html}
            onChangeText={(t) => fireChange(t)}
        />
    ) : (
        <Suspense fallback={<Loader />}>
            <QuillEditor
                ref={quillRef}
                theme="snow"
                defaultValue={html} // uncontrolled!
                onChange={(val: string, _d: any, _s: any, ed: any) => {
                    const r = ed.getSelection();
                    fireChange(val, true, r);
                }}
                modules={quillModules}
                style={styles.editor}
            />
        </Suspense>
    );

    if (!QuillEditor) return <Loader />;

    /* ---------- render ---------- */
    const container = (
        <>
            <Toolbar />
            {editorBody}
        </>
    );

    return fullscreen ? (
        <Modal visible animationType="slide">
            <SafeAreaView style={styles.fullWrap}>{container}</SafeAreaView>
        </Modal>
    ) : (
        <View style={styles.wrap}>{container}</View>
    );
};

/* ─────────── Native fallback ─────────── */
const NativeEditor: React.FC<ArticleEditorProps> = ({
                                                        label = 'Описание',
                                                        content,
                                                        onChange,
                                                        onAutosave,
                                                        autosaveDelay = 5_000,
                                                    }) => {
    const [text, setText] = useState(content);

    /* sync external */
    useEffect(() => {
        if (content !== text) setText(content);
    }, [content]);

    /* parent change */
    const debouncedParentChange = useMemo(
        () => debounce(onChange, 250),
        [onChange],
    );
    const onEdit = (t: string) => {
        setText(t);
        debouncedParentChange(t);
    };

    /* autosave */
    useEffect(() => {
        if (!onAutosave) return;
        const t = setTimeout(() => onAutosave(text), autosaveDelay);
        return () => clearTimeout(t);
    }, [text, onAutosave, autosaveDelay]);

    return (
        <View style={styles.wrap}>
            <Text style={[styles.label, { padding: 8 }]}>{label}</Text>
            <TextInput
                multiline
                style={styles.html}
                value={text}
                onChangeText={onEdit}
            />
        </View>
    );
};

/* ─────────── Exported component ─────────── */
const ArticleEditor: React.FC<ArticleEditorProps> = (props) =>
    isWeb ? <WebEditor {...props} /> : <NativeEditor {...props} />;

export default React.memo(ArticleEditor);

/* ─────────── Styles ─────────── */
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
        textAlignVertical: 'top',
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
