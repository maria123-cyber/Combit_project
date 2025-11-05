// GroupSessionsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, Modal, Alert, ActivityIndicator, StyleSheet } from 'react-native';
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
    const load = async () => {
      try {
        const q = query(collection(db, 'sessions'), where('groupId', '==', groupId));
        const snap = await getDocs(q);
        setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  const createSession = async () => {
    if (!title || !topic || !date || !time) return Alert.alert('Please fill required fields');
    try {
      await addDoc(collection(db, 'sessions'), {
        groupId, title, topic, date, time, duration, agenda,
        creator: user.email, attendees: [], maybes: [], cannotAttend: []
      });
      Alert.alert('Created', 'Session created');
      setModalVisible(false);
      setTitle(''); setTopic(''); setDate(''); setTime(''); setDuration(''); setAgenda('');
      // reload
      const q = query(collection(db, 'sessions'), where('groupId', '==', groupId));
      const snap = await getDocs(q);
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRSVP = async (sId, status) => {
    const sref = doc(db, 'sessions', sId);
    try {
      await updateDoc(sref, {
        attendees: arrayRemove(user.email),
        maybes: arrayRemove(user.email),
        cannotAttend: arrayRemove(user.email)
      });
      if (status === 'attending') await updateDoc(sref, { attendees: arrayUnion(user.email) });
      if (status === 'maybe') await updateDoc(sref, { maybes: arrayUnion(user.email) });
      if (status === 'cannot') await updateDoc(sref, { cannotAttend: arrayUnion(user.email) });
      Alert.alert('RSVP updated');
      // local update
      const snap = await getDocs(query(collection(db, 'sessions'), where('groupId','==',groupId)));
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const cancelSession = async (session) => {
    // only creator or group owner can cancel — we check creator here; owner check can be added by fetching group
    if (session.creator !== user.email) return Alert.alert('Only creator can cancel');
    try {
      await deleteDoc(doc(db, 'sessions', session.id));
      setSessions(prev => prev.filter(s => s.id !== session.id));
      Alert.alert('Cancelled');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;

  return (
    <View style={{ flex:1, padding:20 }}>
      <Button title="Create Study Session" onPress={() => setModalVisible(true)} />
      <FlatList data={sessions} keyExtractor={i=>i.id} renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={{ fontWeight:'700' }}>{item.title}</Text>
          <Text>{item.topic} • {item.date} {item.time}</Text>
          <Text>Duration: {item.duration}</Text>
          <Text numberOfLines={2}>{item.agenda}</Text>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:8 }}>
            <View style={{ flexDirection:'row' }}>
              <Button title="Attending" onPress={() => handleRSVP(item.id, 'attending')} />
              <View style={{ width:8 }} />
              <Button title="Maybe" onPress={() => handleRSVP(item.id, 'maybe')} />
              <View style={{ width:8 }} />
              <Button title="Cannot" onPress={() => handleRSVP(item.id, 'cannot')} />
            </View>
            {item.creator === user.email && <Button title="Cancel" color="red" onPress={() => cancelSession(item)} />}
          </View>
        </View>
      )} />
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex:1, padding:20 }}>
          <Text style={{ fontSize:20, fontWeight:'700', marginBottom:12 }}>Create Session</Text>
          <TextInput placeholder="Title *" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Topic *" value={topic} onChangeText={setTopic} style={styles.input} />
          <TextInput placeholder="Date (YYYY-MM-DD) *" value={date} onChangeText={setDate} style={styles.input} />
          <TextInput placeholder="Time (HH:mm) *" value={time} onChangeText={setTime} style={styles.input} />
          <TextInput placeholder="Duration" value={duration} onChangeText={setDuration} style={styles.input} />
          <TextInput placeholder="Agenda" value={agenda} onChangeText={setAgenda} multiline style={[styles.input, { height: 100 }]} />
          <Button title="Create" onPress={createSession} />
          <View style={{ height:10 }} />
          <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding:12, borderWidth:1, marginVertical:8, borderRadius:10, backgroundColor:'#fff' },
  input: { borderWidth:1, padding:10, borderRadius:8, marginBottom:10 }
});
