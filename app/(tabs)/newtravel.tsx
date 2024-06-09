import React, { useState } from 'react';
import TextInputComponent from '@/components/TextInputComponent';
import MultiSelectComponent from '@/components/MultiSelectComponent';
import RichTextEditor from '@/components/RichTextEditor';
import CheckboxComponent from '@/components/CheckboxComponent';
import NumberInputComponent from '@/components/NumberInputComponent';
import YoutubeLinkComponent from '@/components/YoutubeLinkComponent';
import ButtonComponent from '@/components/ButtonComponent';
import { ScrollView, StyleSheet, View, Text } from 'react-native';


interface FormData {
    name: string;
    countries: Array<{ id: string; name: string }>;
    cities: Array<{ id: string; name: string }>;
    description: string;
    plus: string;
    minus: string;
    recommendation: string;
    youtubeLink: string;
    categories: Array<{ id: string; name: string }>;
    transports: Array<{ id: string; name: string }>;
    month: Array<{ id: string; name: string }>;
    year: string;
    physicalCondition: Array<{ id: string; name: string }>;
    hasChild: boolean;
    hasPet: boolean;
    accommodation: Array<{ id: string; name: string }>;
    spentAmount: string;
    numberOfPeople: string;
    numberOfDays: string;
    needVisa: boolean;
    isDraft: boolean;
}

export default function NewTravelScreen() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        countries: [],
        cities: [],
        description: '',
        plus: '',
        minus: '',
        recommendation: '',
        youtubeLink: '',
        categories: [],
        transports: [],
        month: [],
        year: '',
        physicalCondition: [],
        hasChild: false,
        hasPet: false,
        accommodation: [],
        spentAmount: '',
        numberOfPeople: '',
        numberOfDays: '',
        needVisa: false,
        isDraft: false,
    });

    const handleSubmit = async () => {
        try {
            // Отправка данных на сервер
            await saveFormData(formData);
            console.log('Форма отправлена успешно!');
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
        }
    };

    const saveFormData = async (data: FormData) => {
        // Ваша логика отправки данных на сервер
        // Например, использование fetch или axios для отправки POST запроса на сервер
    };

    const handleChange = (name: keyof FormData, value: any) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Новое путешествие</Text>
                <View style={styles.formRow}>
                    <View style={styles.leftColumn}>
                        <TextInputComponent
                            label="Название"
                            value={formData.name}
                            onChange={(value) => handleChange('name', value)}
                        />
                        <MultiSelectComponent
                            label="Страны"
                            options={[{ id: '1', name: 'Страна 1' }, { id: '2', name: 'Страна 2' }]}
                            selectedValues={formData.countries.map(country => country.id)}
                            onChange={(selectedItems) => {
                                handleChange('countries', selectedItems.map(id => formData.countries.find(country => country.id === id) || { id, name: '' }));
                            }}
                        />
                        <MultiSelectComponent
                            label="Города"
                            options={[{ id: '1', name: 'Город 1' }, { id: '2', name: 'Город 2' }]}
                            selectedValues={formData.cities.map(city => city.id)}
                            onChange={(selectedItems) => {
                                handleChange('cities', selectedItems.map(id => formData.cities.find(city => city.id === id) || { id, name: '' }));
                            }}
                        />

                        <RichTextEditor
                            label="Описание"
                            value={formData.description}
                            onChange={(value) => handleChange('description', value)}
                        />
                        <RichTextEditor
                            label="Плюсы"
                            value={formData.plus}
                            onChange={(value) => handleChange('plus', value)}
                        />
                        <RichTextEditor
                            label="Минусы"
                            value={formData.minus}
                            onChange={(value) => handleChange('minus', value)}
                        />
                        <RichTextEditor
                            label="Рекомендации"
                            value={formData.recommendation}
                            onChange={(value) => handleChange('recommendation', value)}
                        />
                        <YoutubeLinkComponent
                            label="Ссылка на Youtube"
                            value={formData.youtubeLink}
                            onChange={(value) => handleChange('youtubeLink', value)}
                        />
                    </View>
                    <View style={styles.rightColumn}>
                        <CheckboxComponent
                            label="Черновик"
                            value={formData.isDraft}
                            onChange={(value) => handleChange('isDraft', value)}
                        />
                        <ButtonComponent label="Загрузить главное фото вашего путешествия" onPress={() => console.log('Upload main photo')} />
                        <MultiSelectComponent
                            label="Категории путешествия"
                            options={[{ id: '1', name: 'Категория 1' }, { id: '2', name: 'Категория 2' }]}
                            selectedValues={formData.categories.map(category => category.id)}
                            onChange={(selectedItems) => {
                                handleChange('categories', selectedItems.map(id => formData.categories.find(category => category.id === id) || { id, name: '' }));
                            }}
                        />
                        <MultiSelectComponent
                            label="Транспорт"
                            options={[{ id: '1', name: 'Транспорт 1' }, { id: '2', name: 'Транспорт 2' }]}
                            selectedValues={formData.transports.map(transport => transport.id)}
                            onChange={(selectedItems) => {
                                handleChange('transports', selectedItems.map(id => formData.transports.find(transport => transport.id === id) || { id, name: '' }));
                            }}
                        />
                        <MultiSelectComponent
                            label="Месяц"
                            options={[{ id: '1', name: 'Январь' }, { id: '2', name: 'Февраль' }]}
                            selectedValues={formData.month.map(month => month.id)}
                            onChange={(selectedItems) => {
                                handleChange('month', selectedItems.map(id => formData.month.find(month => month.id === id) || { id, name: '' }));
                            }}
                        />
                        <NumberInputComponent
                            label="Год"
                            value={formData.year}
                            onChange={(value) => handleChange('year', value)}
                        />
                        <MultiSelectComponent
                            label="Уровень физической подготовки"
                            options={[{ id: '1', name: 'Легкий' }, { id: '2', name: 'Средний' }]}
                            selectedValues={formData.physicalCondition.map(condition => condition.id)}
                            onChange={(selectedItems) => {
                                handleChange('physicalCondition', selectedItems.map(id => formData.physicalCondition.find(condition => condition.id === id) || { id, name: '' }));
                            }}
                        />
                        <CheckboxComponent
                            label="Вы брали с собой животное"
                            value={formData.hasPet}
                            onChange={(value) => handleChange('hasPet', value)}
                        />
                        <MultiSelectComponent
                            label="Где останавливались на ночлег"
                            options={[{ id: '1', name: 'Отель' }, { id: '2', name: 'Кемпинг' }]}
                            selectedValues={formData.accommodation.map(accommodation => accommodation.id)}
                            onChange={(selectedItems) => {
                                handleChange('accommodation', selectedItems.map(id => formData.accommodation.find(accommodation => accommodation.id === id) || { id, name: '' }));
                            }}
                        />
                        <TextInputComponent
                            label="Количество потраченных средств"
                            value={formData.spentAmount}
                            onChange={(value) => handleChange('spentAmount', value)}
                        />
                        <NumberInputComponent
                            label="Количество человек"
                            value={formData.numberOfPeople}
                            onChange={(value) => handleChange('numberOfPeople', value)}
                        />
                        <NumberInputComponent
                            label="Количество дней"
                            value={formData.numberOfDays}
                            onChange={(value) => handleChange('numberOfDays', value)}
                        />
                        <CheckboxComponent
                            label="Нужна виза"
                            value={formData.needVisa}
                            onChange={(value) => handleChange('needVisa', value)}
                        />
                        <ButtonComponent label="Сохранить" onPress={handleSubmit} />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formSection: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#4b7c6f',
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftColumn: {
        flex: 0.7,
        marginRight: 10,
    },
    rightColumn: {
        flex: 0.3,
        marginLeft: 10,
    },
});
