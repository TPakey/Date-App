import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TabNavigator } from './src/navigation/TabNavigator';
import ConfigWarningBanner from './src/components/ConfigWarningBanner';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ConfigWarningBanner />
        <TabNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
