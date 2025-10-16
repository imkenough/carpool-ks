import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function ProfileScreen() {
  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-4">My Profile</Text>
      
      <View className="mb-8">
        <Text className="text-xl font-semibold mb-2">My Ride Requests</Text>
        {/* Placeholder for ride requests */}
        <Text>You have not sent any ride requests yet.</Text>
      </View>

      <View>
        <Text className="text-xl font-semibold mb-2">My Posted Rides</Text>
        {/* Placeholder for posted rides */}
        <Text>You have not posted any rides yet.</Text>
      </View>
    </View>
  );
}
