import React, { memo } from 'react';
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
                          }) => (
    <View style={[styles.cardContainer, cardStyles]}>
        <TravelListItem
            travel={item}
            currentUserId={userId}
            isSuperuser={isSuperuser}
            isMetravel={isMetravel}
            isMobile={isMobile}
            onEditPress={onEditPress}
            onDeletePress={onDeletePress}
        />
    </View>
);

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
});

export default memo(RenderTravelItem);
