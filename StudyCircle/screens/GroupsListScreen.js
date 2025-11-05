import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import GroupCard from '../components/GroupCard';

export default function GroupsListScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'groups'));
        const groupsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(groupsData);
      } catch (error) {
        console.log('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept ? g.department?.toLowerCase() === filterDept.toLowerCase() : true;
    const matchesCourse = filterCourse ? g.course?.toLowerCase() === filterCourse.toLowerCase() : true;
    return matchesSearch && matchesDept && matchesCourse;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Study Groups</Text>

      <TextInput
        placeholder="Search groups..."
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, borderRadius: 5, padding: 8, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Filter by Department (e.g., CS)"
        value={filterDept}
        onChangeText={setFilterDept}
        style={{ borderWidth: 1, borderRadius: 5, padding: 8, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Filter by Course (e.g., AI)"
        value={filterCourse}
        onChangeText={setFilterCourse}
        style={{ borderWidth: 1, borderRadius: 5, padding: 8, marginBottom: 10 }}
      />

      <Button title="Create New Group" onPress={() => navigation.navigate('CreateGroup')} />
      <Button title="Your Profile" onPress={() => navigation.navigate('Profile')} style={{ marginTop: 10 }} />

      {filteredGroups.length === 0 ? (
        <Text style={{ marginTop: 20, textAlign: 'center' }}>No groups found</Text>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
            >
              <GroupCard group={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
