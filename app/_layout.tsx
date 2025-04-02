import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="quick-start" 
        options={{ 
          title: 'Analyse du sol',
          presentation: 'modal' // Optionnel pour un effet modal
        }} 
      />
    </Stack>
  );
}