import React, {
    useMemo,
    useCallback,
    useRef,
    memo,
    useEffect,
} from 'react';
import {
    FlatList,
    Text,
    View,
    StyleSheet,
    useWindowDimensions,
    Animated,
    Easing,
} from 'react-native';
import AddressListItem from '@/components/MapPage/AddressListItem';
import PaginationComponent from '@/components/PaginationComponent';

export interface Travel {
    id: number | string;
    categoryName?: string;
}

interface Props {
    travelsData: Travel[] | null;
    currentPage: number;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
    onPageChange: (p: number) => void;
    onItemsPerPageChange: (n: number) => void;
    buildRouteTo: (t: Travel) => void;
}

const TravelListPanel: React.FC<Props> = ({
                                              travelsData,
                                              currentPage,
                                              itemsPerPage,
                                              itemsPerPageOptions,
                                              onPageChange,
                                              onItemsPerPageChange,
                                              buildRouteTo,
                                          }) => {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    const styles = useMemo(() => getStyles(isMobile), [isMobile]);

    const isLoading = travelsData === null;
    const totalItems = travelsData?.length ?? 0;

    const paginatedData: Travel[] = useMemo(
        () =>
            travelsData?.slice(
                currentPage * itemsPerPage,
                currentPage * itemsPerPage + itemsPerPage
            ) ?? [],
        [travelsData, currentPage, itemsPerPage]
    );

    const listRef = useRef<FlatList<Travel>>(null);

    useEffect(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [currentPage]);

    const shimmerValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [shimmerValue]);

    const renderSkeleton = useCallback(() => {
        const translateX = shimmerValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-150, 150],
        });
        return (
            <View style={styles.skeletonItem}>
                <Animated.View
                    style={[styles.skeletonShimmer, { transform: [{ translateX }] }]}
                />
            </View>
        );
    }, [styles.skeletonItem, styles.skeletonShimmer, shimmerValue]);

    const renderItem = useCallback(
        ({ item }: { item: Travel }) => (
            <AddressListItem
                travel={item}
                isMobile={isMobile}
                onPress={() => buildRouteTo(item)}
            />
        ),
        [buildRouteTo, isMobile]
    );

    const keyExtractor = useCallback(
        (item: Travel, idx: number) => item.id?.toString() ?? idx.toString(),
        []
    );

    const getItemLayout = useCallback(
        (_: Travel[] | null | undefined, index: number) => ({
            length: 80,
            offset: 80 * index,
            index,
        }),
        []
    );

    return (
        <View style={styles.container}>
            <Text style={styles.resultsCount}>Найдено {totalItems} объектов</Text>

            <FlatList
                ref={listRef}
                data={isLoading ? Array.from({ length: itemsPerPage }) : paginatedData}
                renderItem={isLoading ? renderSkeleton : renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    !isLoading && (
                        <Text style={styles.emptyText}>
                            Ничего не найдено. Попробуйте изменить фильтры.
                        </Text>
                    )
                }
                contentContainerStyle={[
                    styles.flatListContent,
                    { paddingBottom: isMobile ? 140 : 16 },
                ]}
                getItemLayout={getItemLayout}
                removeClippedSubviews
                initialNumToRender={8}
                maxToRenderPerBatch={10}
                windowSize={11}
            />

            {totalItems > 0 && (
                <PaginationComponent
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    itemsPerPageOptions={itemsPerPageOptions}
                    onPageChange={onPageChange}
                    onItemsPerPageChange={onItemsPerPageChange}
                    totalItems={totalItems}
                />
            )}
        </View>
    );
};

const getStyles = (isMobile: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: isMobile ? 4 : 0,
        },
        resultsCount: {
            fontSize: 16,
            fontWeight: '500',
            color: '#333',
            marginBottom: 10,
            paddingHorizontal: 4,
        },
        flatListContent: {
            flexGrow: 1,
        },
        separator: {
            height: 12,
        },
        itemWrapper: {
            paddingHorizontal: 8,
            paddingVertical: 6,
            backgroundColor: '#fff',
            borderRadius: 12,
            elevation: 2,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 3,
        },
        skeletonItem: {
            height: 68,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#e0e0e0',
        },
        skeletonShimmer: {
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: 150,
            backgroundColor: '#f3f3f3',
            opacity: 0.5,
        },
        emptyText: {
            fontSize: 16,
            color: '#888',
            textAlign: 'center',
            marginTop: 40,
        },
    });

export default memo(TravelListPanel);
