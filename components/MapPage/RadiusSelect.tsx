import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Pressable,
} from 'react-native';

const RadiusSelect = ({ value, options, onChange }) => {
    const [visible, setVisible] = useState(false);

    const selectedLabel =
        options.find((opt) => opt.id === value)?.name || 'Выберите радиус';

    const handleSelect = (item) => {
        onChange(item.id);
        setVisible(false);
    };

    return (
        <View>
            <Text style={styles.label}>Радиус (км)</Text>
            <Pressable style={styles.selectBox} onPress={() => setVisible(true)}>
                <Text style={styles.selectText}>{selectedLabel}</Text>
            </Pressable>

            <Modal visible={visible} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)} />
                <View style={styles.modalContent}>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.optionItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.optionText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    selectBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white',
    },
    selectText: {
        fontSize: 14,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContent: {
        position: 'absolute',
        top: '30%',
        left: '10%',
        right: '10%',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 10,
    },
    optionItem: {
        paddingVertical: 10,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
});

export default RadiusSelect;
