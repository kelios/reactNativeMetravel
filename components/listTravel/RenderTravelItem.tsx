import React, { memo, useMemo } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import TravelListItem from './TravelListItem';

function RenderTravelItem({
                              item,
                              isSuperuser,
                              isMetravel,
                              onDeletePress,
                              onEditPress,
                              isFirst,
                              isSingle = false,
                          }: any) {
    /* ⬇︎ если FlatList прислал placeholder — ничего не рендерим */
    if (!item) return null;

    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const container = useMemo(() => {
        const base: any = { borderRadius: 12, overflow: 'hidden', marginBottom: 16 };
        if (isSingle)  return { ...base, width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 16 };
        if (isMobile)  return { ...base, width: '100%' };
        const w = isTablet ? '48%' : '31%';
        return { ...base, flex: 1, flexBasis: w, maxWidth: w };
    }, [isMobile, isTablet, isSingle]);

    return (
        <View style={container}>
            <TravelListItem
                travel={item}
                isSuperuser={isSuperuser}
                isMetravel={isMetravel}
                onDeletePress={onDeletePress}
                onEditPress={onEditPress}
                isFirst={isFirst}
                isSingle={isSingle}
            />
        </View>
    );
}

export default memo(RenderTravelItem);
