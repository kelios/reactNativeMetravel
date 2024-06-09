import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MultiSelect from 'react-native-multiple-select';

interface MultiSelectComponentProps {
    label: string;
    options: Array<{ id: string; name: string }>;
    selectedValues: string[];
    onChange: (selectedItems: string[]) => void;
}

const MultiSelectComponent: React.FC<MultiSelectComponentProps> = ({
                                                                       label,
                                                                       options,
                                                                       selectedValues,
                                                                       onChange,
                                                                   }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <MultiSelect
                items={options}
                uniqueKey="id"
                onSelectedItemsChange={onChange}
                selectedItems={selectedValues}
                selectText="Выберите опции"
                searchInputPlaceholderText="Поиск опций..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Применить"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 5,
        fontSize: 16,
    },
});

export default MultiSelectComponent;
