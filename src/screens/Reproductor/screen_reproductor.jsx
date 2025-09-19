import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Orientation from 'react-native-orientation-locker';
import ModalEpisodes from '../../components/Modals/modal_episodes';

const Reproductor = ({ navigation, route }) => {
  const {
    link: initialLink,
    name: initialName = 'Contenido IPTV',
    tipo = 'vod',
    canales = [],
    episodios = [],
    temporada = '0'
  } = route.params;

  const playerRef = useRef(null);
  const controlTimeout = useRef(null);

  const [url, setUrl] = useState(initialLink);
  const [nombre, setNombre] = useState(initialName);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [modalVisible, setModalVisible] = useState(false); //Estado para manejar el modal de episodios

  useEffect(() => {
    Orientation.lockToLandscape();
    return () => {
      Orientation.unlockAllOrientations();
      clearTimeout(controlTimeout.current);
    };
  }, []);

  const showTemporarilyControls = () => {
    setShowControls(true);
    if (controlTimeout.current) clearTimeout(controlTimeout.current);
    controlTimeout.current = setTimeout(() => setShowControls(false), 4000);
  };

  const toggleControls = () => {
    if (showControls) {
      setShowControls(false);
      clearTimeout(controlTimeout.current);
    } else {
      showTemporarilyControls();
    }
  };

  const togglePlayPause = () => setPaused(prev => !prev);
  const handleBack = () => navigation.goBack();

  const handleProgress = ({ currentTime }) => setCurrentTime(currentTime);
  const handleLoad = ({ duration }) => setDuration(duration);
  const seekTo = (time) => playerRef.current?.seek(time);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cambiarCanal = (newUrl, newName) => {
    setUrl(newUrl);
    setNombre(newName);
    setCurrentTime(0);
    setPaused(false);
  };

  //Función para controlar el cierre del modal de episodios
  function handleCloseModal() {
    setModalVisible(false);
  }

  const renderFloatingList = () => {
    if (!showControls) return null;

    const data = tipo === 'live' ? canales : tipo === 'series' ? episodios : [];

    if (data.length === 0) return null;

    return (
      <View style={styles.lista}>
        <ScrollView>
          {data.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => cambiarCanal(item.link, item.title)}
              style={styles.itemWrapper}
            >
              <Text style={styles.itemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

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
            {/* Top */}
            <View style={styles.topControls}>
              <TouchableOpacity onPress={handleBack}>
                <Icon name="arrow-circle-left" size={26} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title} numberOfLines={1}>{nombre}</Text>
              <View style={styles.rightIcons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowControls(false);
                    setModalVisible(true);
                  }}
                >
                  <Icon2 name="card-multiple-outline" size={26} color="#fff" style={styles.iconMargin} />
                </TouchableOpacity>
                <Icon2 name="cast" size={26} color="#fff" style={styles.iconMargin} />
                <Icon2 name="cog-outline" size={26} color="#fff" />
              </View>
            </View>

            {/* Middle */}
            <View style={styles.middleControls}>
              <TouchableOpacity onPress={() => seekTo(currentTime - 10)}>
                <Icon3 name={tipo === 'live' ? "skip-previous" : "replay-10"} size={40} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={togglePlayPause}>
                <Icon3 name={paused ? 'play-arrow' : 'pause'} size={50} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => seekTo(currentTime + 10)}>
                <Icon3 name={tipo === 'live' ? "skip-next" : "forward-10"} size={40} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Bottom */}
            {tipo === 'live' ? (
              <View style={{
                height: 2,
                backgroundColor: '#888',
                marginVertical: 10,
                width: '100%',
              }} />
            ) : (
              <View style={styles.bottomControls}>
                <Text style={styles.time}>{formatTime(currentTime)}</Text>
                <Slider
                  style={{ flex: 1 }}
                  minimumValue={0}
                  maximumValue={duration}
                  value={currentTime}
                  minimumTrackTintColor="#fff"
                  maximumTrackTintColor="#888"
                  thumbTintColor="#fff"
                  onSlidingComplete={seekTo}
                />
                <Text style={styles.time}>{formatTime(duration)}</Text>
              </View>
            )}

          </View>
        )}
        <ModalEpisodes
          openModal={modalVisible}
          handleCloseModal={handleCloseModal}
          temporada={temporada}
          episodes={episodios}
          onSelectEpisode={(episodio) => cambiarCanal(episodio.link, episodio.title)}
        />
        {renderFloatingList()}
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
    marginTop: 40,
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

  lista: {
    position: 'absolute',
    top: 60,
    left: 10,
    maxHeight: 300,
    width: 220,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 8,
    padding: 10,
  },
  itemWrapper: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#666',
  },
  itemText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default Reproductor;
