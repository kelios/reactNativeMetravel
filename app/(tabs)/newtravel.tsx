import React from 'react';
import TextInputComponent from '@/components/TextInputComponent';
import MultiSelectComponent from '@/components/MultiSelectComponent';
import TextEditor from '@/components/TextEditor';
import CheckboxComponent from '@/components/CheckboxComponent';
import NumberInputComponent from '@/components/NumberInputComponent';
import YoutubeLinkComponent from '@/components/YoutubeLinkComponent';
import ButtonComponent from '@/components/ButtonComponent';
import {
    ScrollView
} from 'react-native'
export default function NewTravelScreen() {
        const [formData, setFormData] = React.useState({
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

        const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            try {
                // Отправка данных на сервер
                await saveFormData(formData);
                console.log('Форма отправлена успешно!');
            } catch (error) {
                console.error('Ошибка при отправке формы:', error);
            }
        };

        const saveFormData = async (data: any) => {
            // Ваша логика отправки данных на сервер
            // Например, использование fetch или axios для отправки POST запроса на сервер
        };

        const handleChange = (name: string, value: any) => {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        };


        return (
            <ScrollView>
                <h2>Форма создания путешествия</h2>
                <form onSubmit={handleSubmit}>
                    <TextInputComponent label="Название"/>
                    <MultiSelectComponent label="Страны"
                                          options={[{value: '1', label: 'Страна 1'}, {value: '2', label: 'Страна 2'}]}/>
                    <MultiSelectComponent label="Города"
                                          options={[{value: '1', label: 'Город 1'}, {value: '2', label: 'Город 2'}]}/>
                    <TextEditor label="Описание"/>
                    <TextEditor label="Плюсы"/>
                    <TextEditor label="Минусы"/>
                    <TextEditor label="Рекомендации"/>
                    <YoutubeLinkComponent label="Ссылка на Youtube"/>
                    <MultiSelectComponent label="Категории путешествия" options={[{value: '1', label: 'Категория 1'}, {
                        value: '2',
                        label: 'Категория 2'
                    }]}/>
                    <MultiSelectComponent label="Транспорт" options={[{value: '1', label: 'Транспорт 1'}, {
                        value: '2',
                        label: 'Транспорт 2'
                    }]}/>
                    <MultiSelectComponent label="Месяц"
                                          options={[{value: '1', label: 'Январь'}, {value: '2', label: 'Февраль'}]}/>
                    <NumberInputComponent label="Год"/>
                    <MultiSelectComponent label="Уровень физической подготовки"
                                          options={[{value: '1', label: 'Легкий'}, {value: '2', label: 'Средний'}]}/>
                    <MultiSelectComponent label="Вы брали с собой животное" options={[{value: '1', label: 'Отель'},]}/>
                    <MultiSelectComponent label="Где останавливались на ночлег"
                                          options={[{value: '1', label: 'Отель'}, {value: '2', label: 'Кемпинг'}]}/>
                    <TextInputComponent label="Количество потраченных средств"/>
                    <NumberInputComponent label="Количество человек"/>
                    <NumberInputComponent label="Количество дней"/>
                    <CheckboxComponent label="Нужна виза"/>
                    <CheckboxComponent label="Черновик"/>
                    <ButtonComponent label="Сохранить" onClick={() => console.log('Форма отправлена')}/>
                </form>
            </ScrollView>
        );

}