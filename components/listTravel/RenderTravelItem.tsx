// src/components/listTravel/RenderTravelItem.tsx
import React, { memo, useMemo } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import TravelListItem from "./TravelListItem";

type RenderTravelItemProps = {
    item: any;
    isMobile?: boolean;
    isSuperuser?: boolean;
    isMetravel?: boolean;
    onDeletePress?: (id: number) => void;
    onEditPress?: (args: any) => void;
    isFirst?: boolean;
    isSingle?: boolean;
    selectable?: boolean;
    isSelected?: boolean;
    onToggle?: () => void;
};

function RenderTravelItem({
                              item,
                              isMobile = false,
                              isSuperuser,
                              isMetravel,
                              onDeletePress,
                              onEditPress,
                              isFirst,
                              isSingle = false,
                              selectable = false,
                              isSelected = false,
                              onToggle,
                          }: RenderTravelItemProps) {
    if (!item) return null;

    const { width } = useWindowDimensions();
    const isTablet = width >= 768 && width < 1024;

    const containerStyle = useMemo(() => {
        const base = {
            borderRadius: 12,
            overflow: Platform.OS === "android" ? ("visible" as const) : ("hidden" as const),
            marginBottom: isMobile ? 12 : 16,
        };

        if (isSingle) {
            return {
                ...base,
                width: "100%",
                maxWidth: 600,
                alignSelf: "center" as const,
                paddingHorizontal: isMobile ? 8 : 16,
            };
        }

        if (isMobile) {
            return {
                ...base,
                width: "100%",
            };
        }

        return {
            ...base,
            flex: 1,
            flexBasis: isTablet ? "48%" : "31%",
            maxWidth: isTablet ? "48%" : "31%",
        };
    }, [isMobile, isTablet, isSingle]);

    return (
        <View style={containerStyle}>
            <TravelListItem
                travel={item}
                isMobile={isMobile}
                isSuperuser={isSuperuser}
                isMetravel={isMetravel}
                onDeletePress={onDeletePress}
                onEditPress={onEditPress}
                isFirst={!!isFirst}
                isSingle={!!isSingle}
                selectable={!!selectable}
                isSelected={!!isSelected}
                onToggle={onToggle}
            />
        </View>
    );
}

function areEqual(prev: RenderTravelItemProps, next: RenderTravelItemProps) {
    const sameId = prev.item?.id === next.item?.id;
    const sameFlags =
        prev.isSuperuser === next.isSuperuser &&
        prev.isMetravel === next.isMetravel &&
        prev.isFirst === next.isFirst &&
        prev.isSingle === next.isSingle &&
        prev.selectable === next.selectable &&
        prev.isSelected === next.isSelected &&
        prev.isMobile === next.isMobile;

    return sameId && sameFlags;
}

export default memo(RenderTravelItem, areEqual);