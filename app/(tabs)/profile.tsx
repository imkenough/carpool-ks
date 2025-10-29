import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import loginStore from '@/utils/states/login-zus';

export default function ProfileScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { logout, initializeAuth } = loginStore();
  const router = useRouter();

  async function fetchUserName() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, phone_number')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (profile) {
        setUserName(profile.full_name);
        setUserPhoto(profile.avatar_url);
        setFullName(profile.full_name || '');
        setPhoneNumber(profile.phone_number || '');
      } else if (user.email) {
        setUserName(user.email.split('@')[0]);
      } else {
        setUserName('User');
      }
    }
  }

  useEffect(() => {
    fetchUserName();
    initializeAuth()
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
     await logout()
    router.replace('/auth/sign-in');
  };

  const handleSaveChanges = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone_number: phoneNumber })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        console.log('Profile updated successfully!');
        setIsDialogOpen(false); // Close the dialog
        fetchUserName(); // Re-fetch user data to update the profile page
      }
    }
  };

  return (
    <View className="flex-1 p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold">Hi {userName || 'User'}, </Text>
        <Avatar alt={'https://avatar.iran.liara.run/public'}>
          <AvatarImage source={{ uri: userPhoto || 'https://github.com/shadcn.png' }} />
          <AvatarFallback>
            <Text>{userName ? userName.charAt(0).toUpperCase() : 'U'}</Text>
          </AvatarFallback>
        </Avatar>
      </View>

      {phoneNumber && (
        <View className="mb-4">
          <Text variant={'muted'} className="text-xl font-semibold">
            {phoneNumber}
          </Text>
        </View>
      )}

      <View className="mb-8">
        <Text className="mb-2 text-xl font-semibold">My Ride Requests</Text>
        {/* Placeholder for ride requests */}
        <Text>You have not sent any ride requests yet.</Text>
      </View>

      <View>
        <Text className="mb-2 text-xl font-semibold">My Posted Rides</Text>
        {/* Placeholder for posted rides */}
        <Text>You have not posted any rides yet.</Text>
      </View>

      <View className="mt-auto flex-col gap-2">
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
            <View className="gap-4 py-4">
              <Label htmlFor="fullName">
                <Text>Full Name</Text>
              </Label>
              {/* <Input
                id="fullName"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
              /> */}
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
              {/* <Input
                id="phoneNumber"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              /> */}
              <Input
                returnKeyType="send"
                keyboardType="numeric"
                placeholder="Phone Number"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  <Text>Cancel</Text>
                </Button>
              </DialogClose>
              <Button
                disabled={phoneNumber.length !== 10 || fullName.length < 3}
                onPress={handleSaveChanges}>
                <Text>Save changes</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="destructive" onPress={handleLogout}>
          <Text>Logout</Text>
        </Button>
      </View>
    </View>
  );
}
