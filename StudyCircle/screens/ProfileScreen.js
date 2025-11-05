import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setName(data.name || '');
        setDepartment(data.department || '');
        setSemester(data.semester || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!name || !department || !semester) {
      return Alert.alert('Please fill all fields.');
    }
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { name, department, semester });
      Alert.alert('Profile updated!');
    } catch (error) {
      Alert.alert('Update failed', error.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Your Profile</Text>
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Department"
        value={department}
        onChangeText={setDepartment}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Semester/Year"
        value={semester}
        onChangeText={setSemester}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title="Save Profile" onPress={handleSave} />
    </View>
  );
}
