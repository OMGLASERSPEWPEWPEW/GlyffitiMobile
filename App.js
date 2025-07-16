// App.js
import 'react-native-get-random-values'; // MUST be first import!

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PublishingScreen } from './src/screens/PublishingScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <PublishingScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}