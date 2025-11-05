// GroupsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function GroupsListScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const qSnap = await getDocs(collection(db, 'groups'));
        const data = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setGroups(data);
      } catch (e) {
        console.log('Error fetching groups', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filtered = groups.filter(g => {
    const matchesSearch = g.name?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept ? g.department?.toLowerCase() === filterDept.toLowerCase() : true;
    const matchesCourse = filterCourse ? g.course?.toLowerCase() === filterCourse.toLowerCase() : true;
    return matchesSearch && matchesDept && matchesCourse;
  });

  const handleQuickJoin = async (g) => {
    if (!user) return;
    if (g.members?.includes(user.email)) return alert('Already a member');
    if (g.members.length >= g.maxMembers) return alert('Group is full');
    try {
      if (g.private) {
        await updateDoc(doc(db, 'groups', g.id), { joinRequests: [...(g.joinRequests||[]), user.email] });
        alert('Request sent to owner');
      } else {
        await updateDoc(doc(db, 'groups', g.id), { members: [...(g.members||[]), user.email] });
        alert('You joined the group');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex:1, padding:20 }}>
      <Text style={{ fontSize:22, fontWeight:'700', marginBottom:12 }}>Study Groups</Text>

      <TextInput placeholder="Search groups..." value={search} onChangeText={setSearch} style={styles.input} />
      <TextInput placeholder="Filter by Department" value={filterDept} onChangeText={setFilterDept} style={styles.input} />
      <TextInput placeholder="Filter by Course" value={filterCourse} onChangeText={setFilterCourse} style={styles.input} />

      <FlatList data={filtered} keyExtractor={i=>i.id} renderItem={({item}) => (
        <TouchableOpacity onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })} style={styles.card}>
          <View style={{ flex:1 }}>
            <Text style={{ fontSize:18, fontWeight:'700' }}>{item.name}</Text>
            <Text style={{ color:'#666' }}>{item.course} • {item.department}</Text>
            <Text style={{ marginTop:6 }}>{item.description?.slice(0,100)}</Text>
            <Text style={{ marginTop:6, fontWeight:'600' }}>{item.members?.length || 0}/{item.maxMembers} members</Text>
            <Text style={{ color:'#555' }}>{item.schedule}</Text>
          </View>
          <View style={{ justifyContent:'center' }}>
            <Button title={item.private ? 'Request' : 'Join'} onPress={() => handleQuickJoin(item)} />
          </View>
        </TouchableOpacity>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth:1, padding:10, borderRadius:8, marginBottom:10 },
  card: { flexDirection:'row', padding:12, borderWidth:1, marginBottom:10, borderRadius:10, backgroundColor:'#fafafa' }
});
