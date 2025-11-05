import React from 'react';
import { View, Text } from 'react-native';

export default function GroupCard({ group }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{group.name}</Text>
      <Text>Department: {group.department}</Text>
      <Text>Course: {group.course}</Text>
      <Text>Members: {group.members?.length || 0}</Text>
      <Text>Private: {group.private ? 'Yes' : 'No'}</Text>
    </View>
  );
}
