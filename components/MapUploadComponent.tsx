import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from "@/src/api/travels";

// Условный импорт для DocumentPicker, только если платформа не является вебом
let DocumentPicker: any;
if (Platform.OS !== 'web') {
    DocumentPicker = require('react-native-document-picker');
}

interface MapUploadComponentProps {
    collection: string;
}

const MapUploadComponent: React.FC<MapUploadComponentProps> = ({ collection }) => {
    const [fileUri, setFileUri] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    // Поддерживаемые форматы карт
    const supportedFormats = ['.gpx', '.kml', '.kmz', '.geojson'];

    // Drag-and-Drop логика для веба
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            setFileName(file.name);
            const fileUri = URL.createObjectURL(file);
            setFileUri(fileUri);

            await handleUploadFile(file); // Загружаем файл на сервер
        },
        accept: supportedFormats.map((format) => `.${format.split('.').pop()}`).join(','),
    });

    // Функция для выбора файла для мобильных устройств
    const pickFile = async () => {
        if (Platform.OS !== 'web' && DocumentPicker) {
            try {
                const res = await DocumentPicker.pick({
                    type: [DocumentPicker.types.allFiles],
                });

                if (res && res[0]) {
                    const { name, uri, type } = res[0];
                    setFileUri(uri);
                    setFileName(name);

                    if (supportedFormats.some((format) => name.endsWith(format))) {
                        await handleUploadFile({
                            uri: uri,
                            name: name,
                            type: type || 'application/octet-stream',
                        });
                    } else {
                        setUploadMessage("Неподдерживаемый формат файла");
                    }
                }
            } catch (err) {
                if (DocumentPicker.isCancel(err)) {
                    console.log('User canceled the picker');
                } else {
                    throw err;
                }
            }
        }
    };

    // Функция для загрузки файла на сервер
    const handleUploadFile = async (file: any) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('collection', collection);

            const response = await uploadImage(formData);

            if (response?.data?.url) {
                setUploadMessage("Карта успешно загружена: " + response.data.url);
            } else {
                setUploadMessage("Ошибка при загрузке карты.");
            }
        } catch (error) {
            console.error(error);
            setUploadMessage("Произошла ошибка при загрузке.");
        }
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <div {...getRootProps({ className: 'dropzone' })} style={styles.dropzone}>
                    <input {...getInputProps()} />
                    {fileUri ? (
                        <Text style={styles.fileName}>{fileName}</Text>
                    ) : (
                        <Text style={styles.placeholderText}>
                            Перетащите сюда файл карты (.gpx, .kml, .kmz, .geojson) или нажмите для выбора
                        </Text>
                    )}
                </div>
            ) : (
                <>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
                        <Text style={styles.buttonText}>Выбрать файл карты</Text>
                    </TouchableOpacity>
                    {fileUri ? (
                        <Text style={styles.fileName}>{fileName}</Text>
                    ) : (
                        <Text style={styles.placeholderText}>Загрузите файл карты (.gpx, .kml, .kmz, .geojson)</Text>
                    )}
                </>
            )}
            {uploadMessage && <Text style={styles.uploadMessage}>{uploadMessage}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropzone: {
        width: 300,
        height: 200,
        borderWidth: 2,
        backgroundColor: '#4b7c6f',
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease',
    },
    fileName: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
    },
    placeholderText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    uploadButton: {
        backgroundColor: '#4b7c6f',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    uploadMessage: {
        color: '#4b7c6f',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default MapUploadComponent;
