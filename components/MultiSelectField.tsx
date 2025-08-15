import React, { forwardRef, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';

const MultiSelectField = forwardRef(
    (
        { label, items, value = [], onChange, labelField, valueField, single = false, ...rest },
        ref
    ) => {
        const multiSelectRef = useRef(null);

        const handleChange = (selectedItems) => {
            if (single) {
                const selected = selectedItems?.[0] || '';
                onChange(selected);
                multiSelectRef.current?.close();
            } else {
                onChange(selectedItems);
            }
        };

        return (
            <View style={styles.container}>
                {label ? <Text style={styles.label}>{label}</Text> : null}
                <MultiSelect
                    ref={multiSelectRef}
                    data={items}
                    value={
                        single
                            ? value
                                ? [value]
                                : []
                            : value
                    }
                    labelField={labelField}
                    valueField={valueField}
                    placeholder="Выберите..."
                    search
                    onChange={handleChange}
                    searchPlaceholder="Поиск..."
                    style={[styles.dropdown, { height: 44, justifyContent: 'center' }]}
                    {...rest}
                />
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: { marginBottom: 12 },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 7 },
    dropdown: {
        borderWidth: 1,
        borderColor: '#d1d1d1',
        borderRadius: 6,
        padding: 8,
        backgroundColor: 'white',
    },
});

export default React.memo(MultiSelectField);
