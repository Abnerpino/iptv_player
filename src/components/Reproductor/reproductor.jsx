import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, BackHandler, ActivityIndicator, ImageBackground } from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import { Slider } from '@miblanchard/react-native-slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/FontAwesome5';
import GoogleCast, { CastButton, useCastState, useRemoteMediaClient, useMediaStatus } from 'react-native-google-cast';
import Orientation from 'react-native-orientation-locker';
import { useStreaming } from '../../services/hooks/useStreaming';
import ModalEpisodes from '../Modals/modal_episodes';
import PanelSettings from '../Panels/panel_settings';
import PanelChannels from '../Panels/panel_channels';
import PanelNextEpisode from '../Panels/panel_next-episode';

const Reproductor = ({ tipo, fullScreen, setFullScreen, setMostrar, categoria, channelIndex, contenido, episodios, idxEpisode, setVisto, onProgressUpdate, onContentChange, markAsWatched }) => {
    const playerRef = useRef(null);
    const controlTimeout = useRef(null);
    const remoteControlTimeout = useRef(null);
    const lockTimeout = useRef(null);
    const lastSaveTime = useRef(0); // Referencia que controla el momento para guardar el ultimo tiempo de reproducción
    const latestTime = useRef(0); // Referencia que almacena el ultimo tiempo de reproducción que se va a guardar
    const hasMarkedLiveAsVisto = useRef(false); // Referencia para saber si un canal ya se ha empezado a reproducir
    const liveVistoTimer = useRef(null); // Referencia para guardar el tiempo de reproducción minimo (100 ms) para considerar un canal como visto
    const isInitialCast = useRef(true); // Referencia para evitar doble carga al conectar
    const countdownTimer = useRef(null); // Referencia para el temporizador de la cuenta regresiva
    const isShowingNextPanel = useRef(false); // Referencia para evitar multiples llamadas al componente de 'Siguiente Episodio'
    const prevEpisodeId = useRef(null); // Referencia para guardar el id del episodio reproducido anteriormente
    const { updateProps, updateEpisodeProps } = useStreaming();
    const [nombre, setNombre] = useState(contenido.name);
    const [paused, setPaused] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showRemoteControls, setShowRemoteControls] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [videoTracks, setVideoTracks] = useState([]); // Almacena pistas de video
    const [audioTracks, setAudioTracks] = useState([]); // Almacena pistas de audio
    const [textTracks, setTextTracks] = useState([]);   // Almacena pistas de subtítulos
    const [selectedVideoTrack, setSelectedVideoTrack] = useState({ type: 'auto' });
    const [selectedAudioTrack, setSelectedAudioTrack] = useState({ type: 'auto' });
    const [selectedTextTrack, setSelectedTextTrack] = useState(); // Inicia deshabilitado
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar la visibilidad el modal de episodios
    const [showSettings, setShowSettings] = useState(false); // Estado para controlar la visibilidad del panel de ajustes
    const [showChannels, setShowChannels] = useState(false); // Estado para controlar la visibilidad del panel de canales
    const [resizeMode, setResizeMode] = useState({ nombre: 'Fit Parent', modo: 'contain' }); // Estado para manejar el nombre y el modo para ajustar el tamaño del video
    const [playbackRate, setPlaybackRate] = useState(1.0); // Estado para manejar la velocidad del video
    const [isScreenLock, setIsScreenLock] = useState(false); // Estado para manejar el 'bloqueo de pantalla'
    const [showIconLock, setShowIconLock] = useState(false); // Estado para manejar la visibilidad de la notificación del 'bloqueo de pantalla'
    const [background, setBackground] = useState(''); // Estado para manejar la imagen de fondo que se muestra cuando se está transmitiendo
    const [showNextEpisode, setShowNextEpisode] = useState(false); // Estado para controlar la visibilidad del componente
    const [countdown, setCountdown] = useState(5); // Estado para controlar el valor de la cuenta regresiva
    const [hasCanceledNextEpisode, setHasCanceledNextEpisode] = useState(false); // Estado para recordar si el usuario canceló
    const castState = useCastState(); // Maneja el estado actual de la conexión ('connected', 'connecting', 'notConnected', etc.)
    const client = useRemoteMediaClient(); // Maneja un objeto que es el cliente actual
    const mediaStatus = useMediaStatus(); // Maneja el estado para controlar el reproductor remoto

    const isCasting = castState === 'connected';

    // useEffect para guardar el tiempo de reproducción al salir del reproductor
    useEffect(() => {
        // La función de limpieza se ejecuta solo cuando el componente se desmonta
        return () => {
            savePlaybackTime(latestTime.current);
            clearTimeout(liveVistoTimer.current);
            clearInterval(countdownTimer.current);
        };
    }, [savePlaybackTime]);

    useEffect(() => {
        Orientation.lockToLandscape();
        return () => {
            Orientation.unlockAllOrientations();
            clearTimeout(controlTimeout.current);
            clearTimeout(remoteControlTimeout.current);
            clearTimeout(lockTimeout.current);
            clearInterval(countdownTimer.current);
        };
    }, []);

    useEffect(() => {
        switch (tipo) {
            case 'live':
                cambiarCanal(contenido);
                setBackground(contenido.stream_icon);
                break;
            case 'vod':
                const imagen = contenido.backdrop_path ? `https://image.tmdb.org/t/p/original${contenido.backdrop_path}` : '';
                setBackground(imagen);
                break;
            case 'series':
                setBackground(contenido.backdrop);
                // Resetea los estados del "siguiente episodio" solo si se ha cambiado de episodio
                if (prevEpisodeId.current !== contenido.episode_id) {
                    isShowingNextPanel.current = false;
                    setHasCanceledNextEpisode(false);
                    setShowNextEpisode(false);
                    clearInterval(countdownTimer.current);
                }
                // Actualiza la referencia para el próximo cambio de contenido
                prevEpisodeId.current = contenido.episode_id;
                break;
            default:
                break;
        }
    }, [contenido]);

    useEffect(() => {
        if (tipo === 'live' && fullScreen) {
            showTemporarilyControls();
        }

        if (!isLoading) {
            showTemporarilyControls();
        }

        if (isCasting && mediaStatus?.playerState === 'BUFFERING') {
            showTemporarilyRemoteControls();
        }
    }, [tipo, isLoading, fullScreen, isCasting, mediaStatus?.playerState]);

    useEffect(() => {
        if (!fullScreen) return;

        const backAction = () => {
            if (showSettings) { // Si el panel de ajustes está abierto...
                setShowSettings(false); // Cierra el panel de ajustes
                return true;
            }

            if (showChannels) { // Si el panel de canales está abierto...
                setShowChannels(false); // Cierra el panel de canales
                return true;
            }

            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [fullScreen, showSettings, showChannels]);

    // useEffect para la cuenta regresiva del panel de 'Siguiente Episodio'
    useEffect(() => {
        if (showNextEpisode) {
            // Inicia el temporizador
            countdownTimer.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 0) {
                        // Se acabó el tiempo
                        clearInterval(countdownTimer.current);

                        // Llama a la función estabilizada
                        handlePlayNow();
                        return 0;
                    }
                    return prev - 1; // Resta 1 segundo
                });
            }, 1000); // Se ejecuta cada segundo
        } else {
            // Limpia el temporizador si el componente se oculta
            clearInterval(countdownTimer.current);
        }

        // Función de limpieza
        return () => clearInterval(countdownTimer.current);
    }, [showNextEpisode, handlePlayNow]);

    // useEffect que maneja la CONEXIÓN INICIAL
    useEffect(() => {
        // Esta función se ejecutará cada vez que el 'client' o el 'castState' cambien
        if (client && isCasting) {
            isInitialCast.current = true; // Marcam que esta es la conexión inicial
            castVideo(currentTime); // Transmite el video actual
        }
    }, [client, castState]);

    // useEffect que maneja los CAMBIOS DE CONTENIDO (Canal/Episodio)
    useEffect(() => {
        if (client && isCasting) {
            if (isInitialCast.current) {
                // Si es el primer render después de conectar, no hace nada y baja la bandera
                isInitialCast.current = false;
            } else {
                // Si ya hbaía una conexión (no es el cast inicial) y el 'contenido' cambia, significa que el usuario cambió de canal
                castVideo(0); // Carga el nuevo contenido desde el inicio
            }
        }
    }, [contenido, castVideo, isCasting, client]);

    const castVideo = useCallback((startTime = 0) => {
        if (!client || !contenido) return;

        console.log('Enviando a Cast:', contenido.name);
        setPaused(true); // Pausa el reproductor local

        client.loadMedia({
            mediaInfo: {
                contentUrl: contenido.link,
                contentType: 'application/vnd.apple.mpegurl', // Asumiendo HLS para IPTV
                metadata: {
                    title: contenido.name,
                    subtitle: '',
                    images: [{ url: tipo !== 'series' ? contenido.stream_icon : contenido.cover }],
                },
            },
            startTime: Math.round(startTime), // Inicia en el tiempo actual
        });
    }, [client, contenido, tipo]);

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

    const showTemporarilyRemoteControls = () => {
        setShowRemoteControls(true);
        if (remoteControlTimeout.current) clearTimeout(remoteControlTimeout.current);
        remoteControlTimeout.current = setTimeout(() => setShowRemoteControls(false), 4000);
    };

    const toggleControls = () => {
        if (showControls) {
            setShowControls(false);
            clearTimeout(controlTimeout.current);
        } else {
            showTemporarilyControls();
        }
    };

    const toggleRemoteControls = () => {
        if (showRemoteControls) {
            setShowRemoteControls(false);
            clearTimeout(remoteControlTimeout.current);
        } else {
            showTemporarilyRemoteControls();
        }
    };

    const toggleIconLock = () => {
        if (showIconLock) {
            setShowIconLock(false);
            clearTimeout(lockTimeout.current);
        } else {
            showTemporarilyIconLock();
        }
    };

    const showTemporarilyIconLock = () => {
        setShowIconLock(true);
        if (lockTimeout.current) clearTimeout(lockTimeout.current);
        lockTimeout.current = setTimeout(() => setShowIconLock(false), 3000);
    };

    // Función para Play/Pause en el reproductor local
    const togglePlayPause = () => {
        setPaused(prev => !prev);

        // Si ya terminó la reproducción pero no se cierra el reproductor, al volver a darle 'Play', se reinicia
        if (duration > 0 && (currentTime / duration) === 1) {
            setCurrentTime(0);
            playerRef.current?.seek(0);
        }
    };

    // Función para Play/Pause en el reproductor remoto
    const remoteTogglePlayPause = () => {
        if (!client) return;
        if (mediaStatus?.playerState === 'PLAYING') {
            client.pause();
        } else {
            client.play();
        }
    };

    // Función para buscar (adelantar/retroceder) en el reproductor remoto
    const remoteSeekTo = (time) => {
        if (!client) return;
        client.seek({ position: time });
    };

    // Función para el slider en el reproductor remoto
    const remoteSlidingComplete = (value) => {
        if (!client) return;
        client.seek({ position: value[0] });
    };

    const handleBack = () => {
        if (tipo === 'live') {
            setFullScreen(false);
        } else {
            setMostrar(false);
        }
    };

    const handleProgress = ({ currentTime }) => {
        // Si se llega al 99% de reproducción del episodio y el panel de configuración o de canales o el modal de episodios está abierto, los cierra o si la pantalla está bloqueada la desbloquea, para que se mustre el panel de 'Siguiente Episodio'
        if (tipo === 'series' && (currentTime / contenido.episode_run_time) >= 0.99 && (showSettings || showChannels || modalVisible || isScreenLock)) {
            setShowSettings(false);
            setShowChannels(false);
            setModalVisible(false);
            setIsScreenLock(false);
        }

        // Si el panel de ajustes o el panel de canales está abierto, no actualiza el tiempo y ni hace nada más
        if (showSettings || showChannels) {
            return;
        }

        setCurrentTime(currentTime);
        latestTime.current = currentTime;

        if (tipo === 'series') {
            onProgressUpdate(currentTime, contenido.episode_id);

            // Lógica para el manejo del panel de 'Siguiente Episodio'
            if (
                contenido.episode_run_time > 0 &&
                (currentTime / contenido.episode_run_time) >= 0.99 && // 1. Condición: 99% completado
                !isShowingNextPanel.current &&                            // 2. La bandera indica que no se está mostrando ya
                !hasCanceledNextEpisode &&                     // 3. El usuario no lo ha cancelado
                (idxEpisode + 1) < episodios.length          // 4. No es el último episodio
            ) {
                isShowingNextPanel.current = true; // Marca como verdadera la bandera para ya no entrar en esta sección
                setShowControls(false); // Oculta los controles
                setCountdown(5); // Reinicia la cuenta regresiva a 5
                setShowNextEpisode(true); // Muestra el panel
            }
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

            return; // Sale de la función porque el resto del código es solo para peliculas y episodios
        }

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

        let startTime = parseFloat(contenido.playback_time); // Convierte el string de Realm a número

        // Si la duración es válida y el porcentaje de reproducción es igual o mayor a 99%, reinicia el video
        // Usa la duración del objeto 'contenido' porque no siempre es la misma con 'data.duration' y la barra de progreso trabaja con la de 'contenido'
        if (data.duration > 0 && tipo === 'vod' && Number(contenido.episode_run_time) > 0) {
            if (startTime / (Number(contenido.episode_run_time) * 60) >= 0.99) {
                startTime = 0;
            }
        }
        if (data.duration > 0 && tipo === 'series' && contenido.episode_run_time > 0) {
            if (startTime / contenido.episode_run_time >= 0.99) {
                startTime = 0;
            }
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
            savePlaybackTime(duration); // Guarda explícitamente la duración total como el tiempo de reproducción
            setPaused(true); // Pausa el reproductor en la UI
        }
    };

    const seekTo = (time) => playerRef.current?.seek(time[0]);

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
            if (tipo === 'vod') {
                auxFormatted = Number(contenido.episode_run_time) >= 60 ? '00:' : '';
            } else {
                auxFormatted = Number(contenido.episode_run_time) >= 3600 ? '00:' : '';
            }
            return `${auxFormatted}${formattedMins}:${formattedSecs}`;
        }
    };

    const cambiarCanal = (canal) => {
        setNombre(`${canal.num} - ${canal.name}`);
        clearTimeout(liveVistoTimer.current);
        hasMarkedLiveAsVisto.current = false; // Reinicia las bandera
    };

    // Función para ir al canal anterior
    const handlePrevious = () => {
        // Fórmula para retroceder y dar la vuelta al llegar al principio
        const newIndex = (channelIndex - 1 + categoria.canales.length) % categoria.canales.length;
        onContentChange(categoria, categoria.canales[newIndex]);
    };

    // Función para ir al siguiente canal
    const handleNext = () => {
        // Fórmula para avanzar y dar la vuelta al llegar al final
        const newIndex = (channelIndex + 1) % categoria.canales.length;
        onContentChange(categoria, categoria.canales[newIndex]);
    };

    //Función para controlar el cierre del modal de episodios
    function handleCloseModal() {
        setModalVisible(false);
    }

    // Función para cambiar al siguiente episodio
    const nextEpisode = useCallback(() => {
        // Se asegura de que no sea el último episodio de la temporada
        if ((idxEpisode + 1) < episodios.length) {
            onContentChange(episodios[idxEpisode + 1]);
            setVisto(episodios[idxEpisode + 1]);
        }

        // Lógica de reseteo de variables del panel de 'Siguiente Episodio'
        isShowingNextPanel.current = false;
        setShowNextEpisode(false);
        clearInterval(countdownTimer.current);
        setHasCanceledNextEpisode(false);
    }, [idxEpisode, episodios, onContentChange, setVisto]);

    // Se ejecuta al presionar "CANCELAR" en el panel de 'Siguiente Episodio'
    const handleCancelNextEpisode = () => {
        isShowingNextPanel.current = false;
        setShowNextEpisode(false);
        setHasCanceledNextEpisode(true); // Recuerda que el usuario canceló
    };

    // Se ejecuta al presionar "REPRODUCIR AHORA" o al terminar el contador en el panel de 'Siguiente Episodio'
    const handlePlayNow = useCallback(() => {
        setShowNextEpisode(false);

        // Comprobación de seguridad
        if ((idxEpisode + 1) < episodios.length) {
            nextEpisode(); // Llama a la función existente
        }
    }, [idxEpisode, episodios, nextEpisode]);

    // Función para cambiar la relación de aspecto
    const cycleAspectRatio = () => {
        const modes = [
            { nombre: 'Fit Parent', modo: 'contain' },
            { nombre: 'Fill Parent', modo: 'cover' },
            { nombre: 'Match Parent', modo: 'stretch' }
        ];
        const currentIndex = modes.findIndex(mode => mode.modo === resizeMode.modo);
        // Usamos el módulo para volver al inicio de la lista
        const nextIndex = (currentIndex + 1) % modes.length;
        setResizeMode(modes[nextIndex]);
    };

    // Función para cambiar la velocidad de reproducción
    const cyclePlaybackSpeed = () => {
        const rates = [1.0, 1.25, 1.5, 2.0, 0.25, 0.5]; // Lista de velocidades
        const currentIndex = rates.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % rates.length;
        setPlaybackRate(rates[nextIndex]);
    };

    return (
        <View style={styles.container}>
            {isCasting ? (
                <TouchableWithoutFeedback
                    onPress={() => {
                        if (!fullScreen) {
                            setFullScreen(true);
                        }
                        toggleRemoteControls();
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <ImageBackground
                            source={background ? { uri: background } : require('../../assets/fondo.jpg')}
                            style={{ flex: 1 }}
                            resizeMode={tipo === 'live' ? 'contain' : 'cover'}
                        >
                            <View style={[styles.castContainer, { backgroundColor: background ? 'rgba(16, 16, 16, 0.75)' : 'rgba(16,16,16,0.5)' }]}>
                                <View style={{ alignItems: 'center' }}>
                                    <Icon2 name="cast-connected" size={100} color="#fff" />
                                    <Text style={styles.castText1}>
                                        Reproduciendo en tu TV
                                    </Text>
                                    <Text style={styles.castText2}>
                                        {nombre}
                                    </Text>
                                </View>

                                {fullScreen && showRemoteControls && (
                                    <View style={styles.bottomControls}>
                                        <TouchableOpacity style={{ marginRight: 20 }} onPress={tipo === 'live' ? handlePrevious : () => remoteSeekTo((mediaStatus?.streamPosition ?? 0) - 10)}>
                                            <Icon3 name={tipo === 'live' ? "skip-previous" : "replay-10"} size={45} color="#fff" />
                                        </TouchableOpacity>
                                        {(mediaStatus?.playerState === 'BUFFERING') ? (
                                            <ActivityIndicator size={40} color="#fff" />
                                        ) : (
                                            <TouchableOpacity onPress={remoteTogglePlayPause}>
                                                <Icon4 name={paused ? 'play' : 'pause'} size={30} color="#fff" />
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity style={{ marginLeft: 20 }} onPress={tipo === 'live' ? handleNext : () => remoteSeekTo((mediaStatus?.streamPosition ?? 0) + 10)}>
                                            <Icon3 name={tipo === 'live' ? "skip-next" : "forward-10"} size={45} color="#fff" />
                                        </TouchableOpacity>

                                        {tipo === 'live' ? (
                                            <View style={[styles.barra, { width: '75%', marginLeft: 5 }]} />
                                        ) : (
                                            <>
                                                <Text style={styles.time}>{formatTime(mediaStatus?.streamPosition ?? 0)}</Text>
                                                <Slider
                                                    value={mediaStatus?.streamPosition ?? 0}
                                                    minimumValue={0}
                                                    maximumValue={mediaStatus?.mediaInfo?.streamDuration ?? 0}
                                                    onSlidingComplete={remoteSlidingComplete}
                                                    trackStyle={styles.track}
                                                    thumbStyle={styles.thumb}
                                                    minimumTrackTintColor="#00c0fe"
                                                    maximumTrackTintColor="#888"
                                                    containerStyle={{ flex: 0.9 }}
                                                />
                                                <Text style={styles.time}>{formatTime(mediaStatus?.mediaInfo?.streamDuration ?? 0)}</Text>
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        </ImageBackground>
                    </View>
                </TouchableWithoutFeedback>
            ) : (
                <TouchableWithoutFeedback
                    style={fullScreen ? styles.fullScreenVideo : styles.videoPlayerContainer}
                    onPress={() => {
                        if (showNextEpisode) return; // Si se muestra el panel de "Siguiente Episodio", no hace nada al tocar la pantalla
                        if (showSettings) {
                            setShowSettings(false);
                            return
                        }
                        if (showChannels) {
                            setShowChannels(false);
                            return
                        }
                        if (!fullScreen) {
                            setFullScreen(true);
                        }
                        if (isScreenLock) {
                            toggleIconLock();
                            return
                        }
                        toggleControls();
                    }}
                >
                    <View style={styles.container}>
                        <Video
                            ref={playerRef}
                            source={{ uri: contenido.link }}
                            style={styles.videoPlayer}
                            resizeMode={resizeMode.modo}
                            rate={playbackRate}
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

                        {/* Muestra la animación de carga, ya sea cuando un canal está cargando en pantalla chica
                        o cuando cualquier tipo de contenido está cargando mientras la pantalla está bloqueada */}
                        {((tipo === 'live' && !fullScreen) || (fullScreen && isScreenLock)) && isLoading && (
                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                <ActivityIndicator size={50} color="#fff" />
                            </View>
                        )}

                        {/* Muestra los controles solo si la pantalla está completa, no está bloqueada y no se muestra el panel de 'Siguiente Episodio'*/}
                        {fullScreen && showControls && !isScreenLock && !showNextEpisode && (
                            <View style={styles.overlay}>
                                {/* Top */}
                                <View style={styles.topControls}>
                                    <TouchableOpacity onPress={handleBack}>
                                        <Icon name="arrow-circle-left" size={26} color="#fff" />
                                    </TouchableOpacity>
                                    <Text style={styles.title} numberOfLines={1}>{nombre}</Text>
                                    <View style={styles.rightIcons}>
                                        <CastButton style={{ width: 26, height: 26, tintColor: 'white' }} />
                                        <TouchableOpacity onPress={() => {
                                            setIsScreenLock(true);
                                            toggleIconLock();
                                        }}
                                        >
                                            <Icon name="unlock-alt" size={26} color="#fff" />
                                        </TouchableOpacity>
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
                                    <TouchableOpacity onPress={tipo === 'live' ? handlePrevious : () => seekTo(currentTime - 10)}>
                                        <Icon3 name={tipo === 'live' ? "skip-previous" : "replay-10"} size={60} color="#fff" />
                                    </TouchableOpacity>
                                    {isLoading ? (
                                        <ActivityIndicator size={50} color="#fff" />
                                    ) : (
                                        <TouchableOpacity onPress={togglePlayPause}>
                                            <Icon4 name={paused ? 'play' : 'pause'} size={45} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={tipo === 'live' ? handleNext : () => seekTo(currentTime + 10)}>
                                        <Icon3 name={tipo === 'live' ? "skip-next" : "forward-10"} size={60} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {/* Bottom */}
                                <View>
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
                                                value={currentTime}
                                                minimumValue={0}
                                                maximumValue={duration}
                                                onSlidingComplete={seekTo}
                                                trackStyle={styles.track}
                                                thumbStyle={styles.thumb}
                                                minimumTrackTintColor="#00c0fe"
                                                maximumTrackTintColor="#888"
                                                containerStyle={{ flex: 1 }}
                                            />
                                            <Text style={styles.time}>{formatTime(duration)}</Text>
                                        </View>
                                    )}
                                    <View style={styles.bottomIcons}>
                                        {tipo !== 'vod' && ( // Solo se muestra para canales y episodios
                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', }}
                                                onPress={() => {
                                                    setShowControls(false);
                                                    if (tipo === 'live') {
                                                        setShowChannels(true);
                                                    } else {
                                                        setModalVisible(true);
                                                    }
                                                }}
                                            >
                                                <Icon2 name="card-multiple" size={26} color="#fff" style={styles.iconMargin} />
                                                <Text style={styles.textIcon}>{tipo === 'live' ? 'Lista de canales' : 'EPISODIOS'}</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity style={{ flexDirection: 'row', }} onPress={cycleAspectRatio}>
                                            <Icon3 name="aspect-ratio" size={26} color="#fff" style={styles.iconMargin} />
                                            <Text style={styles.textIcon}>Proporción ({resizeMode.nombre})</Text>
                                        </TouchableOpacity>
                                        {tipo !== 'live' && ( // Solo se muestra para peliculas y episodios
                                            <TouchableOpacity style={{ flexDirection: 'row', }} onPress={cyclePlaybackSpeed}>
                                                <Icon3 name="speed" size={26} color="#fff" style={styles.iconMargin} />
                                                <Text style={styles.textIcon}>Velocidad ({playbackRate}x)</Text>
                                            </TouchableOpacity>
                                        )}
                                        {tipo === 'series' && ( // Solo se muestra para episodios
                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', opacity: (idxEpisode + 1) < episodios.length ? 1 : 0.5 }}
                                                onPress={nextEpisode}
                                                disabled={(idxEpisode + 1) < episodios.length ? false : true}
                                            >
                                                <Icon3 name="skip-next" size={26} color="#fff" style={styles.iconMargin} />
                                                <Text style={styles.textIcon}>Siguiente episodio</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        {isScreenLock && showIconLock && fullScreen && ( // Muestra la notificación de pantalla bloqueda solo si está activada y en panatalla grande
                            <View style={styles.lockContainer}>
                                <TouchableOpacity
                                    style={styles.lockIcon}
                                    onPress={() => {
                                        setShowIconLock(false);
                                        setIsScreenLock(false);
                                    }}
                                >
                                    <Icon name="lock" size={35} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.lockText1}>Pantalla Bloqueada</Text>
                                <Text style={styles.lockText2}>Presione para Desbloquear</Text>
                            </View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            )}
            {showSettings && (
                <PanelSettings
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
            {showChannels && (
                <PanelChannels
                    onClose={() => setShowChannels(false)}
                    idCategorySelected={categoria.category_id}
                    idChannelSelected={contenido.num}
                    onSelectChannel={(category, canal) => {
                        onContentChange(category, canal);
                        setShowChannels(false);
                    }}
                />
            )}
            <ModalEpisodes
                openModal={modalVisible}
                handleCloseModal={handleCloseModal}
                temporada={contenido.temporada}
                episodes={episodios}
                onSelectEpisode={(episodio) => {
                    onContentChange(episodio);
                    setVisto(episodio);
                    // Lógica para resetear las variables del panel de 'Siguiente Episodio'
                    isShowingNextPanel.current = false; // Marca como falsa la bandera para que se pueda volver a mostrar el panel
                    setShowNextEpisode(false); // Oculta el panel si estaba visible
                    clearInterval(countdownTimer.current); // Limpia el temporizador
                    setHasCanceledNextEpisode(false); // Resetea el estado de cancelación
                }}
            />
            {showNextEpisode && (idxEpisode + 1) < episodios.length && (
                <PanelNextEpisode
                    imagen={episodios[idxEpisode + 1]?.movie_image}
                    countdown={countdown}
                    onCancel={handleCancelNextEpisode}
                    onPlayNow={handlePlayNow}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    castContainer: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
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
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    topControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        flex: 0.80,
        color: '#fff',
        fontSize: 16,
        marginLeft: 20,
    },
    rightIcons: {
        flex: 0.20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomIcons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 10
    },
    textIcon: {
        color: '#fff',
        fontSize: 16,
        textAlignVertical: 'center',
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
        height: 4,
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
    track: {
        height: 4,
        borderRadius: 2
    },
    thumb: {
        height: 15,
        width: 15,
        backgroundColor: '#fff'
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
    lockContainer: {
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingVertical: 20,
    },
    lockIcon: {
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 45,
        backgroundColor: '#FFF'
    },
    lockText1: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: 'bold',
        marginVertical: 5
    },
    lockText2: {
        color: '#FFF',
        fontSize: 13,
    },
    castText1: {
        color: 'white',
        marginTop: 5,
        fontSize: 20,
    },
    castText2: {
        color: '#888',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 15,
        marginTop: 5,
    }
});

export default Reproductor;
