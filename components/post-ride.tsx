import { Text } from '@/components/ui/text';
import React from "react";
import { View } from "react-native";
import { Loader2 } from 'lucide-react-native';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const PostRideUi = React.memo(
    ({
        travelDirection,
        location,
        traveldate,
        postRide,
        isPending,
    }: {
        travelDirection?: string;
        location?: string;
        traveldate: Date;
        postRide: (data: any) => void;
        isPending: boolean;
    }) => {
        // Check if we have the necessary data to post a ride
        const canPost = !!travelDirection && !!location && !!traveldate;

        // Memoize formatted strings to avoid recalculating on every render
        const formattedDate = React.useMemo(() => traveldate.toLocaleDateString(), [traveldate]);
        const formatedTime = React.useMemo(
            () =>
                traveldate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            [traveldate]
        );

        const handlePress = () => {
            postRide({
                name: 'haaaa', // TODO: Replace hardcoded name with actual user name from auth
                destination: travelDirection,
                from: location,
                date: traveldate,
            });
        };

        return (
            <View
                className="
                my-2.5 rounded-2xl border p-4 backdrop-blur-xl 
                bg-white/85 border-black/40 
                dark:bg-black/85 dark:border-white/40 "  >
                    
                <Text className="mb-4 mt-4" variant="h4">
                    Can't find a ride? Post a ride yourself
                </Text>

                {!canPost && (
                    <Text className="mb-4" variant="destructive">
                        {' '}
                        Find rides in home to post a rides{' '}
                    </Text>
                )}
                {/* Alert Box */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button disabled={!canPost || isPending}>
                            {isPending ? (
                                <Loader2 className="animate-spin text-foreground" />
                            ) : (
                                <Text>Post Ride</Text>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Do you want to post this ride?</AlertDialogTitle>
                            <AlertDialogDescription>
                                We will be posting a ride from {location} to {travelDirection} on {formattedDate} at{' '}
                                {formatedTime}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                <Text>Cancel</Text>
                            </AlertDialogCancel>
                            <AlertDialogAction onPress={handlePress}>
                                <Text>Continue</Text>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <View className="h-[20px]" />
            </View>
        );
    }
);

export default PostRideUi