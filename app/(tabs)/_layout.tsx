import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: 'Météo',
          tabBarIcon: ({ color }) => (
            <Ionicons name="partly-sunny" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="soil"
        options={{
          title: 'Sol',
          tabBarIcon: ({ color }) => (
            <Ionicons name="leaf" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="irrigation"
        options={{
          title: 'Irrigation',
          tabBarIcon: ({ color }) => (
            <Ionicons name="water" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
  name="livestock" 
  options={{
    title: 'Bétail',
    tabBarIcon: ({ color }) => (
      <Ionicons name="paw" size={24} color={color} />
    ),
  }} 
/>

    </Tabs>
  );
}
