import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Modal, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function GroupSessionsScreen({ route }) {
  const { groupId } = route.params;
  const user = auth.currentUser;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [agenda, setAgenda] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const q = query(collection(db, 'sessions'), where('groupId', '==', groupId));
        const querySnapshot = await getDocs(q);
        const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSessions(sessionsData);
      } catch (error) {
        console.log('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [groupId]);

  const handleCreateSession = async () => {
    if (!title || !topic || !date || !time) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    try {
      await addDoc(collection(db, 'sessions'), {
        groupId,
        title,
        topic,
        date,
        time,
        duration,
        agenda,
        creator: user.email,
        attendees: [],
        maybes: [],
        cannotAttend: [],
      });
      Alert.alert('Session created!');
      setModalVisible(false);
      setTitle(''); setTopic(''); setDate(''); setTime(''); setDuration(''); setAgenda('');
      // Reload sessions
      const q = query(collection(db, 'sessions'), where('groupId', '==', groupId));
      const querySnapshot = await getDocs(q);
      const sessionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(sessionsData);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRSVP = async (sessionId, status) => {
    const sessionRef = doc(db, 'sessions', sessionId);
    try {
      // Remove user from all RSVP arrays first
      await updateDoc(sessionRef, {
        attendees: arrayRemove(user.email),
        maybes: arrayRemove(user.email),
        cannotAttend: arrayRemove(user.email),
      });
      // Add to selected status array
      if (status === 'attending') await updateDoc(sessionRef, { attendees: arrayUnion(user.email) });
      if (status === 'maybe') await updateDoc(sessionRef, { maybes: arrayUnion(user.email) });
      if (status === 'cannot') await updateDoc(sessionRef, { cannotAttend: arrayUnion(user.email) });
      // Update local state (optional: refetch or update UI)
      Alert.alert('RSVP updated!');
    } catch (error) {
      Alert.alert('Error updating RSVP', error.message);
    }
  };

  const handleCancelSession = async (session) => {
    if (session.creator !== user.email) return Alert.alert('Only creator can cancel the session.');

    try {
      await deleteDoc(doc(db, 'sessions', session.id));
      setSessions(prev => prev.filter(s => s.id !== session.id));
      Alert.alert('Session cancelled');
    } catch (error) {
      Alert.alert('Error cancelling session', error.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Create Study Session" onPress={() => setModalVisible(true)} />

      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 10 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
            <Text>Topic: {item.topic}</Text>
            <Text>Date: {item.date} Time: {item.time}</Text>
            <Text>Duration: {item.duration}</Text>
            <Text>Agenda: {item.agenda}</Text>
            <Text>RSVP:</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button title="Attending" onPress={() => handleRSVP(item.id, 'attending')} />
              <Button title="Maybe" onPress={() => handleRSVP(item.id, 'maybe')} />
              <Button title="Cannot Attend" onPress={() => handleRSVP(item.id, 'cannot')} />
            </View>
            {item.creator === user.email && (
              <Button
                title="Cancel Session"
                color="red"
                onPress={() => handleCancelSession(item)}
              />
            )}
          </View>
        )}
      />

      {/* Create Session Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Create Study Session</Text>

          <TextInput placeholder="Title *" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Topic *" value={topic} onChangeText={setTopic} style={styles.input} />
          <TextInput placeholder="Date (YYYY-MM-DD) *" value={date} onChangeText={setDate} style={styles.input} />
          <TextInput placeholder="Time (HH:mm)" value={time} onChangeText={setTime} style={styles.input} />
          <TextInput placeholder="Duration (e.g. 1 hour)" value={duration} onChangeText={setDuration} style={styles.input} />
          <TextInput placeholder="Agenda" value={agenda} onChangeText={setAgenda} multiline style={[styles.input, { height: 80 }]} />

          <Button title="Create" onPress={handleCreateSession} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
});
