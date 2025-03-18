import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform, View, ScrollView, useWindowDimensions, StyleSheet, Text, Animated, useColorScheme, Image } from 'react-native';
import RenderHTML from 'react-native-render-html';
import CustomImageRenderer from '@/components/CustomImageRenderer';
import { iframeModel } from '@native-html/iframe-plugin';

const WebView = Platform.OS !== 'web' ? require('react-native-webview').WebView : undefined;

interface TravelDescriptionProps {
    htmlContent: string;
    title: string;
}

const splitContent = (html: string) => {
    const midpoint = Math.floor(html.length / 2);
    const breakPoint = html.lastIndexOf('</p>', midpoint) + 4 || midpoint;
    return [html.slice(0, breakPoint), html.slice(breakPoint)];
};

const TravelDescription: React.FC<TravelDescriptionProps> = ({ htmlContent, title }) => {
    const { width, height } = useWindowDimensions();
    const pageHeight = useMemo(() => height * 0.75, [height]);
    const isDesktop = width > 1024;
    const [firstHalf, secondHalf] = useMemo(() => splitContent(htmlContent), [htmlContent]);

    const [scrollPercent, setScrollPercent] = useState(0);
    const animatedScroll = useState(new Animated.Value(0))[0];

    useEffect(() => {
        animatedScroll.addListener(({ value }) => setScrollPercent(value.toFixed(0)));
        return () => animatedScroll.removeAllListeners();
    }, []);

    const handleScroll = useCallback((event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const visibleHeight = layoutMeasurement.height;
        const totalHeight = contentSize.height - visibleHeight;
        const currentOffset = contentOffset.y;
        const percent = totalHeight > 0 ? (currentOffset / totalHeight) * 100 : 0;
        Animated.timing(animatedScroll, {
            toValue: percent,
            duration: 150,
            useNativeDriver: false,
        }).start();
    }, []);

    return (
        <View style={[styles.container, { height: pageHeight + 100 }]}>
            <Text style={styles.title}>{title}</Text>
            <Image source={require('@/assets/travel-stamp.png')} style={styles.stamp} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={[styles.page, { height: pageHeight }]}>
                <View style={[styles.contentContainer, isDesktop ? styles.bookLayout : styles.singleColumn]}>
                    <View style={[styles.pageSection, styles.pageShadow]}>
                        <RenderHTML
                            contentWidth={isDesktop ? width / 2 - 80 : width - 40}
                            source={{ html: firstHalf }}
                            WebView={WebView}
                            customHTMLElementModels={{ iframe: iframeModel }}
                            renderers={{ img: CustomImageRenderer }}
                            defaultTextProps={{ selectable: true }}
                            baseStyle={styles.baseText}
                        />
                    </View>
                    {isDesktop && (
                        <View style={[styles.pageSection, styles.pageShadow]}>
                            <RenderHTML
                                contentWidth={width / 2 - 80}
                                source={{ html: secondHalf }}
                                WebView={WebView}
                                customHTMLElementModels={{ iframe: iframeModel }}
                                renderers={{ img: CustomImageRenderer }}
                                defaultTextProps={{ selectable: true }}
                                baseStyle={styles.baseText}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
            <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressBar, { width: animatedScroll.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <Text style={styles.pageText}>Прочитано {scrollPercent}%</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: '100%',
        marginVertical: 20,
        borderRadius: 10,
        padding: 20,
        borderWidth: 3,
        borderColor: '#A89C94', // Мягкий серо-коричневый тон
        backgroundColor: '#F5F2EB', // Более спокойный кремовый цвет
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 4, height: 4 },
        backgroundImage: 'url("/mnt/data/A_travel_journal_page_with_a_vintage,_worn_look._T.png")', // Путь к картинке
        backgroundSize: 'cover', // Текстура будет покрывать весь фон
        backgroundPosition: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: 'DancingScript',
        textAlign: 'center',
        color: '#3B2C24',
        marginBottom: 10,
    },
    stamp: {
        width: 80,
        height: 80,
        position: 'absolute',
        right: 20,
        top: 10,
        opacity: 0.5, // Делаем более приглушённым, чтобы выглядел как оттиск
    },
    contentContainer: {
        justifyContent: 'center',
    },
    bookLayout: {
        flexDirection: 'row',
        gap: 20,
    },
    singleColumn: {
        flexDirection: 'column',
    },
    pageSection: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#EEE9E1', // Фон страниц как старая бумага
        borderWidth: 2,
        borderColor: '#A89C94',
        borderRadius: 8,
    },
    pageShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 4, height: 4 },
    },
    progressContainer: {
        height: 5,
        backgroundColor: '#C2B8A3', // Мягкий серо-бежевый цвет
        borderRadius: 5,
        marginTop: 10,
    },
    progressBar: {
        height: 5,
        backgroundColor: '#6B5A50', // Темно-коричневый, чтобы выделялся
        borderRadius: 5,
    },
    pageText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 5,
        fontFamily: 'Courier',
        color: '#5A4232',
    }
});

export default TravelDescription;
