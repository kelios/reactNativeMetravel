// src/components/listTravel/RenderTravelItem.tsx
import React, { memo, useMemo } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import TravelListItem from "./TravelListItem";

type RenderTravelItemProps = {
    item: any;
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
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    /**
     * ВАЖНО для Android:
     * overflow: 'hidden' вместе с borderRadius нередко даёт чёрные прямоугольники/мигание
     * на Image/GL поверхностях. Поэтому скрытие переполнения — только на iOS/Web.
     */
    const containerStyle = useMemo(() => {
        const base = {
            borderRadius: 12,
            // скрываем переполнение только не на Android
            overflow: Platform.OS === "android" ? ("visible" as const) : ("hidden" as const),
            marginBottom: isMobile ? 12 : 16, // компактнее на мобиле
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
            // Более предсказуемая сетка на планшете/десктопе
            flexBasis: isTablet ? "48%" : "31%",
            maxWidth: isTablet ? "48%" : "31%",
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
                isFirst={!!isFirst}
                isSingle={!!isSingle}
                selectable={!!selectable}
                isSelected={!!isSelected}
                onToggle={onToggle}
            />
        </View>
    );
}

/**
 * Кастомный компаратор: предотвращаем лишние перерисовки карточек
 * при скролле/изменении соседних элементов.
 */
function areEqual(prev: RenderTravelItemProps, next: RenderTravelItemProps) {
    // если id не менялся — считаем, что это та же сущность
    const sameId = prev.item?.id === next.item?.id;

    // менялись ли флаги/режимы, влияющие на рендер
    const sameFlags =
        prev.isSuperuser === next.isSuperuser &&
        prev.isMetravel === next.isMetravel &&
        prev.isFirst === next.isFirst &&
        prev.isSingle === next.isSingle &&
        prev.selectable === next.selectable &&
        prev.isSelected === next.isSelected;

    // ссылки на хэндлеры в родителе стабильны (useCallback),
    // но на всякий: не триггерим из-за новых ссылок.
    return sameId && sameFlags;
}

export default memo(RenderTravelItem, areEqual);
