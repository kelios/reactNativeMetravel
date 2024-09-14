import React, {useCallback, useEffect, useState} from 'react';
import TextInputComponent from '@/components/TextInputComponent';
import CheckboxComponent from '@/components/CheckboxComponent';
import YoutubeLinkComponent from '@/components/YoutubeLinkComponent';

import {
    ScrollView,
    StyleSheet,
    View,
    Text,
    Dimensions,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {fetchFilters, fetchFiltersCountry, saveFormData, UPLOAD_IMAGE} from "@/src/api/travels";
import MultiSelect from "react-native-multiple-select";
import {TravelFormData,MarkerData} from "@/src/types/types";
import ArticleEditor from "@/components/ArticleEditor";
import ImageUploadComponent from "@/components/ImageUploadComponent";
import MapUploadComponent from "@/components/MapUploadComponent";
import ImageGalleryComponent from "@/components/ImageGalleryComponent";
import WebMapComponent from "@/components/WebMapComponent";

interface Category {
    id: string
    name: string
}

interface Filters {
    countries: string[]
    categories: string[]
    companion: string[]
    complexity: string[]
    month: string[]
    overNightStay: string[]
    coordsMeTravel: string[]
    transports: string[]
}


export default function NewTravelScreen() {
    const route = useRoute();
    const windowWidth = Dimensions.get('window').width
    const styles = getStyles(windowWidth)
    const isMobile = windowWidth <= 768
    const initMenuVisible = !isMobile


    const [menuVisible, setMenuVisible] = useState(initMenuVisible)
    const [isLoadingFilters, setIsLoadingFilters] = useState(false)
    const [isSaving, setIsSaving] = useState(false); // Состояние для индикатора автосохранения

    const [markers, setMarkers] = useState([]); // Хранение маркеров

    const [filters, setFilters] = useState<Filters>({
        countries: [],
        categories: [],
        companion: [],
        complexity: [],
        month: [],
        overNightStay: [],
        transports: [],
    })

    const [formData, setFormData] = useState<TravelFormData>({
        id: route.params?.recordId || null,
        name: '',
        categories: [],
        transports: [],
        month: [],
        complexity: [],
        over_nights_stay: [],
        cities: [],
        countries: [],
        budget: '',
        year: '',
        number_peoples: '',
        number_days: '',
        minus: '',
        plus: '',
        recommendation: '',
        description: '',
        publish: false,
        visa: false,
        coordsMeTravel: [],
        thumbs200ForCollectionArr: [],
        travelImageThumbUrlArr: [],
        travelImageAddress: [],
    });

    useEffect(() => {
        getFilters()
        getFiltersCountry()
    }, [])

    useEffect(() => {
        const autoSaveTimeout = setTimeout(() => {
            handleAutoSave();
        }, 5000); // Автосохранение через 5 секунд после изменения

        return () => clearTimeout(autoSaveTimeout); // Очистка таймера при каждом изменении
    }, [formData]);

    const handleAutoSave = async () => {
        try {
            setIsSaving(true);
            const savedId = await saveFormDataWithId(formData);
            if (!formData.id && savedId) {
                setFormData((prevData) => ({...prevData, id: savedId}));
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
                setFormData((prevData) => ({...prevData, id: savedId}));
            }
            console.log('Форма отправлена успешно!');
        } catch (error) {
            console.error('Ошибка при отправке формы:', error);
        }
    };

    const saveFormDataWithId = async (data: TravelFormData): Promise<string> => {
        const updatedData = {...data, id: data.id || null}; // Добавляем recordId в данные

        return await saveFormData(cleanEmptyFields(updatedData));
    };
    function cleanEmptyFields(obj: any): any {
        const cleanedObj: any = {};

        Object.keys(obj).forEach(key => {
            const value = obj[key];

            // Проверяем, является ли значение массивом
            if (Array.isArray(value)) {
                cleanedObj[key] = value;
            } else if (value === '') {
                // Заменяем пустые строки на null
                cleanedObj[key] = null;
            } else if (typeof value === 'object' && value !== null) {
                // Рекурсивно очищаем вложенные объекты
                cleanedObj[key] = cleanEmptyFields(value);
            } else {
                cleanedObj[key] = value;
            }
        });

        return cleanedObj;
    }

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return
        setIsLoadingFilters(true)
        const newData = await fetchFilters()
        setFilters((prevFilters) => ({
            ...prevFilters,
            categories: newData?.categories || [],
            categoryTravelAddress: newData?.categoryTravelAddress || [],
            companion: newData?.companion || [],
            complexity: newData?.complexity || [],
            month: newData?.month || [],
            overNightStay: newData?.overNightStay || [],
            transports: newData?.transports || [],
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

    const handleTextFilterChange = (key:string, value: string) => {
        setFormData({
            ...formData,
            [key]: value,
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
        return <ActivityIndicator/>
    }

    const handleCountrySelect = (countryId) => {
        if (countryId) {
            setFormData(prevData => {
                // Проверяем, есть ли страна уже в списке стран
                if (!prevData.countries.includes(countryId)) {
                    return {
                        ...prevData,
                        countries: [...prevData.countries, countryId],
                    };
                }
                return prevData; // Если страна уже есть, ничего не делаем
            });
        }
    };

    const handleCountryDeselect = (countryId) => {
        setFormData(prevData => {
            return {
                ...prevData,
                countries: prevData.countries.filter(id => id !== countryId),
            };
        });
    };


    const handleMarkersChange = (updatedMarkers: MarkerData[]) => {
        setMarkers(updatedMarkers);
        setFormData(prevData => ({
            ...prevData,
            coordsMeTravel: updatedMarkers.map(marker => ({
                id: marker.id,
                lat: marker.lat,
                lng: marker.lng,
                country: marker.country,
                city: marker.city,
                address: marker.address,
                categories: marker.categories,
                image: marker.image,
            })),
        }));
    };

    const renderFilters = () => {
        if (menuVisible) {
            return (
                <View style={{backgroundColor: 'white'}}>
                    {formData.id && (
                        <TextInput
                            style={styles.hiddenInput}
                            value={formData.id}
                            editable={false}
                        />
                    )}
                    <CheckboxComponent
                        label="Черновик"
                        value={formData?.publish}
                        onChange={(value) => handleChange('publish', value)}
                    />
                    <SafeAreaView style={styles.container}>
                        <ImageUploadComponent collection='travelMainImage' /> {/* Вызов компонента с параметром collection */}
                    </SafeAreaView>

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
                        searchInputStyle={{color: '#CCC'}}
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
                        searchInputStyle={{color: '#CCC'}}
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
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{color: '#CCC'}}
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
                        searchInputStyle={{color: '#CCC'}}
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
                        searchInputStyle={{color: '#CCC'}}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <MultiSelect
                        hideTags
                        items={filters?.overNightStay}
                        uniqueKey="id"
                        onSelectedItemsChange={onSelectedItemsChange('over_nights_stay')}
                        selectedItems={formData?.over_nights_stay}
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
                        searchInputStyle={{color: '#CCC'}}
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
                        searchInputStyle={{color: '#CCC'}}
                        submitButtonColor="#CCC"
                        submitButtonText="Submit"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Год"
                        value={formData?.year}
                        onChangeText={(value) => handleTextFilterChange('year', value)}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Количество человек"
                        value={formData?.number_peoples}
                        onChangeText={(value) => handleTextFilterChange('number_peoples', value)}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Количество потраченных средств $"
                        value={formData?.budget}
                        onChangeText={(value) => handleTextFilterChange('budget', value)}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Количество дней"
                        value={formData?.number_days}
                        onChangeText={(value) => handleTextFilterChange('number_days', value)}
                        keyboardType="numeric"
                    />

                    <CheckboxComponent
                        label="Нужна виза"
                        value={formData?.visa}
                        onChange={(value) => handleChange('visa', value)}
                    />


                        <MapUploadComponent collection='travelRoad'>
                        </ MapUploadComponent>


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
                {isSaving && <ActivityIndicator size="small" color="#ff6347"/>}
                <View style={styles.formRow}>
                    <View style={styles.leftColumn}>
                        <TextInputComponent
                            label="Название"
                            value={formData.name}
                            onChange={(value) => handleChange('name', value)}
                        />

                        <YoutubeLinkComponent
                            label="Ссылка на Youtube"
                            value={formData.youtubeLink}
                            onChange={(value) => handleChange('youtubeLink', value)}
                        />

                        <WebMapComponent
                            markers={markers}
                            onMarkersChange={handleMarkersChange}
                            onCountrySelect={handleCountrySelect}
                            onCountryDeselect={handleCountryDeselect}
                            categoryTravelAddress={filters.categoryTravelAddress}
                            countrylist={filters.countries}
                        />

                        <SafeAreaView>
                            <ArticleEditor
                                label="Описание"
                                height={400}  // Устанавливаем высоту окна редактора
                                content={formData.description}
                                onChange={(newContent: any) => handleChange('description', newContent)}
                                uploadUrl={UPLOAD_IMAGE}
                            />
                        </SafeAreaView>

                        <SafeAreaView>
                            <ArticleEditor
                                label="Плюсы"
                                height={300}  // Устанавливаем высоту окна редактора
                                content={formData.plus}
                                onChange={(newContent: any) => handleChange('plus', newContent)}
                                uploadUrl={UPLOAD_IMAGE}
                            />
                        </SafeAreaView>

                        <SafeAreaView>
                            <ArticleEditor
                                label="Минусы"
                                height={300}  // Устанавливаем высоту окна редактора
                                content={formData.minus}
                                onChange={(newContent: any) => handleChange('minus', newContent)}
                                uploadUrl={UPLOAD_IMAGE}
                            />
                        </SafeAreaView>

                        <SafeAreaView style={{flex: 1}}>
                            <ArticleEditor
                                label="Рекомендации"
                                height={300}  // Устанавливаем высоту окна редактора
                                content={formData.minus}
                                onChange={(newContent: any) => handleChange('recommendation', newContent)}
                                uploadUrl={UPLOAD_IMAGE}
                            />
                        </SafeAreaView>

                        <ImageGalleryComponent collection='gallery'>
                        </ ImageGalleryComponent>

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
            {isSaving && <ActivityIndicator size="small" color="#ff6347"/>}
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
            shadowOffset: {width: 0, height: 2},
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
            backgroundColor: '#ff9f5a',
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

