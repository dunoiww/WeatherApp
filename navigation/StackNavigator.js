import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import { LogBox } from 'react-native';

const Stack = createNativeStackNavigator();

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

const StackNavigator = () => {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name='Home' component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
  
  export default StackNavigator