// screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');

  // Fetch user name from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        } else {
          setUserName(auth.currentUser.email.split('@')[0]);
        }
      } catch (e) {
        console.log('Error fetching user data:', e);
      }
    };
    fetchUserData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {userName} 👋</Text>
          <Text style={styles.subtitle}>Welcome to StudyCircle</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Dashboard Cards */}
      <View style={styles.section}>
        {/* Create / Manage Groups */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('GroupCreateScreen')}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4213/4213179.png' }}
            style={styles.icon}
          />
          <Text style={styles.cardText}>Create / Manage Groups</Text>
        </TouchableOpacity>

        {/* Browse / Join Groups */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('GroupsListScreen')}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6391/6391844.png' }}
            style={styles.icon}
          />
          <Text style={styles.cardText}>Browse / Join Groups</Text>
        </TouchableOpacity>

        {/* Study Sessions */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('GroupSessionsScreen')}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991108.png' }}
            style={styles.icon}
          />
          <Text style={styles.cardText}>Study Sessions</Text>
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2922/2922506.png' }}
            style={styles.icon}
          />
          <Text style={styles.cardText}>View / Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f7f9fc',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a73e8',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#1a73e8',
  },
  section: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a73e8',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  cardText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
