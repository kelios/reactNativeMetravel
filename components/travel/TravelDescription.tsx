import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Platform, View, ScrollView, useWindowDimensions, StyleSheet, Text, Animated, useColorScheme } from 'react-native';
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
    const scheme = useColorScheme();
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
        <View style={[
            styles.container,
            { height: pageHeight + 80, backgroundColor: scheme === 'dark' ? '#2C2C2C' : '#F7F3ED' }
        ]}>
            <Text style={[styles.title, { color: scheme === 'dark' ? '#E6D6C5' : '#3B2C24' }]}>{title}</Text>
            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={[styles.page, { height: pageHeight }]}
            >
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
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        padding: 15,
    },
    page: {
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        fontFamily: 'Merriweather',
        paddingVertical: 10,
        textAlign: 'center',
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
    },
    pageShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 6, height: 6 },
        backgroundColor: '#FDFBF1',
        borderRadius: 10,
    },
    progressContainer: {
        height: 5,
        backgroundColor: '#D6C5A1',
        borderRadius: 5,
        marginTop: 10,
    },
    progressBar: {
        height: 5,
        backgroundColor: '#4E3B31',
        borderRadius: 5,
    },
    pageText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        marginTop: 5,
    }
});

export default TravelDescription;
