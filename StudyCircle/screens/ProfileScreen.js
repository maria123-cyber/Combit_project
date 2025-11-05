// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setName(data.name || '');
          setDepartment(data.department || '');
          setSemester(data.semester || '');
          setImageUri(data.photoURL || user?.photoURL || null);
        } else {
          setImageUri(user?.photoURL || null);
        }
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!name || !department || !semester) return Alert.alert('Please fill all fields');
    try {
      await updateDoc(doc(db, 'users', user.uid), { name, department, semester });
      setEditing(false);
      Alert.alert('Saved');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Give permission to access photos');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (!res.cancelled) {
      uploadImage(res.uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const path = `profile_images/${user.uid}.jpg`;
      const ref = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(ref, blob);
      uploadTask.on('state_changed', 
        snapshot => { /* progress can be tracked */ },
        err => {
          console.log('Upload err', err);
          Alert.alert('Upload failed', err.message || err.code);
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
          await updateProfile(user, { photoURL: url });
          setImageUri(url);
          setUploading(false);
          Alert.alert('Profile image updated');
        }
      );
    } catch (e) {
      Alert.alert('Error', e.message);
      setUploading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop:50 }} />;

  return (
    <View style={{ flex:1, padding:20 }}>
      <TouchableOpacity onPress={() => { if (!editing) navigation.navigate('Profile'); }} style={{ alignItems:'center', marginBottom:16 }}>
        {imageUri ? <Image source={{ uri: imageUri }} style={{ width:120, height:120, borderRadius:60 }} /> : <View style={{ width:120, height:120, borderRadius:60, backgroundColor:'#ddd', justifyContent:'center', alignItems:'center' }}><Text>Add Photo</Text></View>}
      </TouchableOpacity>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight:'700', marginBottom:6 }}>Full Name</Text>
        <TextInput editable={editing} value={name} onChangeText={setName} style={[styles.input, editing?styles.inputEdit:null]} />
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight:'700', marginBottom:6 }}>Department</Text>
        <TextInput editable={editing} value={department} onChangeText={setDepartment} style={[styles.input, editing?styles.inputEdit:null]} />
      </View>

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight:'700', marginBottom:6 }}>Semester/Year</Text>
        <TextInput editable={editing} value={semester} onChangeText={setSemester} style={[styles.input, editing?styles.inputEdit:null]} />
      </View>

      {editing ? (
        <>
          <Button title="Save Profile" onPress={handleSave} />
          <View style={{ height:10 }} />
          <Button title="Cancel" color="red" onPress={() => setEditing(false)} />
        </>
      ) : (
        <>
          <Button title="Edit Profile" onPress={() => setEditing(true)} />
          <View style={{ height:10 }} />
          <Button title="Change Photo" onPress={pickImage} />
          {uploading && <ActivityIndicator style={{ marginTop:10 }} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth:1, padding:10, borderRadius:8, backgroundColor:'#fafafa' },
  inputEdit: { borderColor:'#3498db', backgroundColor:'#fff' }
});
