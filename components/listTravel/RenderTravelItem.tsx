import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import TravelListItem from './TravelListItem';

const RenderTravelItem = ({
                              item,
                              isMobile,
                              isSuperuser,
                              isMetravel,
                              userId,
                              onEditPress,
                              onDeletePress,
                              cardStyles,
                              isFirst,
                          }) => {
    // Мемоизированная композиция стилей: базовый + переданный снаружи
    const containerStyle = useMemo(() => [styles.cardContainer, cardStyles], [cardStyles]);

    return (
        <View style={containerStyle}>
            <TravelListItem
                travel={item}
                currentUserId={userId}
                isSuperuser={isSuperuser}
                isMetravel={isMetravel}
                isMobile={isMobile}
                onEditPress={onEditPress}
                onDeletePress={onDeletePress}
                isFirst={isFirst}
            />
        </View>
    );
};

export default memo(RenderTravelItem, (prev, next) =>
    prev.item.id === next.item.id &&
    prev.isMobile === next.isMobile &&
    prev.isSuperuser === next.isSuperuser &&
    prev.isMetravel === next.isMetravel &&
    prev.userId === next.userId &&
    prev.cardStyles === next.cardStyles &&
    prev.isFirst === next.isFirst,
);

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
});
