import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import GroupsListScreen from '../screens/GroupsListScreen';
import GroupCreateScreen from '../screens/GroupCreateScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GroupSessionsScreen from '../screens/GroupSessionsScreen';

const Stack = createNativeStackNavigator();

export default function MainStack({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Study Circle Dashboard',
          headerRight: () => <Button title="Logout" onPress={handleLogout} />,
        }}
      />
      <Stack.Screen name="GroupsList" component={GroupsListScreen} options={{ title: 'Study Groups' }} />
      <Stack.Screen name="CreateGroup" component={GroupCreateScreen} options={{ title: 'Create Group' }} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} options={{ title: 'Group Detail' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Your Profile' }} />
      <Stack.Screen name="GroupSessions" component={GroupSessionsScreen} options={{ title: 'Study Sessions' }} />
    </Stack.Navigator>
  );
}
