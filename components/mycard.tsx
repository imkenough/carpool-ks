import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Linking, View } from 'react-native';

export interface CardParams {
  id: string;
  name: string;
  profiles: { phone_number: string };
  destination: string;
  date: Date;
  from: string;
  user_id: string;
  currentUserId: string | null;
}

export const MyCard: React.FC<CardParams> = (props) => {
  const date = new Date(props.date + 'Z');

  const handlePress = async () => {
    const message = encodeURIComponent(
      'Hey! I found your ride on the Carpool app. Is this seat still available?'
    ); //preset msg
    const whatsappUrl = `https://wa.me/+91${props.profiles.phone_number}?text=${message}`;
    console.log(whatsappUrl);
    await Linking.openURL(whatsappUrl);
  };

  return (
    <Card className="relative my-1.5 w-full max-w-sm" id={props.id}>
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <CardTitle>
              {props.from} to {props.destination}
            </CardTitle>
          </View>
          {props.user_id === props.currentUserId && (
            <Badge variant={'secondaryds'}>
              <Text>OP</Text>
            </Badge>
          )}
        </View>
        <CardDescription>Posted by {props.name}</CardDescription>
      </CardHeader>
      <CardContent className="">
        <View className="flex flex-row items-center">
          <Text className="font-bold">Date: </Text>
          <Text className="">{date.toLocaleDateString('en-GB')}</Text>
        </View>
        <View className="flex flex-row items-center">
          <Text className="font-bold">Time: </Text>
          <Text className="">
            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onPress={() => handlePress()}>
          <Text>Join Ride</Text>
        </Button>
      </CardFooter>
    </Card>
  );
};
