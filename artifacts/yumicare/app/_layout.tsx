import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isLoggedIn } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inLogin = segments[0] === "login";
    const inTabs = segments[0] === "(tabs)";
    if (!isLoggedIn && !inLogin) {
      router.replace("/login");
    } else if (isLoggedIn && inLogin) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="emergency" options={{ headerShown: false, presentation: "fullScreenModal" }} />
      <Stack.Screen name="qr" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="medications" options={{ headerShown: false }} />
      <Stack.Screen name="allergies" options={{ headerShown: false }} />
      <Stack.Screen name="appointments" options={{ headerShown: false }} />
      <Stack.Screen name="messages" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="help" options={{ headerShown: false }} />
      <Stack.Screen name="patient-detail" options={{ headerShown: false }} />
      <Stack.Screen name="scan" options={{ headerShown: false }} />
      <Stack.Screen name="doctor-chat" options={{ headerShown: false }} />
      <Stack.Screen name="ultrasound-upload" options={{ headerShown: false }} />
      <Stack.Screen name="add-patient" options={{ headerShown: false }} />
      <Stack.Screen name="add-doctor" options={{ headerShown: false }} />
      <Stack.Screen name="add-hospital" options={{ headerShown: false }} />
      <Stack.Screen name="hospital-detail" options={{ headerShown: false }} />
      <Stack.Screen name="doctor-detail" options={{ headerShown: false }} />
      <Stack.Screen name="admin-reports" options={{ headerShown: false }} />
      <Stack.Screen name="vitals" options={{ headerShown: false }} />
      <Stack.Screen name="kick-counter" options={{ headerShown: false }} />
      <Stack.Screen name="book-appointment" options={{ headerShown: false }} />
      <Stack.Screen name="write-prescription" options={{ headerShown: false }} />
      <Stack.Screen name="bed-management" options={{ headerShown: false }} />
      <Stack.Screen name="audit-trail" options={{ headerShown: false }} />
      <Stack.Screen name="user-management" options={{ headerShown: false }} />
      <Stack.Screen name="ultrasound-analysis" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
