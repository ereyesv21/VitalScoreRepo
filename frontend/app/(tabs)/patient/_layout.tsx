import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '../../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.main,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 5,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 
              name="home" 
              size={focused ? 26 : 22} 
              color={focused ? Colors.primary.main : Colors.grey[400]} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Citas',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 
              name={focused ? 'calendar-check' : 'calendar-alt'} 
              size={focused ? 26 : 22} 
              color={focused ? Colors.primary.main : Colors.grey[400]} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 
              name="clipboard-list" 
              size={focused ? 26 : 22} 
              color={focused ? Colors.primary.main : Colors.grey[400]} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5 
              name={focused ? 'user-alt' : 'user'} 
              size={focused ? 26 : 22} 
              color={focused ? Colors.primary.main : Colors.grey[400]} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

import { Text } from 'react-native'; 