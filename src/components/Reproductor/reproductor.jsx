import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ScrollView, BackHandler, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Orientation from 'react-native-orientation-locker';
import { useStreaming } from '../../services/hooks/useStreaming';
import ModalEpisodes from '../Modals/modal_episodes';
import SettingsPanel from '../SettingsPanel';

const Reproductor = ({ tipo, fullScreen, setFullScreen, setMostrar, contenido, data, setVisto, onProgressUpdate, onEpisodeChange, markAsWatched }) => {
    const playerRef = useRef(null);
    const controlTimeout = useRef(null);
    const lastSaveTime = useRef(0); // Referencia que controla el momento para guardar el ultimo tiempo de reproducción
    const latestTime = useRef(0); // Referencia que almacena el ultimo tiempo de reproducción que se va a guardar
    const hasMarkedLiveAsVisto = useRef(false); // Referencia para saber si un canal ya se ha empezado a reproducir
    const liveVistoTimer = useRef(null); // Referencia para guardar el tiempo de reproducción minimo (100 ms) para considerar un canal como visto
    const { updateProps, updateEpisodeProps } = useStreaming();
    const [nombre, setNombre] = useState(contenido.name);
    const [paused, setPaused] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false); // Controla la visibilidad del panel
    const [videoTracks, setVideoTracks] = useState([]); // Almacena pistas de video
    const [audioTracks, setAudioTracks] = useState([]); // Almacena pistas de audio
    const [textTracks, setTextTracks] = useState([]);   // Almacena pistas de subtítulos
    const [selectedVideoTrack, setSelectedVideoTrack] = useState({ type: 'auto' });
    const [selectedAudioTrack, setSelectedAudioTrack] = useState({ type: 'auto' });
    const [selectedTextTrack, setSelectedTextTrack] = useState(); // Inicia deshabilitado
    const [modalVisible, setModalVisible] = useState(false); //Estado para manejar el modal de episodios

    // useEffect para guardar el tiempo de reproducción al salir del reproductor
    useEffect(() => {
        // La función de limpieza se ejecuta solo cuando el componente se desmonta
        return () => {
            savePlaybackTime(latestTime.current);
            clearTimeout(liveVistoTimer.current);
        };
    }, [savePlaybackTime]);

    useEffect(() => {
        Orientation.lockToLandscape();
        return () => {
            Orientation.unlockAllOrientations();
            clearTimeout(controlTimeout.current);
        };
    }, []);

    useEffect(() => {
        if (tipo === 'live') {
            cambiarCanal(contenido);
        }
    }, [contenido]);

    useEffect(() => {
        if (!fullScreen) return;

        const backAction = () => {
            if (showSettings) { // Si el panel de ajustes está abierto...
                setShowSettings(false); // Cierra el panel de ajustes
                return true;
            }

            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [fullScreen, showSettings]);

    const savePlaybackTime = useCallback((timeToSave) => {
        const item_id = tipo === 'series' ? 'episode_id' : 'stream_id';

        if (!contenido || !contenido[item_id]) return;

        if ((tipo === 'vod' || tipo === 'series') && timeToSave > 0) {
            const time = timeToSave.toString();
            if (tipo === 'vod') {
                updateProps(tipo, false, contenido.stream_id, { playback_time: time });
            } else { // 'series', para un episodio
                updateEpisodeProps(contenido.series_id, contenido.temporada, contenido.episode_id, 'playback_time', time);
            }
        }
    }, [contenido, tipo, updateEpisodeProps, updateProps]);

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
        // Si el panel está abierto, no actualiza el tiempo y ni hace nada más
        if (showSettings) {
            return;
        }

        setCurrentTime(currentTime);
        latestTime.current = currentTime;

        if (tipo === 'series') {
            onProgressUpdate(currentTime, contenido.episode_id);
        }

        if (tipo === 'vod') {
            onProgressUpdate(currentTime);
        }

        const SAVE_INTERVAL = 15; // Guardar cada 15 segundos

        // Comprueba si ha pasado suficiente tiempo desde el último guardado
        if (Math.abs(currentTime - lastSaveTime.current) > SAVE_INTERVAL) { // Se usa valor absoluto porque lo importante no es la dirección (atrás o adelante), sino la magintud del salto en el tiempo
            savePlaybackTime(currentTime);
            lastSaveTime.current = currentTime; // Actualiza el último tiempo de guardado
        }
    };

    // Método para manejar el buffer
    const handleBuffer = ({ isBuffering }) => {
        setIsLoading(isBuffering);
    };

    const handleLoadStart = () => {
        setIsLoading(true);
    };

    const handleLoad = (data) => {
        setIsLoading(false); // Indica que el video cargó y se debe ocultar el spinner
        setDuration(data.duration);

        // Captura las pistas disponibles
        setVideoTracks(data.videoTracks);
        setAudioTracks(data.audioTracks);
        setTextTracks(data.textTracks);

        // Si hay una o más pistas de video, selecciona la primera por defecto
        if (data.videoTracks.length > 0) {
            setSelectedVideoTrack({
                type: 'index',
                value: 0 //El índice 0 es la primera pista
            });
        }

        // Si hay una o más pistas de audio, selecciona la primera por defecto
        if (data.audioTracks.length > 0) {
            setSelectedAudioTrack({
                type: 'index',
                value: 0 //El índice 0 es la primera pista
            });
        }


        if (tipo === 'live') {
            // Limpia cualquier temporizador anterior por si acaso
            clearTimeout(liveVistoTimer.current);

            // Inicia el temporizador de 100 milisegundos
            liveVistoTimer.current = setTimeout(() => {
                if (!hasMarkedLiveAsVisto.current) {
                    markAsWatched(); // Llama a la función del padre para marcarlo en Realm
                    hasMarkedLiveAsVisto.current = true; // Activa la bandera para no volver a entrar aquí
                }
            }, 100);
        }

        let startTime = parseFloat(contenido.playback_time); // Convierte el string de Realm a número
        const VISTO_THRESHOLD = 5; // Umbral de 5 segundos para considerar un video como "reproducido completamente".

        // Si la duración es válida y la diferencia es menor que el umbral, reinicia el video
        if (data.duration > 0 && (data.duration - startTime) < VISTO_THRESHOLD) {
            startTime = 0;
        }

        if (startTime > 0 && playerRef.current) {
            // Solo para VOD y Series, intenta reanudar la reproducción
            if (tipo === 'vod' || tipo === 'series') {
                playerRef.current.seek(startTime); // Salta al tiempo guardado
            }
        }

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

    const cambiarCanal = (canal) => {
        setNombre(`${canal.num} - ${canal.name}`);
        clearTimeout(liveVistoTimer.current);
        hasMarkedLiveAsVisto.current = false; // Reinicia las bandera
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
        <View style={styles.container}>
            <TouchableWithoutFeedback
                style={fullScreen ? styles.fullScreenVideo : styles.videoPlayerContainer}
                onPress={() => {
                    if (showSettings) {
                        setShowSettings(false);
                        return
                    }
                    if (!fullScreen) {
                        setFullScreen(true);
                    }
                    toggleControls();
                }}
            >
                <View style={styles.container}>
                    <Video
                        ref={playerRef}
                        source={{ uri: contenido.link }}
                        style={styles.videoPlayer}
                        resizeMode="contain"
                        paused={paused}
                        onLoadStart={handleLoadStart}
                        onLoad={handleLoad}
                        onBuffer={handleBuffer}
                        onProgress={handleProgress}
                        onEnd={handleEnd}
                        controls={false}
                        selectedVideoTrack={selectedVideoTrack}
                        selectedAudioTrack={selectedAudioTrack}
                        selectedTextTrack={selectedTextTrack}
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
                                    <TouchableOpacity onPress={() => {
                                        setShowControls(false);
                                        setShowSettings(true);
                                    }}>
                                        <Icon2 name="cog-outline" size={26} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Middle */}
                            <View style={styles.middleControls}>
                                {isLoading ? (
                                    <ActivityIndicator size="large" color="#fff" />
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={() => seekTo(currentTime - 10)}>
                                            <Icon3 name={tipo === 'live' ? "skip-previous" : "replay-10"} size={40} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={togglePlayPause}>
                                            <Icon3 name={paused ? 'play-arrow' : 'pause'} size={50} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => seekTo(currentTime + 10)}>
                                            <Icon3 name={tipo === 'live' ? "skip-next" : "forward-10"} size={40} color="#fff" />
                                        </TouchableOpacity>
                                    </>
                                )}
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
                </View>
            </TouchableWithoutFeedback>
            {showSettings && (
                <SettingsPanel
                    onClose={() => setShowSettings(false)}
                    videoTracks={videoTracks}
                    audioTracks={audioTracks}
                    textTracks={textTracks}
                    selectedVideoTrack={selectedVideoTrack}
                    selectedAudioTrack={selectedAudioTrack}
                    selectedTextTrack={selectedTextTrack}
                    onSelectVideoTrack={setSelectedVideoTrack}
                    onSelectAudioTrack={setSelectedAudioTrack}
                    onSelectTextTrack={setSelectedTextTrack}
                />
            )}
            <ModalEpisodes
                openModal={modalVisible}
                handleCloseModal={handleCloseModal}
                temporada={contenido.temporada}
                episodes={data}
                onSelectEpisode={(episodio) => {
                    onEpisodeChange(episodio);
                    setVisto(episodio);
                }}
            />
        </View>
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
        width: '7%',
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
