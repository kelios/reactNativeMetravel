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

const TravelDescription: React.FC<TravelDescriptionProps> = ({ htmlContent, title }) => {
    const { width, height } = useWindowDimensions();
    const pageHeight = useMemo(() => height * 0.7, [height]);

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
                <RenderHTML
                    contentWidth={width - 80}
                    source={{ html: htmlContent }}
                    WebView={WebView}
                    customHTMLElementModels={{ iframe: iframeModel }}
                    renderers={{ img: CustomImageRenderer }}
                    defaultTextProps={{ selectable: true }}
                    baseStyle={styles.baseText}
                    tagsStyles={styles.tagStyles}
                />
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
        width: '90%',
        marginVertical: 20,
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
        padding: 10,
    },
    page: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: 26,
        color: '#5A4238',
        fontWeight: 'bold',
        fontFamily: 'Georgia',
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderColor: '#F0E6DE',
        marginBottom: 15,
        alignSelf: 'center',
    },
    progressContainer: {
        height: 4,
        width: '90%',
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        marginTop: 10,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#6B4F4F',
    },
    pageText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#777',
        marginTop: 5,
        fontFamily: 'Georgia',
    },
    baseText: {
        fontFamily: 'Georgia',
        fontSize: 16,
        lineHeight: 24,
        color: '#444',
        textAlign: 'justify',
    },
    tagStyles: {
        h1: { fontSize: 24, marginVertical: 10, fontWeight: 'bold', color: '#222' },
        h2: { fontSize: 20, marginVertical: 8, fontWeight: 'bold', color: '#333' },
        p: { marginVertical: 6 },
        a: { color: '#007aff', textDecorationLine: 'underline' },
    },
});

export default TravelDescription;
