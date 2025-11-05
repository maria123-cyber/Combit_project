import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const user = auth.currentUser;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMember = group?.members?.includes(user.email);
  const isCreator = group?.creator === user.email;
  const isRequested = group?.joinRequests?.includes(user.email);

  useEffect(() => {
    const fetchGroup = async () => {
      const docRef = doc(db, 'groups', groupId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGroup({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchGroup();
  }, [groupId]);

  const handleJoin = async () => {
    if (isMember) return Alert.alert('You are already a member.');

    if (group.members.length >= group.maxMembers)
      return Alert.alert('Group is full.');

    if (group.private) {
      if (isRequested) return Alert.alert('Join request already sent.');
      try {
        await updateDoc(doc(db, 'groups', groupId), {
          joinRequests: arrayUnion(user.email),
        });
        Alert.alert('Join request sent! Wait for approval.');
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    } else {
      // Public group - join immediately
      try {
        await updateDoc(doc(db, 'groups', groupId), {
          members: arrayUnion(user.email),
        });
        Alert.alert('You joined the group!');
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    }
  };

  const handleLeave = async () => {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayRemove(user.email),
      });
      Alert.alert('You left the group');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleApprove = async (email) => {
    if (!isCreator) return;

    if (group.members.length >= group.maxMembers) {
      return Alert.alert('Group is full. Cannot approve more members.');
    }

    try {
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(email),
        joinRequests: arrayRemove(email),
      });
      Alert.alert(`${email} approved!`);
      setGroup(prev => ({
        ...prev,
        members: [...prev.members, email],
        joinRequests: prev.joinRequests.filter(e => e !== email),
      }));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleReject = async (email) => {
    if (!isCreator) return;
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        joinRequests: arrayRemove(email),
      });
      Alert.alert(`${email} rejected!`);
      setGroup(prev => ({
        ...prev,
        joinRequests: prev.joinRequests.filter(e => e !== email),
      }));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{group.name}</Text>
      <Text>Department: {group.department}</Text>
      <Text>Course: {group.course} ({group.courseCode})</Text>
      <Text>Description: {group.description}</Text>
      <Text>Study Topics: {group.studyTopics}</Text>
      <Text>Schedule: {group.schedule}</Text>
      <Text>Location: {group.location}</Text>
      <Text>Members: {group.members.length} / {group.maxMembers}</Text>
      <Text>Private Group: {group.private ? 'Yes' : 'No'}</Text>

      {isMember ? (
        <Button title="Leave Group" onPress={handleLeave} color="red" />
      ) : (
        <Button title={group.private ? (isRequested ? 'Request Sent' : 'Request to Join') : 'Join Group'} onPress={handleJoin} />
      )}

      {isCreator && group.joinRequests.length > 0 && (
        <>
          <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Join Requests:</Text>
          <FlatList
            data={group.joinRequests}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                <Text>{item}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <Button title="Approve" onPress={() => handleApprove(item)} />
                  <Button title="Reject" onPress={() => handleReject(item)} color="red" />
                </View>
              </View>
            )}
          />
        </>
      )}

      <Button title="View Study Sessions" onPress={() => navigation.navigate('GroupSessions', { groupId })} />
    </View>
  );
}
