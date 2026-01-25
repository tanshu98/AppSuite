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
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Sound from 'react-native-nitro-sound';

const App = () => {

  // Interface

  interface Recording {
    id: string;
    path: string;
    createdAt: Date;
  }
  // States
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecordingPath, setCurrentRecordingPath] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const requestMicPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
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
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const startRecordingHandler = async () => {
    try {
      const permissionGranted = await requestMicPermission();
      if (!permissionGranted) {
        Alert.alert(
          'Permission Required',
          'Please allow microphone access to record audio.',
        );
        Alert.alert('Recording Failed');
        setIsRecording(false);
        return;
      }

      // Sound Recording Logic

      Sound.setSubscriptionDuration(200); // 👈 smoother metering

      Sound.addRecordBackListener(e => {});

      const result = await Sound.startRecorder();
      setCurrentRecordingPath(result);
      setIsRecording(true);
    } catch (error) {
      console.log('❌ startRecordingHandler error:', error);
      setIsRecording(false);
    }
  };

  const stopRecordingHandler = async () => {
    if (!isRecording) {
      console.log('⚠️ No active recording');
      return;
    }

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
    } catch (error) {
      console.log('❌ Stop recording error:', error);
    }
  };

  const startPlayback = async (item: Recording) => {
    try {
      if (isPlaying) {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
        setIsPlaying(false);
      }

      setCurrentPlayingId(item.id);

      Sound.setSubscriptionDuration(250);

      Sound.addPlayBackListener(e => {});

      await Sound.startPlayer(item.path);
      setIsPlaying(true);

      Sound.addPlaybackEndListener(e => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      });
    } catch (error) {
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
    } catch (error) {
      Alert.alert('Stop play error');
    }
  };

  useEffect(() => {
    if (isPlaying) {
      Sound.setVolume(1.0);
    }
  }, [isPlaying]);

  // cleanup on umnount
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
        onPress={() => {
          currentPlayingId === item.id ? stopPlayback() : startPlayback(item);
        }}
      >
        <Text>{currentPlayingId === item.id ? '⏹ Stop' : '▶ Play'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: 'center', paddingHorizontal: 15 }}>
          <Text style={styles.heading}>Welcome To Audio Journal</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.startRecordingButton,
              isRecording && { opacity: 0.5 },
            ]}
            disabled={isRecording}
            onPress={() => startRecordingHandler()}
          >
            <Text style={styles.startRecordingText}>Start Recording</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.stopRecordingButton,
              !isRecording && { opacity: 0.5 },
            ]}
            disabled={!isRecording}
            onPress={() => stopRecordingHandler()}
          >
            <Text style={styles.stopRecordingText}>Stop Recording</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={recordings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontWeight: '700',
    fontSize: 24,
    color: '#9CC6DB',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  startRecordingButton: {
    height: 40,
    width: '35%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5E7C6',
  },
  startRecordingText: {
    color: '#492828',
    fontWeight: '500',
    fontSize: 14,
  },
  stopRecordingButton: {
    height: 40,
    width: '35%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFAAB8',
  },
  stopRecordingText: {
    color: '#FFD8DF',
    fontWeight: '500',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    color: '#aaa',
    fontSize: 12,
    marginVertical: 6,
  },
  playBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  playText: {
    color: '#fff',
    fontWeight: '600',
  },
});
