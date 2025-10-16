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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <Card className="w-full max-w-sm" id={props.id}>
      <CardHeader className="flex-row">
        <View className="flex-1 gap-1.5">
          <CardTitle>Destination : {props.destination}</CardTitle>
          <CardDescription>from : {props.from}</CardDescription>
        </View>
      </CardHeader>
      <CardContent>
        <View className="w-full justify-center gap-4">
          <Text>Time: {props.date.toString()}</Text>
        </View>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">
          <Text>Join</Text>
        </Button>
      </CardFooter>
    </Card>
  );
};
