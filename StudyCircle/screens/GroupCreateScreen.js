// GroupCreateScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch, Alert, ScrollView } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function GroupCreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [studyTopics, setStudyTopics] = useState('');
  const [maxMembers, setMaxMembers] = useState('5'); // default 5
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = async () => {
    if (!name || !department || !course || !courseCode) {
      return Alert.alert('Error', 'Please fill required fields');
    }
    if (Number(maxMembers) < 3 || Number(maxMembers) > 10) {
      return Alert.alert('Error', 'Max members must be between 3 and 10');
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return Alert.alert('Error', 'You must be logged in to create a group.');
      }

      await addDoc(collection(db, 'groups'), {
        name,
        department,
        course,
        courseCode,
        description,
        studyTopics,
        maxMembers: Number(maxMembers),
        schedule,
        location,
        private: isPrivate,
        members: [currentUser.email],
        creator: currentUser.email,
        ownerId: currentUser.uid,
        joinRequests: [],
        createdAt: new Date()
      });

      Alert.alert('Success', 'Group created!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Create New Group</Text>

      <TextInput placeholder="Group Name *" value={name} onChangeText={setName}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <TextInput placeholder="Department *" value={department} onChangeText={setDepartment}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <TextInput placeholder="Course Name *" value={course} onChangeText={setCourse}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <TextInput placeholder="Course Code *" value={courseCode} onChangeText={setCourseCode}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, height: 90, borderRadius: 8 }} />

      <TextInput placeholder="Study Topics (comma separated)" value={studyTopics} onChangeText={setStudyTopics}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <TextInput placeholder="Max Members (3-10)" value={maxMembers} onChangeText={setMaxMembers} keyboardType="numeric"
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <TextInput placeholder="Meeting Schedule" value={schedule} onChangeText={setSchedule}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <TextInput placeholder="Location" value={location} onChangeText={setLocation}
        style={{ borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 8 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ marginRight: 10 }}>Private Group</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>

      <Button title="Create Group" onPress={handleCreate} />
    </ScrollView>
  );
}
