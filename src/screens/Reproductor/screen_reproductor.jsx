import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const Reproductor = ({ navigation, route }) => {
  const url = route.params.link;

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: url }}
        style={styles.videoPlayer}
        controls={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  videoPlayer: { width: '100%', height: '100%' }
});

export default Reproductor;