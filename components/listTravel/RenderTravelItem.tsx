import React, { memo, useMemo } from 'react';
import { View, useWindowDimensions } from 'react-native';
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
    if (!item) return null;

    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const containerStyle = useMemo(() => {
        const base = {
            borderRadius: 12,
            overflow: 'hidden' as const,
            marginBottom: 16,
        };

        if (isSingle)
            return {
                ...base,
                width: '100%',
                maxWidth: 600,
                alignSelf: 'center' as const,
                paddingHorizontal: 16,
            };

        if (isMobile)
            return {
                ...base,
                width: '100%',
            };

        return {
            ...base,
            flex: 1,
            flexBasis: isTablet ? '48%' : '31%',
            maxWidth: isTablet ? '48%' : '31%',
        };
    }, [isMobile, isTablet, isSingle]);

    return (
        <View style={containerStyle}>
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
