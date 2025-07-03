import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Reproductor = ({ navigation, route }) => {
  const { link: url, name = 'Contenido IPTV' } = route.params;
  const playerRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggleControls = () => setShowControls(prev => !prev);
  const togglePlayPause = () => setPaused(prev => !prev);
  const handleBack = () => navigation.goBack();

  const handleProgress = ({ currentTime }) => setCurrentTime(currentTime);
  const handleLoad = ({ duration }) => setDuration(duration);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const seekTo = (time) => playerRef.current?.seek(time);

  return (
    <TouchableWithoutFeedback onPress={toggleControls}>
      <View style={styles.container}>
        <Video
          ref={playerRef}
          source={{ uri: url }}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          onProgress={handleProgress}
          onLoad={handleLoad}
          controls={false}
        />

        {showControls && (
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.topControls}>
              <TouchableOpacity onPress={handleBack}>
                <Icon name="arrow-left" size={30} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>{name}</Text>
              <View style={styles.rightIcons}>
                <Icon name="cast" size={26} color="#fff" style={styles.iconMargin} />
                <Icon name="cog-outline" size={26} color="#fff" />
              </View>
            </View>

            {/* Center controls */}
            <View style={styles.middleControls}>
              <TouchableOpacity onPress={() => seekTo(currentTime - 10)}>
                <Icon name="rewind-10" size={40} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePlayPause}>
                <Icon name={paused ? 'play' : 'pause'} size={50} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => seekTo(currentTime + 10)}>
                <Icon name="fast-forward-10" size={40} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Bottom progress bar */}
            <View style={styles.bottomControls}>
              <Text style={styles.time}>{formatTime(currentTime)}</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={duration}
                value={currentTime}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#aaa"
                thumbTintColor="#fff"
                onSlidingComplete={seekTo}
              />
              <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: { marginRight: 10 },

  middleControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    color: '#fff',
    width: 50,
    textAlign: 'center',
    fontSize: 12,
  },
});

export default Reproductor;
