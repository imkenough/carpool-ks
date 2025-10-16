import React from 'react';
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
import { View } from 'react-native';

export interface CardParams {
  id: string;
  name: string;
  destination: string;
  date: Date;
  from: string;
}

export const MyCard: React.FC<CardParams> = (props) => {
  return (
    <Card className="my-1.5 w-full max-w-sm" id={props.id}>
      <CardHeader>
        <CardTitle>
          {props.from} to {props.destination}
        </CardTitle>
        <CardDescription>Posted by {props.name}</CardDescription>
      </CardHeader>
      <CardContent className="">
        <View className="flex flex-row items-center">
          <Text className="font-bold">Date: </Text>
          <Text className="">{props.date.toLocaleDateString()}</Text>
        </View>
        <View className="flex flex-row items-center">
          <Text className="font-bold">Time: </Text>
          <Text className="">{props.date.toLocaleTimeString()}</Text>
        </View>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Text>Join Ride</Text>
        </Button>
      </CardFooter>
    </Card>
  );
};
