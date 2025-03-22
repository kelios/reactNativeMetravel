import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, useTheme } from 'react-native-paper';

const RadiusSelect = ({ value, options, onChange }) => {
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const selectedOption = options.find((opt) => String(opt.id) === String(value));
    const selectedLabel = selectedOption ? `${selectedOption.name} км` : 'Выберите радиус';

    return (
        <View>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={openMenu}
                        contentStyle={styles.buttonContent}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        icon="arrow-drop-down"
                    >
                        {selectedLabel}
                    </Button>
                }
                anchorPosition="bottom"
                style={styles.menu}
            >
                {options.map((item) => (
                    <Menu.Item
                        key={item.id}
                        onPress={() => {
                            onChange(item.id);
                            setTimeout(closeMenu, 0); // предотвращает залипание
                        }}
                        title={item.name}
                        titleStyle={styles.menuItemText}
                    />
                ))}
            </Menu>
        </View>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'white',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    buttonContent: {
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        height: 40,
    },
    buttonLabel: {
        color: '#333',
        fontSize: 14,
        textAlign: 'left',
    },
    menu: {
        width: 150,
    },
    menuItemText: {
        fontSize: 14,
        color: '#333',
    },
});

export default RadiusSelect;
