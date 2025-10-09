import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ScrollView, BackHandler } from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Orientation from 'react-native-orientation-locker';
import { useStreaming } from '../../services/hooks/useStreaming';
import ModalEpisodes from '../Modals/modal_episodes';

const Reproductor = ({ tipo, fullScreen, setFullScreen, setMostrar, contenido, data, setVisto }) => {
    const playerRef = useRef(null);
    const controlTimeout = useRef(null);
    const lastSaveTime = useRef(0); // Referencia que controla el momento para guardar el ultimo tiempo de reproducción
    const latestTime = useRef(0); // Referencia que almacena el ultimo tiempo de reproducción que se va a guardar
    const { updateProps, updateEpisodeProps } = useStreaming();
    const [idEpisode, setIdEpisode] = useState(contenido.episode_id);
    const [url, setUrl] = useState(contenido.link);
    const [nombre, setNombre] = useState(contenido.name);
    const [paused, setPaused] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [savedTime, setSavedTime] = useState(contenido?.playback_time ?? 0);
    const [modalVisible, setModalVisible] = useState(false); //Estado para manejar el modal de episodios

    // useEffect para guardar el tiempo de reproducción al salir del reproductor
    useEffect(() => {
        // La función de limpieza se ejecuta solo cuando el componente se desmonta
        return () => {
            savePlaybackTime(latestTime.current);
        };
    }, []);

    useEffect(() => {
        Orientation.lockToLandscape();
        return () => {
            Orientation.unlockAllOrientations();
            clearTimeout(controlTimeout.current);
        };
    }, []);

    useEffect(() => {
        if (tipo === 'live') {
            setIdEpisode(contenido.episode_id);
            setUrl(contenido.link);
            setNombre(`${contenido.num} - ${contenido.name}`);
        }
    }, [contenido]);

    useEffect(() => {
        if (!fullScreen) return;

        const backAction = () => {
            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [fullScreen]);

    const savePlaybackTime = (timeToSave) => {
        if ((tipo === 'vod' || tipo === 'series') && timeToSave > 0 && duration > 0) {
            if (tipo === 'vod') {
                updateProps(tipo, false, contenido.stream_id, { playback_time: currentTime.toString() });
            } else { // 'series', para un episodio
                updateEpisodeProps(contenido.series_id, contenido.temporada, idEpisode, 'playback_time', currentTime.toString());
            }
        }
    };

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

    const handleBack = () => {
        if (tipo === 'live') {
            setFullScreen(false);
        } else {
            setMostrar(false);
        }
    };

    const handleProgress = ({ currentTime }) => {
        setCurrentTime(currentTime);
        latestTime.current = currentTime;

        const SAVE_INTERVAL = 15; // Guardar cada 15 segundos

        // Comprueba si ha pasado suficiente tiempo desde el último guardado
        if (currentTime - lastSaveTime.current > SAVE_INTERVAL) {
            savePlaybackTime(currentTime);
            lastSaveTime.current = currentTime; // Actualiza el último tiempo de guardado
        }
    };

    const handleLoad = ({ duration }) => {
        setDuration(duration);
        const startTime = parseFloat(savedTime); // Convierte el string de Realm a número
        const VISTO_THRESHOLD = 5; // Umbral de 5 segundos para considerar un video como "reproducido completamente".

        // Si la duración es válida y la diferencia es menor que el umbral, reinicia el video
        if (duration > 0 && (duration - startTime) < VISTO_THRESHOLD) {
            startTime = 0;
        }

        if (startTime > 0 && playerRef.current) {
            // Solo para VOD y Series, intenta reanudar la reproducción
            if (tipo === 'vod' || tipo === 'series') {
                playerRef.current.seek(startTime); // Salta al tiempo guardado
            }
        }

        // Sincroniza el estado de React y el contador de guardado
        setCurrentTime(startTime);
        lastSaveTime.current = startTime; // Sincroniza el último tiempo guardado
    };

    const handleEnd = () => {
        if (tipo === 'vod' || tipo === 'series') {
            // Guarda explícitamente la duración total como el tiempo de reproducción
            savePlaybackTime(duration);
            // Pausa y reinicia el reproductor en la UI
            setPaused(true);
            setCurrentTime(0);
            playerRef.current?.seek(0);
        }
    };

    const seekTo = (time) => playerRef.current?.seek(time);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const formattedMins = mins < 10 ? '0' + mins : mins;
        const formattedSecs = secs < 10 ? '0' + secs : secs;

        if (hours > 0) {
            const formattedHours = hours < 10 ? '0' + hours : hours;
            return `${formattedHours}:${formattedMins}:${formattedSecs}`;
        } else {
            return `${formattedMins}:${formattedSecs}`;
        }
    };

    const cambiarCanal = (episodio) => {
        setIdEpisode(episodio.id);
        setUrl(episodio.link);
        setNombre(episodio.title);
        setSavedTime(parseFloat(episodio.playback_time));
        setPaused(false);
    };

    //Función para controlar el cierre del modal de episodios
    function handleCloseModal() {
        setModalVisible(false);
    }

    const renderFloatingList = () => {
        if (!showControls) return null;

        //const data = tipo === 'live' ? canales : tipo === 'series' ? episodios : [];

        if (data && data.length === 0) return null;

        return (
            <View style={styles.lista}>
                <ScrollView>
                    {data.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => cambiarCanal(item)}
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
        <TouchableWithoutFeedback
            style={fullScreen ? styles.fullScreenVideo : styles.videoPlayerContainer}
            onPress={() => {
                if (!fullScreen) {
                    setFullScreen(true);
                }
                toggleControls();
            }}
        >
            <View style={styles.container}>
                <Video
                    ref={playerRef}
                    source={{ uri: url }}
                    style={styles.videoPlayer}
                    resizeMode="contain"
                    paused={paused}
                    onLoad={handleLoad}
                    onProgress={handleProgress}
                    onEnd={handleEnd}
                    controls={false}
                />

                {fullScreen && showControls && (
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
                            <View style={styles.bottomControlsLive}>
                                <FastImage
                                    style={styles.imagen}
                                    source={{ uri: contenido.stream_icon }}
                                    resizeMode="contain"
                                />
                                <View style={styles.barra} />
                            </View>
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
                    temporada={contenido.temporada}
                    episodes={data}
                    onSelectEpisode={(episodio) => {
                        cambiarCanal(episodio);
                        if (tipo === 'series') {
                            setVisto(episodio);
                        }
                    }}
                />
                {/*renderFloatingList()*/}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    video: {
        width: '100%',
        height: '100%'
    },
    fullScreenVideo: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    videoPlayerContainer: {
        flex: 1,
    },
    videoPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
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
        marginLeft: 20,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconMargin: {
        marginRight: 10
    },
    middleControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    bottomControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottomControlsLive: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    imagen: {
        width: 40,
        height: 40,
    },
    barra: {
        height: 3,
        backgroundColor: '#888',
        marginVertical: 10,
        borderRadius: 2,
        width: '94%',
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
