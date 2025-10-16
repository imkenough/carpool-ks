import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useDate } from '@/lib/date-context';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import DatePicker from 'react-native-date-picker';
import { CardParams, MyCard } from '@/components/mycard';
import { FlatList } from 'react-native';

export default function RidesScreen() {
  // ✅ Get params safely
  const { travelDirection, location } = useLocalSearchParams() as {
    travelDirection: string;
    location: string;
  };

  // ✅ Get date context
  const { date } = useDate();

  // ✅ Example array of cards (now defined AFTER variables exist)
  const cardData: CardParams[] = [
    {
      id: '1',
      name: 'kenny',
      destination: travelDirection,
      date: date,
      from: location,
    },
    {
      id: '2',
      name: 'kenny',
      destination: travelDirection,
      date: date,
      from: location,
    },
    {
      id: '3',
      name: 'kenny',
      destination: travelDirection,
      date: date,
      from: location,
    },
    {
      id: '4',
      name: 'kenny',
      destination: travelDirection,
      date: date,
      from: location,
    },
  ];

  // ✅ Return JSX
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
      }}>
      <FlatList
        data={cardData}
        renderItem={({ item }) => {
          return (
            <MyCard
              id={item.id}
              name={item.name}
              destination={item.destination}
              date={item.date}
              from={item.from}
            />
          );
        }}
      />
    </View>
  );
}
