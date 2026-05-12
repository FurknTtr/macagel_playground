import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: 'black' }, tabBarActiveTintColor: 'white' }}>
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Ana Sayfa', tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="match-list" 
        options={{ title: 'Maçlar', tabBarIcon: ({ color }) => <FontAwesome name="futbol-o" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="friends" 
        options={{ title: 'Arkadaşlar', tabBarIcon: ({ color }) => <FontAwesome name="users" size={24} color={color} /> }} 
      />
      <Tabs.Screen 
        name="account-settings" 
        options={{ title: 'Ayarlar', tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} /> }} 
      />
    </Tabs>
  );
}