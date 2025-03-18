import React, { useState, useCallback, useMemo } from 'react';
import { Platform, View, ScrollView, useWindowDimensions, StyleSheet, Text } from 'react-native';
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
    const breakPoint = html.indexOf('</p>', midpoint) + 4 || midpoint;
    return [html.slice(0, breakPoint), html.slice(breakPoint)];
};

const TravelDescription: React.FC<TravelDescriptionProps> = ({ htmlContent, title }) => {
    const { width, height } = useWindowDimensions();
    const pageHeight = useMemo(() => height * 0.75, [height]);
    const isDesktop = width > 1024;
    const [firstHalf, secondHalf] = useMemo(() => splitContent(htmlContent), [htmlContent]);

    const [scrollPercent, setScrollPercent] = useState(0);

    const handleScroll = useCallback((event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const visibleHeight = layoutMeasurement.height;
        const totalHeight = contentSize.height - visibleHeight;
        const currentOffset = contentOffset.y;

        const percent = totalHeight > 0 ? (currentOffset / totalHeight) * 100 : 0;
        setScrollPercent(Math.min(Math.max(percent, 0), 100));
    }, []);

    return (
        <View style={[styles.container, { height: pageHeight + 60 }]}>
            <Text style={styles.title}>{title}</Text>
            <ScrollView
                showsVerticalScrollIndicator={true}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={[styles.page, { height: pageHeight }]}
            >
                <View style={[styles.contentContainer, isDesktop && styles.bookLayout]}>
                    <View style={[styles.pageLeft, styles.pageShadow]}>
                        <RenderHTML
                            contentWidth={width / 2 - 80}
                            source={{ html: firstHalf }}
                            WebView={WebView}
                            customHTMLElementModels={{ iframe: iframeModel }}
                            renderers={{ img: CustomImageRenderer }}
                            defaultTextProps={{ selectable: true }}
                            baseStyle={styles.baseText}
                            tagsStyles={styles.tagStyles}
                        />
                    </View>
                    <View style={[styles.pageRight, styles.pageShadow]}>
                        <RenderHTML
                            contentWidth={width / 2 - 80}
                            source={{ html: secondHalf }}
                            WebView={WebView}
                            customHTMLElementModels={{ iframe: iframeModel }}
                            renderers={{ img: CustomImageRenderer }}
                            defaultTextProps={{ selectable: true }}
                            baseStyle={styles.baseText}
                            tagsStyles={styles.tagStyles}
                        />
                    </View>
                </View>
            </ScrollView>
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${scrollPercent}%` }]} />
            </View>
            <Text style={styles.pageText}>
                Прочитано {scrollPercent.toFixed(0)}%
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: '100%',
        marginVertical: 20,
        backgroundColor: '#F3EACF',
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        padding: 10,
        borderWidth: 1,
        borderColor: '#D6C5A1',
    },
    page: {
        backgroundColor: '#FCF8E8',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: 28,
        color: '#4E3B31',
        fontWeight: 'bold',
        fontFamily: 'Georgia',
        paddingVertical: 10,
        borderBottomWidth: 3,
        borderColor: '#D6C5A1',
        marginBottom: 20,
        textAlign: 'center',
    },
    progressContainer: {
        height: 6,
        width: '90%',
        backgroundColor: '#E0DCD3',
        borderRadius: 3,
        marginTop: 10,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#8B5E3C',
    },
    pageText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#5A4238',
        marginTop: 8,
        fontFamily: 'Georgia',
    },
    baseText: {
        fontFamily: 'Georgia',
        fontSize: 18,
        lineHeight: 28,
        color: '#4E3B31',
        textAlign: 'justify',
    },
    contentContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    bookLayout: {
        flexDirection: 'row',
        backgroundColor: '#FDFBF1',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
    },
    pageLeft: {
        flex: 1,
        paddingRight: 20,
        borderRightWidth: 3,
        borderRightColor: '#C2A68E',
    },
    pageRight: {
        flex: 1,
        paddingLeft: 20,
    },
    pageShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 6, height: 6 },
        backgroundColor: '#FDFBF1',
        borderRadius: 10,
    },
});

export default TravelDescription;