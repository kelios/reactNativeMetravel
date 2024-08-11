import React, {useCallback, useEffect, useState} from 'react';
import TextInputComponent from '@/components/TextInputComponent';
import RichTextEditor from '@/components/RichTextEditor';
import CheckboxComponent from '@/components/CheckboxComponent';
import YoutubeLinkComponent from '@/components/YoutubeLinkComponent';
import ButtonComponent from '@/components/ButtonComponent';
import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    Dimensions,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchFilters, fetchFiltersCountry, saveFormData} from "@/src/api/travels";
import MultiSelect from "react-native-multiple-select";
import {TravelFormData} from "@/src/types/types";

interface Category {
    id: string
    name: string
}

interface Filters {
    countries: string[]
    categories: string[]
    categoryTravelAddress: string[]
    companion: string[]
    complexity: string[]
    month: string[]
    overNightStay: string[]
    transports: string[]
    year: string
}



export default function NewTravelScreen() {
    const route = useRoute();
    const windowWidth = Dimensions.get('window').width
    const styles = getStyles(windowWidth)
    const [search, setSearch] = useState('')
    const isMobile = windowWidth <= 768
    const initMenuVisible = !isMobile


    const [menuVisible, setMenuVisible] = useState(initMenuVisible)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingFilters, setIsLoadingFilters] = useState(false)
    const [recordId, setRecordId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false); // Состояние для индикатора автосохранения

    const [filters, setFilters] = useState<Filters>({
        countries: [],
        categories: [],
        categoryTravelAddress: [],
        companion: [],
        complexity: [],
        month: [],
        overNightStay: [],
        transports: [],
        year: '',
    })

    const [formData, setFormData] = useState<TravelFormData>({
        id: route.params?.recordId || null,
        name: '',
        countries: [],
        cities: [],
        categoryTravelAddress: [],
        overNightStay: [],
        complexity: [],
        companion: [],
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

    useEffect(() => {
        getFilters()
        getFiltersCountry()
    }, [])

    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            handleAutoSave();
        }, 300000); // 5 минут в миллисекундах

        return () => {
            clearInterval(autoSaveInterval); // Очистка интервала при размонтировании компонента
        };
    }, [formData, recordId]);

    const handleAutoSave = async () => {
        try {
            setIsSaving(true);
            const savedId = await saveFormDataWithId(formData);
            if (!formData.id && savedId) {
                setFormData((prevData) => ({ ...prevData, id: savedId }));
            }
            console.log('Автосохранение прошло успешно!');
        } catch (error) {
            console.error('Ошибка при автосохранении:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const savedId = await saveFormDataWithId(formData);
            if (!formData.id && savedId) {
                setFormData((prevData) => ({ ...prevData, id: savedId }));
            }
            console.log('Форма отправлена успешно!');
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
        }
    };

    const saveFormDataWithId = async (data: TravelFormData): Promise<string> => {
        const updatedData = { ...data, id: data.id || null }; // Добавляем recordId в данные
        return await saveFormData(updatedData); // Передаем данные в функцию сохранения
    };

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return
        setIsLoadingFilters(true)
        const newData = await fetchFilters()
        setFilters((prevFilters) => ({
            ...prevFilters,
            categories: newData?.categories,
            categoryTravelAddress: newData?.categoryTravelAddress,
            companion: newData?.companion,
            complexity: newData?.complexity,
            month: newData?.month,
            overNightStay: newData?.overNightStay,
            transports: newData?.transports,
        }))
        setIsLoadingFilters(false)
    }, [isLoadingFilters, filters])

    const getFiltersCountry = useCallback(async () => {
        if (isLoadingFilters) return
        setIsLoadingFilters(true)
        const country = await fetchFiltersCountry()
        setFilters((prevFilters) => ({
            ...prevFilters,
            countries: country,
        }))
        setIsLoadingFilters(false)
    }, [isLoadingFilters, filters])


    const onSelectedItemsChange =
        (field: keyof FormData) => (selectedItems: string[]) => {
            setFormData({
                ...formData,
                [field]: selectedItems,
            })
        }

    const handleTextFilterChange = (value: string) => {
        setFormData({
            ...formData,
            year: value,
        })
    }


    const handleChange = (name: keyof FormData, value: any) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const toggleMenu = () => {
        setMenuVisible(!menuVisible)
    }

    const closeMenu = () => {
        setMenuVisible(false)
    }

    if (!filters) {
        return <ActivityIndicator />
    }

    const renderFilters = () => {
        if (menuVisible) {
            return (
                <View style={{ backgroundColor: 'white' }}>
                    {formData.id && (
                        <TextInput
                            style={styles.hiddenInput}
                            value={formData.id}
                            editable={false}
                        />
                    )}
                    <CheckboxComponent
                        label="Черновик"
                        value={formData.isDraft}
                        onChange={(value) => handleChange('isDraft', value)}
                    />

                    <ButtonComponent label="Загрузить главное фото вашего путешествия" onPress={() => console.log('Upload main photo')} />
                    <MultiSelect
                        hideTags
                        items={filters?.countries || []}
                        uniqueKey="country_id"
                        onSelectedItemsChange={onSelectedItemsChange('countries')}
                        selectedItems={formData?.countries}
                        isLoading={isLoadingFilters}
                        selectText="Выберите страны..."
                        searchInputPlaceholderText="Выберите страны..."
                        onChangeInput={(text) => console.log(text)}
                        //  altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="title_ru"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.categories || []}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('categories')}
                        selectedItems={formData?.categories}
                        isLoading={isLoadingFilters}
                        selectText="Категории..."
                        searchInputPlaceholderText="Категории..."
                        onChangeInput={(text) => console.log(text)}
                        //   altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.categoryTravelAddress || []}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange(
                            'categoryTravelAddress',
                        )}
                        selectedItems={formData?.categoryTravelAddress}
                        isLoading={isLoadingFilters}
                        selectText="Обьекты..."
                        searchInputPlaceholderText="Обьекты..."
                        onChangeInput={(text) => console.log(text)}
                        //   altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.transports}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('transports')}
                        selectedItems={formData?.transports}
                        isLoading={isLoadingFilters}
                        selectText="Транспорт..."
                        searchInputPlaceholderText="Транспорт..."
                        onChangeInput={(text) => console.log(text)}
                        //altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.complexity}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('complexity')}
                        selectedItems={formData?.complexity}
                        isLoading={isLoadingFilters}
                        selectText="Уровень физической подготовки..."
                        searchInputPlaceholderText="Уровень физической подготовки..."
                        onChangeInput={(text) => console.log(text)}
                        // altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.companion}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('companion')}
                        selectedItems={formData?.companion}
                        isLoading={isLoadingFilters}
                        selectText="Варианты отдыха с..."
                        searchInputPlaceholderText="Варианты отдыха с..."
                        onChangeInput={(text) => console.log(text)}
                        //   altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.overNightStay}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('overNightStay')}
                        selectedItems={formData?.overNightStay}
                        isLoading={isLoadingFilters}
                        selectText="Варианты ночлега..."
                        searchInputPlaceholderText="Варианты ночлега..."
                        onChangeInput={(text) => console.log(text)}
                        // altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.month}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('month')}
                        selectedItems={formData?.month}
                        isLoading={isLoadingFilters}
                        selectText="Месяц..."
                        searchInputPlaceholderText="Месяц..."
                        onChangeInput={(text) => console.log(text)}
                        //  altFontFamily="ProximaNova-Light"
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#CCC' }}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Год"
                        value={formData?.year}
                        onChangeText={handleTextFilterChange}
                        keyboardType="numeric"
                    />

                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.applyButtonText}>Сохранить</Text>
                    </TouchableOpacity>
                    {isMobile && (
                        <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )
        }
        return null
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formSection}>
                <View style={styles.formRow}>
                    <View style={styles.leftColumn}>
                        <TextInputComponent
                            label="Название"
                            value={formData.name}
                            onChange={(value) => handleChange('name', value)}
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

                        {isMobile ? (
                            <View
                                style={[
                                    styles.sideMenu,
                                    styles.mobileSideMenu,
                                    menuVisible && styles.visibleMobileSideMenu,
                                ]}
                            >
                                {renderFilters()}
                            </View>
                        ) : (
                            <View style={[styles.sideMenu, styles.desktopSideMenu]}>
                                {renderFilters()}
                            </View>
                        )}

                    </View>
                </View>
            </View>
            {isSaving && <ActivityIndicator size="small" color="#0000ff" />}
        </ScrollView>
    );
}

const getStyles = (windowWidth: number) => {
    return StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: windowWidth > 500 ? '7%' : '20%',
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


        input: {
            marginBottom: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            backgroundColor: 'white',
        },
        applyButton: {
            backgroundColor: '#6aaaaa',
            padding: 10,
            alignItems: 'center',
            borderRadius: 5,
        },
        applyButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
        closeButton: {
            backgroundColor: 'gray',
            padding: 10,
            alignItems: 'center',
            borderRadius: 5,
            marginTop: 10,
        },
        closeButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },

        menuButtonContainer: {
            //alignSelf: 'flex-start', // Позиционирование кнопки
            //flex:1,
            width: 600,
            // marginLeft: 20, // Отступ слева
            // marginTop: 20, // Отступ сверху
        },
        menuButton: {
            // flex: 1,
            backgroundColor: '#6aaaaa',
            // paddingHorizontal: 20,
            //  paddingVertical: 10,
            //  borderRadius: 5,
        },
        menuButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
        hiddenInput: {
            display: 'none', // Скрываем поле ID
        },
});
}
