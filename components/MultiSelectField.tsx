import React, { forwardRef, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MultiSelect, MultiSelectRef } from 'react-native-element-dropdown';

const MultiSelectField = forwardRef(
    (
        { label, items, value = [], onChange, labelField, valueField, single, ...rest },
        ref
    ) => {
        const multiSelectRef = useRef(null);

        const handleChange = (selectedItems) => {
            if (single) {
                // Если single=true, оставляем только последний выбранный элемент
                const lastSelectedItem = selectedItems[selectedItems.length - 1];
                onChange(lastSelectedItem ? [lastSelectedItem] : []);
            } else {
                // Иначе разрешаем множественный выбор
                onChange(selectedItems);
            }

            // Закрываем dropdown после выбора
            if (multiSelectRef.current) {
                multiSelectRef.current.close();
            }
        };

        return (
            <View style={styles.container}>
                <Text style={styles.label}>{label}</Text>
                <MultiSelect
                    ref={multiSelectRef}
                    data={items}
                    value={value}
                    labelField={labelField}
                    valueField={valueField}
                    placeholder="Выберите..."
                    search
                    onChange={handleChange}
                    searchPlaceholder="Поиск..."
                    style={styles.dropdown}
                    {...rest}
                />
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: { marginBottom: 12 },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    dropdown: { borderWidth: 1, borderColor: '#d1d1d1', borderRadius: 6, padding: 8 },
});

export default MultiSelectField;