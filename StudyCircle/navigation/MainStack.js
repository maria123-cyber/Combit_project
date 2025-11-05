import React from 'react';
import { View, Text, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function MainStack({ navigation }) {
  const handleLogout = async () => {
    await signOut(auth);
    navigation.navigate('Login');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Welcome! You are logged in 🎉
      </Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}
