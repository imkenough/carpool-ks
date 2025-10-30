import { View } from "react-native";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import React from "react";

export const RideCardSkeleton = React.memo(() => (
  <Card className="my-1.5 w-full max-w-sm">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <View className="flex flex-row items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="ml-2 h-4 w-1/2" />
      </View>
      <View className="mt-2 flex flex-row items-center">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="ml-2 h-4 w-1/2" />
      </View>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
));