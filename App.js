// App.js
// Path: App.js
import 'react-native-get-random-values'; // MUST be first import!
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { PublishingScreen } from './src/screens/PublishingScreen';
import { StoryViewScreen } from './src/screens/StoryViewScreen';
import { StoryDiscoveryScreen } from './src/screens/StoryDiscoveryScreen';
import { ComposerModal } from './src/screens/ComposerModal';
import { ErrorBoundary } from './src/components/shared';
import { UserProvider } from './src/context/UserContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <ErrorBoundary
        onError={(error, errorInfo) => {
        console.error('App-level error:', error);
        }}
        >
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              cardStyleInterpolator: ({ current, next, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{
                title: 'Glyffiti',
              }}
            />
            <Stack.Screen 
              name="Publishing" 
              component={PublishingScreen}
              options={{
                title: 'Publishing',
                cardStyleInterpolator: () => ({
                  cardStyle: {
                    opacity: 1,
                  },
                }),
              }}
            />
            <Stack.Screen 
              name="StoryView" 
              component={StoryViewScreen}
              options={{
                title: 'Story Viewer',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen 
              name="StoryDiscovery" 
              component={StoryDiscoveryScreen}
              options={{
                title: 'Discover Stories',
              }}
            />
            <Stack.Screen 
              name="ComposeModal" 
              component={ComposerModal}
              options={{
                title: 'New Post',
                presentation: 'modal',
                gestureEnabled: true,
                cardStyleInterpolator: ({ current, layouts }) => {
                  return {
                    cardStyle: {
                      transform: [
                        {
                          translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                          }),
                        },
                      ],
                    },
                  };
                },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
      </ErrorBoundary>
    </UserProvider>
  );
}

// Character count: 2,436