import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { Card, Text, Divider } from 'react-native-paper';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { TravelCoords } from '@/src/types/types';

type AddressListItemProps = {
  travel: TravelCoords;
};

const AddressListItem: React.FC<AddressListItemProps> = ({ travel }) => {
  const { address, categoryName, coord, travelImageThumbUrl, urlTravel } = travel;

  return (
      <Card style={styles.container}>
        <Pressable
            onPress={() => Linking.openURL(urlTravel)}
            android_ripple={{ color: '#e0e0e0' }}
            style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
          {travelImageThumbUrl && (
              <Card.Cover
                  source={{ uri: travelImageThumbUrl }}
                  style={styles.image}
              />
          )}
          <Card.Content style={styles.cardContent}>
            <LabelText label="Координаты места:" text={coord} />
            {coord && <Divider style={styles.divider} />}
            <LabelText label="Адрес места:" text={address} />
            {address && <Divider style={styles.divider} />}
            <LabelText label="Категория объекта:" text={categoryName} />
          </Card.Content>
        </Pressable>
      </Card>
  );
};

const LabelText: React.FC<{ label: string; text?: string }> = ({ label, text }) => {
  if (!text) return null; // Не отображаем элемент, если нет текста

  return (
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    elevation: 4,
    padding: wp(2),
    margin: wp(2),
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContent: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  text: {
    color: '#37474f',
    fontSize: 16,
    textAlign: 'left',
    marginVertical: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  labelContainer: {
    marginVertical: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#00796b',
    marginBottom: 4,
  },
  divider: {
    backgroundColor: '#e0e0e0',
    marginVertical: 6,
  },
});

export default AddressListItem;
