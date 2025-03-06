import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';

interface MultiSelectFieldProps<T> {
    label: string;
    items: T[];
    value: string[];
    onChange: (value: string[]) => void;
    labelField: keyof T;
    valueField: keyof T;
}

export default function MultiSelectField<T>({
                                                label,
                                                items,
                                                value = [],   // <= всегда массив по умолчанию
                                                onChange,
                                                labelField,
                                                valueField,
                                            }: MultiSelectFieldProps<T>) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <MultiSelect
                data={items}
                value={value} // гарантировано массив
                labelField={labelField as string}
                valueField={valueField as string}
                placeholder="Выберите..."
                search
                onChange={onChange}
                searchPlaceholder="Поиск..."
                style={styles.dropdown}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 12 },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    dropdown: { borderWidth: 1, borderColor: '#d1d1d1', borderRadius: 6, padding: 8 },
});
