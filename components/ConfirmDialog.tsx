import React from 'react';
import { Dialog, Portal } from 'react-native-paper';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ConfirmDialogProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
};

export default function ConfirmDialog({
                                          visible,
                                          onClose,
                                          onConfirm,
                                          title = 'Подтверждение',
                                          message = 'Вы уверены, что хотите продолжить?',
                                          confirmText = 'Удалить',
                                          cancelText = 'Отмена',
                                      }: ConfirmDialogProps) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onClose} style={styles.dialog}>
                <Dialog.Title style={styles.dialogTitle}>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text style={styles.dialogText}>{message}</Text>
                </Dialog.Content>
                <Dialog.Actions style={styles.actionContainer}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancelButton}>{cancelText.toUpperCase()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onConfirm} style={styles.deleteButtonContainer}>
                        <Text style={styles.deleteButton}>{confirmText.toUpperCase()}</Text>
                    </TouchableOpacity>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        width: '90%',
        maxWidth: 380,
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    dialogTitle: {
        fontWeight: '600',
        fontSize: 18,
        color: '#222',
        marginBottom: 8,
    },
    dialogText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },
    cancelButton: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    deleteButtonContainer: {
        backgroundColor: '#ff7f50',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    deleteButton: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
