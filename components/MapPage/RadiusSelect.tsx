import React, { useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, UIManager, findNodeHandle } from 'react-native';
import { Menu, Button } from 'react-native-paper';

const RadiusSelect = ({ value, options = [], onChange }) => {
    const [visible, setVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState('bottom');
    const anchorRef = useRef(null);

    const openMenu = () => {
        anchorRef.current.measure((fx, fy, width, height, px, py) => {
            const screenHeight = Dimensions.get('window').height;
            const spaceBelow = screenHeight - (py + height);
            setMenuPosition(spaceBelow < 250 ? 'top' : 'bottom');
            setVisible(true);
        });
    };

    const closeMenu = () => setVisible(false);

    const selectedOption = useMemo(
        () => options.find((opt) => String(opt.id) === String(value)),
        [options, value],
    );

    const selectedLabel = selectedOption ? `${selectedOption.name} км` : 'Выберите радиус';

    return (
        <View style={styles.container}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button
                        ref={anchorRef}
                        mode="outlined"
                        onPress={openMenu}
                        contentStyle={styles.buttonContent}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        icon="chevron-down"
                    >
                        {selectedLabel}
                    </Button>
                }
                anchorPosition={menuPosition}
                style={styles.menu}
            >
                {options.map((item) => (
                    <Menu.Item
                        key={item.id}
                        onPress={() => {
                            onChange(item.id);
                            closeMenu();
                        }}
                        title={`${item.name} км`}
                        titleStyle={styles.menuItemText}
                    />
                ))}
            </Menu>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    buttonContent: {
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 40,
    },
    buttonLabel: {
        color: '#333',
        fontSize: 14,
        flex: 1,
        textAlign: 'left',
    },
    menu: {
        width: '100%',
        maxWidth: 200,
        maxHeight: 250,
    },
    menuItemText: {
        fontSize: 14,
        color: '#333',
    },
});

export default React.memo(RadiusSelect);
