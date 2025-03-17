import React, { useState } from 'react';
import { View, ScrollView, useWindowDimensions, StyleSheet, Text } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import CustomImageRenderer from '@/components/CustomImageRenderer';
import { iframeModel } from '@native-html/iframe-plugin';

interface TravelDescriptionProps {
    htmlContent: string;
    title: string
}

const TravelDescription: React.FC<TravelDescriptionProps> = ({ htmlContent,title }) => {
    const { width, height } = useWindowDimensions();
    const pageHeight = height * 0.7;
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setCurrentPage(Math.floor(offsetY / pageHeight));
    };

    const handleContentSizeChange = (_: number, contentHeight: number) => {
        setTotalPages(Math.ceil(contentHeight / pageHeight));
    };

    const progressPercent = ((currentPage + 1) / totalPages) * 100;

    return (
        <View style={[styles.container, { height: pageHeight + 60 }]}>
            <Text style={styles.title}>{title}</Text>
            <ScrollView
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onContentSizeChange={(_, contentHeight) => setTotalPages(Math.ceil(contentHeight / pageHeight))}
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
                <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.pageText}>
                Страница {currentPage + 1} из {totalPages}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: '90%',
        marginVertical: 20,
        backgroundColor: '#FAFAFA', // Легкий сероватый фон, внешний контейнер
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
        height: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#444',
        marginBottom: 15,
        fontFamily: 'Georgia',
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
    title: {
        fontSize: 26,
        color: '#5A4238',
        fontWeight: 'bold',
        fontFamily: 'Georgia',
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderColor: '#F0E6DE',
        marginBottom: 15,
    },
});

export default TravelDescription;
