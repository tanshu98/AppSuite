import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sound from 'react-native-nitro-sound';

interface Recording {
  id: string;
  path: string;
  createdAt: Date;
}

const JournalScreen = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingPath, setCurrentRecordingPath] =
    useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] =
    useState<string | null>(null);

  const requestMicPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone Permission',
        message: 'Audio Journal needs access to your microphone',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const startRecordingHandler = async () => {
    try {
      const permissionGranted = await requestMicPermission();
      if (!permissionGranted) {
        Alert.alert('Permission Required');
        return;
      }

      Sound.setSubscriptionDuration(200);
      Sound.addRecordBackListener(() => {});

      const result = await Sound.startRecorder();
      setCurrentRecordingPath(result);
      setIsRecording(true);
    } catch {
      Alert.alert('Recording failed');
      setIsRecording(false);
    }
  };

  const stopRecordingHandler = async () => {
    if (!isRecording) return;

    try {
      await Sound.stopRecorder();
      Sound.removeRecordBackListener();

      if (!currentRecordingPath) return;

      setRecordings(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          path: currentRecordingPath,
          createdAt: new Date(),
        },
      ]);

      setCurrentRecordingPath(null);
      setIsRecording(false);
    } catch {
      Alert.alert('Stop recording failed');
    }
  };

  const startPlayback = async (item: Recording) => {
    try {
      if (isPlaying) {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
      }

      setCurrentPlayingId(item.id);

      Sound.addPlayBackListener(() => {});
      await Sound.startPlayer(item.path);

      setIsPlaying(true);

      Sound.addPlaybackEndListener(() => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      });
    } catch {
      Alert.alert('Playback failed');
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const stopPlayback = async () => {
    try {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      setIsPlaying(false);
      setCurrentPlayingId(null);
    } catch {
      Alert.alert('Stop playback failed');
    }
  };

  useEffect(() => {
    return () => {
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
      Sound.removeRecordBackListener();
    };
  }, []);

  const renderItem = ({ item, index }: { item: Recording; index: number }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Journal #{index + 1}</Text>
      <Text style={styles.time}>{item.createdAt.toLocaleString()}</Text>

      <TouchableOpacity
        disabled={isRecording}
        style={[styles.playBtn, isRecording && { opacity: 0.5 }]}
        onPress={() =>
          currentPlayingId === item.id
            ? stopPlayback()
            : startPlayback(item)
        }
      >
        <Text style={styles.playText}>
          {currentPlayingId === item.id ? '⏹ Stop' : '▶ Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Audio Journal</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.startRecordingButton,
            isRecording && { opacity: 0.5 },
          ]}
          disabled={isRecording}
          onPress={startRecordingHandler}
        >
          <Text style={styles.startRecordingText}>Start</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stopRecordingButton,
            !isRecording && { opacity: 0.5 },
          ]}
          disabled={!isRecording}
          onPress={stopRecordingHandler}
        >
          <Text style={styles.stopRecordingText}>Stop</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

export default JournalScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  startRecordingButton: {
    backgroundColor: '#F5E7C6',
    padding: 10,
    borderRadius: 8,
  },
  stopRecordingButton: {
    backgroundColor: '#FFAAB8',
    padding: 10,
    borderRadius: 8,
  },
  startRecordingText: { fontWeight: '600' },
  stopRecordingText: { fontWeight: '600' },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { color: '#fff', fontWeight: '600' },
  time: { color: '#aaa', fontSize: 12, marginVertical: 6 },
  playBtn: {
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  playText: { color: '#fff' },
});
