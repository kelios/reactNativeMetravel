import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from "@/src/api/travels";
import { HEICConverter } from 'react-native-heic-converter';
import { FontAwesome } from '@expo/vector-icons';

interface ImageUploadComponentProps {
    collection: string;
    idTravel: string;
    oldImage?: string;
    onUpload?: (imageUrl: string) => void;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({ collection, idTravel, oldImage, onUpload }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (oldImage) {
            setImageUri(oldImage);
        }
    }, [oldImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            const file = acceptedFiles[0];
            const fileType = file.type;

            let fileUri = URL.createObjectURL(file);

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

            await handleUploadImage(file);
        },
        accept: 'image/*',
    });

    const pickImage = () => {
        ImagePicker.launchImageLibrary({}, async (response) => {
            if (response.assets && response.assets.length > 0) {
                let selectedImageUri = response.assets[0].uri;
                const fileType = response.assets[0].type;

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

                await handleUploadImage({
                    uri: selectedImageUri,
                    name: 'photo.jpg',
                    type: fileType || 'image/jpeg',
                });
            }
        });
    };

    const handleUploadImage = async (file: any) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('collection', collection);
            formData.append('id', idTravel);

            const response = await uploadImage(formData);

            if (response?.url) {
                setUploadMessage("Image uploaded successfully.");
                setImageUri(response.url);
                if (onUpload) {
                    onUpload(response.url);
                }
            } else {
                setUploadMessage("Upload failed.");
            }
        } catch (error) {
            console.error(error);
            setUploadMessage("An error occurred during upload.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {Platform.OS === 'web' ? (
                <div {...getRootProps({ className: 'dropzone' })} style={isDragActive ? styles.dropzoneActive : styles.dropzone}>
                    <input {...getInputProps()} />
                    {loading ? (
                        <ActivityIndicator size="large" color="#fff" />
                    ) : imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.largeImage} />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <FontAwesome name="cloud-upload" size={50} color="#4b7c6f" />
                            <Text style={styles.placeholderText}>Перетащите сюда изображение</Text>
                            <Text style={styles.instructionsText}>или нажмите для выбора файла</Text>
                        </View>
                    )}
                </div>
            ) : (
                <>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                        <Text style={styles.buttonText}>Загрузить фото</Text>
                    </TouchableOpacity>
                    {loading ? (
                        <ActivityIndicator size="large" color="#4b7c6f" />
                    ) : imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.largeImage} />
                    ) : (
                        <Text style={styles.placeholderText}>Загрузите картинку</Text>
                    )}
                </>
            )}
            {uploadMessage && <Text style={styles.uploadMessage}>{uploadMessage}</Text>}
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        width: '100%',
    },
    dropzone: {
        width: width > 500 ? 350 : '100%',
        height: 250,
        borderWidth: 2,
        backgroundColor: '#f0f0f0',
        borderColor: '#4b7c6f',
        borderRadius: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        cursor: 'pointer',
    },
    dropzoneActive: {
        backgroundColor: '#e0f7f4',
        borderColor: '#4b7c6f',
    },
    largeImage: {
        width: 250,  // Увеличена ширина изображения
        height: 250, // Увеличена высота изображения
        borderRadius: 125, // Радиус теперь соответствует новой ширине и высоте
        marginVertical: 20,
        borderColor: '#fff',
        borderWidth: 2,
    },
    placeholderContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#4b7c6f',
        fontSize: width > 500 ? 16 : 14,
        textAlign: 'center',
        marginTop: 10,
    },
    instructionsText: {
        color: '#4b7c6f',
        fontSize: width > 500 ? 14 : 12,
        textAlign: 'center',
        marginTop: 5,
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
