// GroupDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function GroupDetailScreen({ route, navigation }) {
  const { groupId } = route.params;
  const user = auth.currentUser;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const docRef = doc(db, 'groups', groupId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const g = { id: docSnap.id, ...docSnap.data() };
          setGroup(g);
          setIsOwner(user && g.ownerId === user.uid);
          setIsMember(user && g.members?.includes(user.email));
          setIsRequested(user && g.joinRequests?.includes(user.email));
        } else {
          Alert.alert('Not found', 'Group not found');
          navigation.goBack();
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  const refresh = async () => {
    setLoading(true);
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const g = { id: docSnap.id, ...docSnap.data() };
      setGroup(g);
      setIsOwner(user && g.ownerId === user.uid);
      setIsMember(user && g.members?.includes(user.email));
      setIsRequested(user && g.joinRequests?.includes(user.email));
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!group) return;
    if (isMember) return Alert.alert('Info', 'You are already a member.');
    if (group.members.length >= group.maxMembers) return Alert.alert('Full', 'Group is full.');

    try {
      if (group.private) {
        if (isRequested) return Alert.alert('Info', 'Request already sent.');
        await updateDoc(doc(db, 'groups', groupId), { joinRequests: arrayUnion(user.email) });
        Alert.alert('Request sent', 'Wait for owner approval.');
      } else {
        await updateDoc(doc(db, 'groups', groupId), { members: arrayUnion(user.email) });
        Alert.alert('Joined', 'You joined the group.');
      }
      refresh();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleLeave = async () => {
    if (!isMember) return;
    try {
      await updateDoc(doc(db, 'groups', groupId), { members: arrayRemove(user.email) });
      Alert.alert('Left', 'You left the group.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleApprove = async (email) => {
    if (!isOwner) return;
    if (group.members.length >= group.maxMembers) return Alert.alert('Full', 'Group is full.');
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(email),
        joinRequests: arrayRemove(email),
      });
      Alert.alert('Approved', `${email} approved`);
      refresh();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleReject = async (email) => {
    if (!isOwner) return;
    try {
      await updateDoc(doc(db, 'groups', groupId), { joinRequests: arrayRemove(email) });
      Alert.alert('Rejected', `${email} rejected`);
      refresh();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    Alert.alert('Confirm', 'Delete this group?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteDoc(doc(db, 'groups', groupId));
          Alert.alert('Deleted', 'Group deleted');
          navigation.goBack();
        } catch (e) {
          Alert.alert('Error', e.message);
        }
      } }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 6 }}>{group.name}</Text>
      <Text style={{ color: '#666', marginBottom: 10 }}>{group.department} • {group.course} ({group.courseCode})</Text>

      <Text style={{ marginTop: 8, fontWeight: '600' }}>Description</Text>
      <Text style={{ marginBottom: 8 }}>{group.description || 'No description'}</Text>

      <Text style={{ fontWeight: '600' }}>Topics</Text>
      <Text style={{ marginBottom: 8 }}>{group.studyTopics || '-'}</Text>

      <Text>Schedule: {group.schedule || '-'}</Text>
      <Text>Location: {group.location || '-'}</Text>
      <Text style={{ marginBottom: 8 }}>Members: {group.members?.length || 0} / {group.maxMembers}</Text>

      {isMember ? (
        <Button title="Leave Group" color="red" onPress={handleLeave} />
      ) : (
        <Button title={group.private ? (isRequested ? 'Request Sent' : 'Request to Join') : 'Join Group'} onPress={handleJoin} />
      )}

      <View style={{ height: 12 }} />

      <Button title="View Study Sessions" onPress={() => navigation.navigate('GroupSessions', { groupId })} />

      {isOwner && (
        <>
          <View style={{ height: 12 }} />
          <Button title="Edit Group" onPress={() => navigation.navigate('EditGroup', { groupId })} />
          <View style={{ height: 10 }} />
          <Button title="Delete Group" color="red" onPress={handleDelete} />
        </>
      )}

      {/* Join requests list */}
      {isOwner && group.joinRequests?.length > 0 && (
        <>
          <Text style={{ marginTop: 18, fontWeight: '700' }}>Join Requests</Text>
          <FlatList
            data={group.joinRequests}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <Text>{item}</Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => handleApprove(item)} style={styles.smallBtn}><Text style={{color:'#fff'}}>Approve</Text></TouchableOpacity>
                  <View style={{ width: 8 }} />
                  <TouchableOpacity onPress={() => handleReject(item)} style={[styles.smallBtn, { backgroundColor: '#e74c3c' }]}><Text style={{color:'#fff'}}>Reject</Text></TouchableOpacity>
                </View>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = {
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#27ae60',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  }
};
