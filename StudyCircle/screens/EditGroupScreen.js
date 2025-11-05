// EditGroupScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function EditGroupScreen({ route, navigation }) {
  const { groupId } = route.params;
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [studyTopics, setStudyTopics] = useState('');
  const [maxMembers, setMaxMembers] = useState('5');
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, 'groups', groupId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert('Not found');
          navigation.goBack();
          return;
        }
        const data = snap.data();
        if (data.ownerId !== user.uid) {
          Alert.alert('Unauthorized', 'Only owner can edit');
          navigation.goBack();
          return;
        }
        setGroup(data);
        setName(data.name || '');
        setDepartment(data.department || '');
        setCourse(data.course || '');
        setCourseCode(data.courseCode || '');
        setDescription(data.description || '');
        setStudyTopics(data.studyTopics || '');
        setMaxMembers(String(data.maxMembers || 5));
        setSchedule(data.schedule || '');
        setLocation(data.location || '');
        setIsPrivate(Boolean(data.private));
      } catch (e) {
        Alert.alert('Error', e.message);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  const handleSave = async () => {
    if (!name || !department || !course || !courseCode) return Alert.alert('Please fill required fields');
    if (Number(maxMembers) < 3 || Number(maxMembers) > 10) return Alert.alert('Max members must be 3-10');
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        name, department, course, courseCode, description, studyTopics,
        maxMembers: Number(maxMembers),
        schedule, location, private: isPrivate
      });
      Alert.alert('Updated', 'Group updated successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Edit Group</Text>

      <TextInput placeholder="Group Name *" value={name} onChangeText={setName} style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />
      <TextInput placeholder="Department *" value={department} onChangeText={setDepartment} style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />
      <TextInput placeholder="Course Name *" value={course} onChangeText={setCourse} style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />
      <TextInput placeholder="Course Code *" value={courseCode} onChangeText={setCourseCode} style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline style={{ borderWidth: 1, padding:12, marginBottom:10, height:90, borderRadius:8 }} />
      <TextInput placeholder="Study Topics" value={studyTopics} onChangeText={setStudyTopics} style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />
      <TextInput placeholder="Max Members (3-10)" value={maxMembers} onChangeText={setMaxMembers} keyboardType="numeric" style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />
      <TextInput placeholder="Schedule" value={schedule} onChangeText={setSchedule} style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />
      <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={{ borderWidth: 1, padding:12, marginBottom:10, borderRadius:8 }} />

      <View style={{ flexDirection:'row', alignItems:'center', marginBottom:16 }}>
        <Text style={{ marginRight:10 }}>Private Group</Text>
        <Switch value={isPrivate} onValueChange={setIsPrivate} />
      </View>

      <Button title="Save Changes" onPress={handleSave} />
    </ScrollView>
  );
}
