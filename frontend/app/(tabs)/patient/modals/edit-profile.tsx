import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { authService } from '../../../../services/auth';
import { patientService, PatientWithUser } from '../../../../services/patients';
import { Ionicons } from '@expo/vector-icons';

// ...resto del código igual que en edit-profile.tsx original... 