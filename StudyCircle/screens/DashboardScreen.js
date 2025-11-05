import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function DashboardScreen({ navigation }) {
  const user = auth.currentUser;
  const [userProfile, setUserProfile] = useState(null);
  const [groups, setGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserProfile(userDoc.exists() ? userDoc.data() : null);

        // Load groups where user is member
        const groupsSnapshot = await getDocs(collection(db, 'groups'));
        const joinedGroups = groupsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(g => g.members.includes(user.email));
        setGroups(joinedGroups);

        // Load upcoming sessions for this week (filter could be improved with date comparison)
        const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
        const userSessions = sessionsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(s => joinedGroups.some(g => g.id === s.groupId));
        setSessions(userSessions);
      } catch (error) {
        console.log('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Welcome, {userProfile?.name || 'Student'}</Text>

      <Button title="Your Profile" onPress={() => navigation.navigate('Profile')} />

      <Text style={{ fontSize: 20, marginTop: 20 }}>Active Study Groups</Text>
      {groups.length === 0 ? (
        <Text>You have not joined any groups yet.</Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}>
              <Text style={{ fontSize: 18, paddingVertical: 5 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Text style={{ fontSize: 20, marginTop: 20 }}>Upcoming Study Sessions (This Week)</Text>
      {sessions.length === 0 ? (
        <Text>No upcoming sessions.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 5 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.date} {item.time}</Text>
              <Text>Topic: {item.topic}</Text>
            </View>
          )}
        />
      )}

      <Button title="Browse Study Groups" onPress={() => navigation.navigate('GroupsList')} style={{ marginTop: 20 }} />
    </View>
  );
}
