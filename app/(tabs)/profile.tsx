import { View } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, Link } from 'expo-router';
import { Trash2 } from 'lucide-react-native';

// --- UI Components ---
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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

import { Skeleton } from '@/components/ui/skeleton';
import { MyPostedRideSkeleton } from '@/components/my-posted-ride-skeleton';

// --- Utils & Hooks ---
import { supabase } from '@/utils/supabase';
import loginStore from '@/utils/states/login-zus';
import { performLogout } from '@/utils/local-storage/islogin';
import { useUpdateUserProfile, useUserProfile } from '@/utils/query/fetch-update-profiles';
import { usedeleteRide, useRidesByUserId } from '@/utils/query/fetch-post-rides';
import { AlertBox } from '@/components/my-alert';
import { CardParams } from '@/components/mycard';

export default function ProfileScreen() {
  // --- State ---
  // State for the edit profile form
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- Hooks ---
  const { logout } = loginStore();
  const router = useRouter();

  //fuction
  const convertDate = (date: string) => {
    const my_date = new Date(date + 'Z');
    return my_date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Data fetching with React Query
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const userId = profile?.id; // Get user ID from the profile data

  const { data: usersRides, isLoading: areRidesLoading } = useRidesByUserId(userId, {
    enabled: !!userId, // Only run this query after we have a userId
  });

  // Mutations
  const { mutate: deleteRides } = usedeleteRide();
  const { mutate: saveUserInfo } = useUpdateUserProfile();

  // --- Event Handlers ---

  const handleDeleteRide = (rideId: string) => {
    deleteRides(rideId);
  };

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    logout(); // Update Zustand state
    await performLogout(); // Update local storage
    router.replace('/auth/sign-in'); // Redirect to login
  }, [logout, router]);

  const handleSaveChanges = useCallback(async () => {
    if (!userId) {
      console.error('No user ID found to save changes');
      return;
    }

    saveUserInfo(
      { fullName, phoneNumber, userId },
      {
        onSuccess: () => {
          console.log('Profile updated successfully!');
          setIsDialogOpen(false); // Close the dialog on success
          // React Query will automatically refetch 'useUserProfile'
          // if you configured it to invalidate queries on success.
        },
        onError: (error) => {
          console.error('Error updating profile:', error);
        },
      }
    );
  }, [userId, fullName, phoneNumber, saveUserInfo]);

  // Syncs form state when the dialog is opened
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Pre-fill form with current profile data
      setFullName(profile?.full_name || '');
      setPhoneNumber(profile?.phone_number || '');
    }
    setIsDialogOpen(open);
  };

  // --- Render ---

  // Derive display values from the single source of truth (profile)
  const displayName = profile?.full_name || 'User';
  const displayPhoto = profile?.avatar_url || 'https://github.com/shadcn.png';
  const displayPhone = profile?.phone_number;

  return (
    <View className="flex-1 p-4">
      {/* --- Profile Header --- */}
      {isProfileLoading ? (
        <View className="mb-4 flex-row items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </View>
      ) : (
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-2xl font-bold">Hi {displayName}, </Text>
          <Avatar alt={displayName}>
            <AvatarImage source={{ uri: displayPhoto }} />
            <AvatarFallback>
              <Text>{displayName.charAt(0).toUpperCase()}</Text>
            </AvatarFallback>
          </Avatar>
        </View>
      )}

      {/* --- Phone Number --- */}
      {isProfileLoading ? (
        <Skeleton className="mb-4 h-6 w-32" />
      ) : (
        displayPhone && (
          <View className="mb-4">
            <Text variant={'muted'} className="text-xl font-semibold">
              {displayPhone}
            </Text>
          </View>
        )
      )}

      {/* --- Posted Rides --- */}
      <View>
        <Text className="mb-2 text-xl font-semibold">My Posted Rides</Text>

        {areRidesLoading ? (
          <>
            <MyPostedRideSkeleton />
            <MyPostedRideSkeleton />
            <MyPostedRideSkeleton />
          </>
        ) : (usersRides?.length || 0) > 0 ? (
          (usersRides as CardParams[]).map((ride) => (
            <Card key={ride.id} className="my-1 flex-row items-center justify-between p-2">
              <View className="flex-row items-center">
                <Link href={`/rides?rideId=${ride.id}`} asChild>
                  <Text variant={'link'}>
                    {ride.from} to {ride.destination}
                  </Text>
                </Link>
                <Text variant={'muted'} className="ml-2 opacity-60">
                  {convertDate(ride.date)}
                </Text>
              </View>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Icon as={Trash2} size={16} color="white" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your ride.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onPress={() => handleDeleteRide(ride.id)}
                      variant="destructive">
                      <Text>Continue</Text>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          ))
        ) : (
          <Text>You have not posted any rides yet.</Text>
        )}
      </View>

      {/* --- Footer Buttons (Edit & Logout) --- */}
      <View className="mt-auto flex-col gap-2">
        {/* --- Edit Profile Dialog --- */}
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Text>Edit Profile</Text>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                <Text>Edit profile</Text>
              </DialogTitle>
              <DialogDescription>
                <Text>Make changes to your profile here. Click save when you're done.</Text>
              </DialogDescription>
            </DialogHeader>

            {/* --- Edit Form --- */}
            <View className="gap-4 py-4">
              <Label htmlFor="fullName">
                <Text>Full Name</Text>
              </Label>
              <Input
                returnKeyType="send"
                keyboardType="default"
                placeholder="Name"
                autoCapitalize="words"
                value={fullName}
                onChangeText={setFullName}
              />
              <Label htmlFor="phoneNumber">
                <Text>Phone Number</Text>
              </Label>
              <Input
                returnKeyType="send"
                keyboardType="numeric"
                placeholder="Phone Number"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {/* --- Dialog Footer --- */}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  <Text>Cancel</Text>
                </Button>
              </DialogClose>
              <Button
                // Basic validation
                disabled={phoneNumber.length !== 10 || fullName.length < 3}
                onPress={handleSaveChanges}>
                <Text>Save changes</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* --- Logout Button --- */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Text>Logout</Text>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be returned to the login screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={handleLogout} variant="destructive">
                <Text>Logout</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </View>
  );
}
