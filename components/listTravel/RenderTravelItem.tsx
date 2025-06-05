import React, { memo, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import TravelListItem from './TravelListItem';

const RenderTravelItem = ({
                              item,
                              isSuperuser,
                              isMetravel,
                              userId,
                              onEditPress,
                              onDeletePress,
                              isFirst,
                              isSingle = false, // ✅ новый проп
                          }) => {
    const { width } = useWindowDimensions();

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const containerStyle = useMemo(() => {
        const baseStyle = {
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 16,
        };

        if (isSingle) {
            return {
                ...baseStyle,
                width: '100%',
                maxWidth: 600,
                alignSelf: 'center',
                paddingHorizontal: 16,
            };
        }

        if (isMobile) {
            return {
                ...baseStyle,
                width: '100%',
            };
        }

        const cardWidth = isTablet ? '48%' : '31%';
        return {
            ...baseStyle,
            flex: 1,
            flexBasis: cardWidth,
            maxWidth: cardWidth,
        };
    }, [isMobile, isTablet, isSingle]);

    const travelListItemProps = useMemo(() => ({
        travel: item,
        currentUserId: userId,
        isSuperuser,
        isMetravel,
        isMobile,
        onEditPress,
        onDeletePress,
        isFirst,
        isSingle, // ✅ передаём в TravelListItem
    }), [item, userId, isSuperuser, isMetravel, isMobile, onEditPress, onDeletePress, isFirst, isSingle]);

    return (
        <View style={containerStyle}>
            <TravelListItem {...travelListItemProps} />
        </View>
    );
};

const areEqual = (prev, next) => {
    return (
        prev.item.id === next.item.id &&
        prev.isSuperuser === next.isSuperuser &&
        prev.isMetravel === next.isMetravel &&
        prev.userId === next.userId &&
        prev.onEditPress === next.onEditPress &&
        prev.onDeletePress === next.onDeletePress &&
        prev.isFirst === next.isFirst &&
        prev.isSingle === next.isSingle // ✅ мемоизируем по новому пропу
    );
};

export default memo(RenderTravelItem, areEqual);
