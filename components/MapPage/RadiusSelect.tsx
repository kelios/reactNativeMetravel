import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    Platform,
    StyleSheet,
    ActivityIndicator,
    FlatList,
} from 'react-native';

interface Option {
    id: number | string;
    name: string;
}

interface RadiusSelectProps {
    value?: number | string | null;
    options?: Option[];
    onChange: (value: number | string) => void;
    label?: string;
    disabled?: boolean;
    loading?: boolean;
    placeholder?: string;
}

const RadiusSelect: React.FC<RadiusSelectProps> = ({
                                                       value,
                                                       options = [],
                                                       onChange,
                                                       label = 'Радиус (км)',
                                                       disabled = false,
                                                       loading = false,
                                                       placeholder = 'Выберите радиус',
                                                   }) => {
    const [visible, setVisible] = useState(false);

    const selectedOption = useMemo(
        () => options.find((opt) => String(opt.id) === String(value)),
        [options, value]
    );

    const selectedLabel = selectedOption ? `${selectedOption.name} км` : placeholder;

    const handleChange = useCallback((newValue: number | string) => {
        onChange(newValue);
        setVisible(false);
    }, [onChange]);

    const renderWebSelect = () => (
        <View style={[styles.container, disabled && styles.disabled]}>
            <Text style={styles.label}>{label}</Text>
            <div style={{ position: 'relative' }}>
                <select
                    value={value ?? ''}
                    onChange={(e) => handleChange(e.target.value)}
                    style={styles.webSelect as any}
                    disabled={disabled || loading}
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.name} км
                        </option>
                    ))}
                </select>
                {(loading || disabled) && (
                    <div style={styles.webOverlay as any}>
                        {loading && <ActivityIndicator size="small" color="#666" />}
                    </div>
                )}
            </div>
        </View>
    );

    const renderMobileSelect = () => (
        <View style={[styles.container, disabled && styles.disabled]}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={[styles.selector, disabled && styles.selectorDisabled]}
                onPress={() => !disabled && setVisible(true)}
                activeOpacity={0.7}
                disabled={disabled || loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#666" style={styles.loader} />
                ) : (
                    <Text style={[styles.selectorText, disabled && styles.textDisabled]}>
                        {selectedLabel}
                    </Text>
                )}
                {!loading && (
                    <View style={styles.chevronContainer}>
                        <Text style={styles.chevron}>⌄</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => handleChange(item.id)}
                                    style={({ pressed }) => [
                                        styles.option,
                                        pressed && styles.optionPressed,
                                        String(item.id) === String(value) && styles.optionSelected,
                                    ]}
                                    android_ripple={{ color: '#f0f0f0' }}
                                >
                                    <Text style={styles.optionText}>{item.name} км</Text>
                                    {String(item.id) === String(value) && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </Pressable>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                            contentContainerStyle={styles.listContent}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );

    return Platform.OS === 'web' ? renderWebSelect() : renderMobileSelect();
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: '#333',
    },
    // Mobile styles
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 48,
        backgroundColor: '#fff',
        width: '100%',
    },
    selectorDisabled: {
        backgroundColor: '#f5f5f5',
    },
    selectorText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    textDisabled: {
        color: '#999',
    },
    chevronContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    chevron: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    loader: {
        marginRight: 8,
    },
    // Modal styles
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: '70%',
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    listContent: {
        paddingVertical: 8,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionPressed: {
        backgroundColor: '#f9f9f9',
    },
    optionSelected: {
        backgroundColor: '#f0f7ff',
    },
    optionText: {
        fontSize: 15,
        color: '#333',
    },
    checkmark: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 16,
    },
    // Web styles
    webSelect: {
        width: '100%',
        height: 48, // синхронизировано с мобилкой
        borderRadius: 8,
        paddingLeft: 10,
        fontSize: 15,
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        color: '#333',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
    },
    webOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        pointerEvents: 'none',
    },
    disabled: {
        opacity: 0.7,
    },
});

export default React.memo(RadiusSelect);
