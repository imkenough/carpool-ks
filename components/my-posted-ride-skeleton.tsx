import { View } from 'react-native';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import React from 'react';

export const MyPostedRideSkeleton = React.memo(() => (
  <Card className="my-1 flex-row items-center justify-between p-2">
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-5 w-16" />
    <Skeleton className="h-8 w-8" />
  </Card>
));
