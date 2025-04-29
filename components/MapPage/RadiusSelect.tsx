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
    onChange: (value: number | string | null) => void;
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

    const handleChange = useCallback(
        (newValue: number | string | null) => {
            onChange(newValue);
            setVisible(false);
        },
        [onChange]
    );

    const renderWebSelect = () => (
        <View style={[styles.container, disabled && styles.disabled]}>
            <div style={{ position: 'relative' }}>
                <select
                    value={value ?? ''}
                    onChange={(e) => handleChange(e.target.value || null)}
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
                <View style={styles.leftIcon}>
                    <Text style={{ fontSize: 16 }}>📡</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color="#666" style={styles.loader} />
                ) : (
                    <Text
                        style={[
                            styles.selectorText,
                            !value && styles.placeholderText,
                            disabled && styles.textDisabled,
                        ]}
                    >
                        {selectedLabel}
                    </Text>
                )}

                {!!value && !disabled && !loading && (
                    <TouchableOpacity
                        onPress={() => handleChange(null)}
                        style={styles.clearButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.clearIcon}>×</Text>
                    </TouchableOpacity>
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
                            renderItem={({ item }) => {
                                const isSelected = String(item.id) === String(value);
                                return (
                                    <Pressable
                                        onPress={() => handleChange(item.id)}
                                        style={({ pressed }) => [
                                            styles.option,
                                            pressed && styles.optionPressed,
                                            isSelected && styles.optionSelected,
                                        ]}
                                        android_ripple={{ color: '#f0f0f0' }}
                                    >
                                        <Text style={styles.optionText}>{item.name} км</Text>
                                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                    </Pressable>
                                );
                            }}
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
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
        backgroundColor: '#fff',
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 2,
        elevation: 2,
    },
    selectorDisabled: {
        backgroundColor: '#f5f5f5',
    },
    selectorText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
        paddingVertical: 2,
    },
    placeholderText: {
        color: '#999',
        fontStyle: 'italic',
    },
    textDisabled: {
        color: '#bbb',
    },
    leftIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    clearButton: {
        paddingHorizontal: 4,
    },
    clearIcon: {
        fontSize: 18,
        color: '#999',
    },
    chevronContainer: {
        marginLeft: 8,
        minWidth: 18,
        alignItems: 'center',
    },
    chevron: {
        fontSize: 16,
        color: '#666',
        textAlign: 'right',
    },
    loader: {
        marginRight: 8,
    },
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
        backgroundColor: '#e5f6ff',
        borderLeftWidth: 4,
        borderLeftColor: '#007aff',
    },
    optionText: {
        fontSize: 15,
        color: '#333',
    },
    checkmark: {
        color: '#007aff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 16,
    },
    webSelect: {
        width: '100%',
        height: 44,
        borderRadius: 8,
        paddingLeft: 10,
        fontSize: 15,
        border: '1px solid #ccc',
        backgroundColor: '#fff',
        color: '#333',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
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
