import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react-native';
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
import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useRouter, Link } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import loginStore from '@/utils/states/login-zus';
import { performLogout } from '@/utils/local-storage/islogin';

export default function ProfileScreen() {
  // --- State ---
  const [userId, setUserId] = useState<string | null>(null); // Added to store user ID
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postedRides, setPostedRides] = useState<any[]>([]); // Consider creating a 'Ride' type

  // --- Hooks ---
  const { logout } = loginStore();
  const router = useRouter();

  // --- Data Fetching Functions ---

  /**
   * Fetches the user's profile data (name, photo, phone) from Supabase.
   * Includes fallback logic for the username.
   */
  const fetchProfile = useCallback(async (id: string, email?: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, phone_number')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    }

    // Set profile data or fallbacks
    if (profile) {
      setUserName(profile.full_name);
      setUserPhoto(profile.avatar_url);
      setFullName(profile.full_name || '');
      setPhoneNumber(profile.phone_number || '');
    } else if (email) {
      setUserName(email.split('@')[0]); // Fallback to email prefix
      setFullName('');
      setPhoneNumber('');
    } else {
      setUserName('User'); // Final fallback
      setFullName('');
      setPhoneNumber('');
    }
  }, []); // Empty dependency array, this function is stable

  /**
   * Fetches all rides posted by the given user ID.
   */
  const fetchPostedRides = useCallback(async (id: string) => {
    const { data, error } = await supabase.from('rides').select('*').eq('user_id', id);

    if (error) {
      console.error('Error fetching posted rides:', error);
    } else {
      setPostedRides(data);
    }
  }, []); // Empty dependency array, this function is stable

  // --- Effect for Initial Data Load ---

  useEffect(() => {
    /**
     * Gets the current user and then fetches their profile and rides.
     */
    const loadUserData = async () => {
      // 1. Get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Error getting user or no user found:', authError);
        // Optional: you could trigger a logout/redirect here if no user is found
        return;
      }

      // 2. Set the user ID
      setUserId(user.id);

      // 3. Fetch profile and rides in parallel
      await Promise.all([fetchProfile(user.id, user.email), fetchPostedRides(user.id)]);
    };

    loadUserData();
  }, [fetchProfile, fetchPostedRides]); // Dependencies are stable callbacks

  // --- Event Handlers ---

  const handleDeleteRide = useCallback(
    async (rideId: number) => {
      if (!userId) return; // Guard clause

      const { error } = await supabase.from('rides').delete().eq('id', rideId);
      if (error) {
        console.error('Error deleting ride:', error);
      } else {
        // Refetch rides list to update UI
        fetchPostedRides(userId);
        // Alternative (faster): optimistic update
        // setPostedRides((prevRides) => prevRides.filter((ride) => ride.id !== rideId));
      }
    },
    [userId, fetchPostedRides]
  );

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    logout(); // Update Zustand state
    await performLogout(); // Update local storage
    router.replace('/auth/sign-in'); // Redirect to login
  }, [logout, router]);

  const handleSaveChanges = useCallback(async () => {
    if (!userId) return; // Guard clause

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone_number: phoneNumber })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      console.log('Profile updated successfully!');
      // Optimistic update: Set state locally for a faster UI response
      setUserName(fullName);
      setPhoneNumber(phoneNumber);
      setIsDialogOpen(false); // Close the dialog
      // No need to refetch, UI is now in sync
    }
  }, [userId, fullName, phoneNumber]);

  // --- Render ---

  return (
    <View className="flex-1 p-4">
      {/* --- Profile Header --- */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold">Hi {userName || 'User'}, </Text>
        <Avatar alt="https://github.com/shadcn.png">
          <AvatarImage source={{ uri: userPhoto || 'https://github.com/shadcn.png' }} />
          <AvatarFallback>
            <Text>{userName ? userName.charAt(0).toUpperCase() : 'U'}</Text>
          </AvatarFallback>
        </Avatar>
      </View>

      {/* --- Phone Number --- */}
      {phoneNumber && (
        <View className="mb-4">
          <Text variant={'muted'} className="text-xl font-semibold">
            {phoneNumber}
          </Text>
        </View>
      )}

      {/* --- Ride Requests --- */}
      <View className="mb-8">
        <Text className="mb-2 text-xl font-semibold">My Ride Requests</Text>
        {/* Placeholder for ride requests */}
        <Text>You have not sent any ride requests yet.</Text>
      </View>

      {/* --- Posted Rides --- */}
      <View>
        <Text className="mb-2 text-xl font-semibold">My Posted Rides</Text>

        {postedRides.length > 0 ? (
          postedRides.map((ride) => (
            <Card key={ride.id} className="my-1 flex-row items-center justify-between p-2">
              <Link href={`/rides?rideId=${ride.id}`} asChild>
                <Text variant={'destructive'}>
                  {ride.from} to {ride.destination}
                </Text>
              </Link>
              <Button variant="destructive" size="sm" onPress={() => handleDeleteRide(ride.id)}>
                <Icon as={Trash2} size={16} color="white" />
              </Button>
            </Card>
          ))
        ) : (
          <Text>You have not posted any rides yet.</Text>
        )}
      </View>

      {/* --- Footer Buttons (Edit & Logout) --- */}
      <View className="mt-auto flex-col gap-2">
        {/* --- Edit Profile Dialog --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
        <Button variant="destructive" onPress={handleLogout}>
          <Text>Logout</Text>
        </Button>
      </View>
    </View>
  );
}
