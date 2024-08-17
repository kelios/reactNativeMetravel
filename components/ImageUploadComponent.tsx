import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from "@/src/api/travels";
import { HEICConverter } from 'react-native-heic-converter';

interface ImageUploadComponentProps {
    collection: string;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({ collection }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    // Drag-and-Drop логика для веба
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            const fileType = file.type;

            let fileUri = URL.createObjectURL(file);

            // Если файл формата HEIC, конвертируем его в JPEG
            if (fileType === 'image/heic' || fileType === 'image/heif') {
                try {
                    const converted = await HEICConverter.convert({ path: fileUri });
                    fileUri = converted.path;
                } catch (error) {
                    console.error('Error converting HEIC image:', error);
                    setUploadMessage('Failed to convert HEIC image.');
                    return;
                }
            }

            setImageUri(fileUri);
            await handleUploadImage(file); // Загружаем изображение на сервер
        },
        accept: 'image/*',
    });

    // Функция для выбора изображения из галереи для мобильных устройств
    const pickImage = () => {
        ImagePicker.launchImageLibrary({}, async (response) => {
            if (response.assets && response.assets.length > 0) {
                let selectedImageUri = response.assets[0].uri;
                const fileType = response.assets[0].type;

                // Если файл формата HEIC, конвертируем его в JPEG
                if (fileType === 'image/heic' || fileType === 'image/heif') {
                    try {
                        const converted = await HEICConverter.convert({ path: selectedImageUri });
                        selectedImageUri = converted.path;
                    } catch (error) {
                        console.error('Error converting HEIC image:', error);
                        setUploadMessage('Failed to convert HEIC image.');
                        return;
                    }
                }

                setImageUri(selectedImageUri);

                // Загружаем изображение
                const file = {
                    uri: selectedImageUri,
                    name: 'photo.jpg',
                    type: fileType || 'image/jpeg',
                };
                await handleUploadImage(file as any);
            }
        });
    };

    // Функция для загрузки изображения на сервер
    const handleUploadImage = async (file: any) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('collection', collection);

            // Отправляем данные через функцию `uploadImage`
            const response = await uploadImage(formData);

            if (response?.data?.url) {
                setUploadMessage("Image uploaded successfully: " + response.data.url);
            } else {
                setUploadMessage("Upload failed.");
            }
        } catch (error) {
            console.error(error);
            setUploadMessage("An error occurred during upload.");
        }
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <div {...getRootProps({ className: 'dropzone' })} style={styles.dropzone}>
                    <input {...getInputProps()} />
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.roundedImage} />
                    ) : (
                        <Text style={styles.placeholderText}>Загрузите картинку</Text>
                    )}
                </div>
            ) : (
                <>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                        <Text style={styles.buttonText}>Загрузить фото</Text>
                    </TouchableOpacity>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.roundedImage} />
                    ) : (
                        <Text style={styles.placeholderText}>Загрузите картинку</Text>
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
    roundedImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginVertical: 20,
        borderColor: '#fff',
        borderWidth: 2,
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

export default ImageUploadComponent;
