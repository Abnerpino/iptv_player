import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableNativeFeedback, TouchableWithoutFeedback, Vibration, BackHandler, ActivityIndicator, ImageBackground, Platform, PanResponder, findNodeHandle } from 'react-native';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import KeyEvent from 'react-native-keyevent';
import { Slider } from '@miblanchard/react-native-slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Icon4 from 'react-native-vector-icons/FontAwesome5';
import GoogleCast, { CastButton, useCastState, useRemoteMediaClient, useMediaStatus } from 'react-native-google-cast';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useStreaming } from '../../services/hooks/useStreaming';
import RippleButton from '../RippleButton/ripple_button';
import ModalEpisodes from '../Modals/modal_episodes';
import PanelSettings from '../Panels/panel_settings';
import PanelChannels from '../Panels/panel_channels';
import PanelNextEpisode from '../Panels/panel_next-episode';

const Reproductor = ({ tipo, fullScreen, setFullScreen, setMostrar, categoria, channelIndex, contenido, episodios, idxEpisode, onProgressUpdate, onContentChange, markAsWatched, username, triggerControls }) => {
    const playerRef = useRef(null); // Referencia para el Reproductor de Video
    const btnPlayRef = useRef(null); // Referencia para el botón de Play/Pause en TV
    const sliderRef = useRef(null); // Referencia para el wrapper del Slider
    const btnPrevRef = useRef(null); // Referencia para el botón de Canal Anterior en TV
    const btnListRef = useRef(null); // Referencia para la lista de Canales o Episodios
    const btnAspectRef = useRef(null); // Referencia para el botón de Relación de Aspecto (Proporción)
    const btnSpeedRef = useRef(null); // Referencia para el botón de Velocidad de Reproducción
    const btnNextRef = useRef(null); // Referencia para el botón de Siguiente Canal o Episodio en TV
    const controlTimeout = useRef(null);
    const remoteControlTimeout = useRef(null);
    const lockTimeout = useRef(null);
    const lastSaveTime = useRef(0); // Referencia que controla el momento para guardar el ultimo tiempo de reproducción
    const latestTime = useRef(0); // Referencia que almacena el ultimo tiempo de reproducción que se va a guardar
    const hasMarkedLiveAsVisto = useRef(false); // Referencia para saber si un canal ya se ha empezado a reproducir
    const isVideoPlaying = useRef(false); // // Referencia para saber si una pelicula o episodio ya se ha empezado a reproducir
    const liveVistoTimer = useRef(null); // Referencia para guardar el tiempo de reproducción minimo (100 ms) para considerar un canal como visto
    const isInitialCast = useRef(true); // Referencia para evitar doble carga al conectar
    const countdownTimer = useRef(null); // Referencia para el temporizador de la cuenta regresiva
    const isShowingNextPanel = useRef(false); // Referencia para evitar multiples llamadas al componente de 'Siguiente Episodio'
    const prevContentId = useRef(null); // Referencia para guardar el id del contenido reproducido anteriormente
    const idContenido = useRef(null); // Referencia para guardar el id del contenido reproducido anteriormente (canal, pelicula o serie)
    const bufferTimeout = useRef(null); // Referencia para el manejo del temporizador del "búfer"
    const fullScreenRef = useRef(fullScreen); // Referencia para saber cuando la pantalla está en tamaño completo o no
    const localChannelIndex = useRef(channelIndex); // Referencia instantánea para evitar el atasco al cambiar canales
    const { updateProps, updateEpisodeProps } = useStreaming();
    const [nombre, setNombre] = useState(contenido.name);
    const [paused, setPaused] = useState(false);
    const [pausedByFocusLoss, setPausedByFocusLoss] = useState(false); // Estado para manejar cuando se pause el video por pérdida de foco
    const [showControls, setShowControls] = useState(true);
    const [showRemoteControls, setShowRemoteControls] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true); // Estado para saber si es la primera vez que el video carga
    const [isEnded, setIsEnded] = useState(false); // Estado para saber si el video ya terminó de reproducirse
    const [videoTracks, setVideoTracks] = useState([]); // Almacena pistas de video
    const [audioTracks, setAudioTracks] = useState([]); // Almacena pistas de audio
    const [textTracks, setTextTracks] = useState([]);   // Almacena pistas de subtítulos
    const [selectedVideoTrack, setSelectedVideoTrack] = useState({ type: 'auto' });
    const [selectedAudioTrack, setSelectedAudioTrack] = useState({ type: 'auto' });
    const [selectedTextTrack, setSelectedTextTrack] = useState(); // Inicia deshabilitado
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar la visibilidad el modal de episodios
    const [showSettings, setShowSettings] = useState(false); // Estado para controlar la visibilidad del panel de ajustes
    const [showChannels, setShowChannels] = useState(false); // Estado para controlar la visibilidad del panel de canales
    const [showNextEpisode, setShowNextEpisode] = useState(false); // Estado para controlar la visibilidad del panel de siguiente episodio
    const [resizeMode, setResizeMode] = useState({ nombre: 'Fit Parent', modo: 'contain' }); // Estado para manejar el nombre y el modo para ajustar el tamaño del video
    const [playbackRate, setPlaybackRate] = useState(1.0); // Estado para manejar la velocidad del video
    const [isScreenLock, setIsScreenLock] = useState(false); // Estado para manejar el 'bloqueo de pantalla'
    const [showIconLock, setShowIconLock] = useState(false); // Estado para manejar la visibilidad de la notificación del 'bloqueo de pantalla'
    const [background, setBackground] = useState(''); // Estado para manejar la imagen de fondo que se muestra cuando se está transmitiendo
    const [countdown, setCountdown] = useState(5); // Estado para controlar el valor de la cuenta regresiva
    const [hasCanceledNextEpisode, setHasCanceledNextEpisode] = useState(false); // Estado para recordar si el usuario canceló
    const [mainLinkFailed, setMainLinkFailed] = useState(false); // Estado para saber si el link principal falló
    const [isCannotReproduce, setIsCannotReproduce] = useState(false); // Estado para saber cuando un contenido ya no puede ser reproducido
    const [retryCount, setRetryCount] = useState(0); // Estado para el manejo del contador de reintentos
    const [sourceKey, setSourceKey] = useState(0); // Estado para el manejo de la llave para forzar recarga
    const [showNotifactionMessage, setShowNotifactionMessage] = useState(false); // Estado para manejar la visibilidad del mensaje de notificación
    const [useInternalTimer, setUseInternalTimer] = useState(false); // Estado para manejar el tiempo cuando las peliculas o episodios no tengan una duración válida
    const [isSliderMode, setIsSliderMode] = useState(false); // Estado para saber si el Modo Slider está activo
    const [imageError, setImageError] = useState(false); // Estado para saber si hubo un error al cargar la imagen del canal
    const [focusTags, setFocusTags] = useState({ play: null, slider: null, prev: null, list: null, aspect: null, speed: null, next: null }); // Estado para manejar las etiquetas de los componentes para navegación explicita
    const castState = useCastState(); // Maneja el estado actual de la conexión ('connected', 'connecting', 'notConnected', etc.)
    const client = useRemoteMediaClient(); // Maneja un objeto que es el cliente actual
    const mediaStatus = useMediaStatus(); // Maneja el estado para controlar el reproductor remoto

    const isCasting = castState === 'connected';
    const customUserAgent = `IPTV_Player-${username}`;
    const idKey = tipo === 'vod' ? 'stream_id' : 'episode_id';
    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#FFFFFF80', false);

    // Mantiene la referencia mutable para poder acceder al estado actual sin causar re-renders
    const stateRef = useRef({
        paused, isCannotReproduce, useInternalTimer, showControls, modalVisible, showSettings, showChannels, showNextEpisode, showNotifactionMessage, showRemoteControls, currentTime, duration, isSliderMode, categoria, channelIndex, isEnded
    });

    useEffect(() => {
        stateRef.current = {
            paused, isCannotReproduce, useInternalTimer, showControls, modalVisible, showSettings, showChannels, showNextEpisode, showNotifactionMessage, showRemoteControls, currentTime, duration, isSliderMode, categoria, channelIndex, isEnded
        };
    });

    // Efecto para vincular la navegación explicita
    useEffect(() => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        // Timeout para asegurar que los componentes estén montados
        const timer = setTimeout(() => {
            let playTag, sliderTag, prevTag, listTag, aspectTag, speedTag, nextTag;

            // Si las referencias de los componentes existen, encuentra sus etiquetas
            if (btnPlayRef.current) playTag = findNodeHandle(btnPlayRef.current);
            if (sliderRef.current) sliderTag = findNodeHandle(sliderRef.current);
            if (btnPrevRef.current) prevTag = findNodeHandle(btnPrevRef.current);
            if (btnListRef.current) listTag = findNodeHandle(btnListRef.current);
            if (btnAspectRef.current) aspectTag = findNodeHandle(btnAspectRef.current);
            if (btnSpeedRef.current) speedTag = findNodeHandle(btnSpeedRef.current);
            if (btnNextRef.current) nextTag = findNodeHandle(btnNextRef.current);

            // Asigna las etiquetas de los componentes
            setFocusTags({ play: playTag, slider: sliderTag, prev: prevTag, list: listTag, aspect: aspectTag, speed: speedTag, next: nextTag });
        }, 100);

        return () => clearTimeout(timer);
    }, [showControls, isLoading, isSliderMode]);

    // useEffect para destruir/reaundar el temporizador de los Controles
    useEffect(() => {
        if (isSliderMode) if (controlTimeout.current) clearTimeout(controlTimeout.current); // Si el Modo Slider está activo, destruye cualquier temporizador
        else if (showControls) resetTimers(); // Si el Modo Slider está desactivado y se están mostrando los Controles, reanuda el temporizador            
    }, [isSliderMode, showControls]);

    // Función centralizada para reiniciar los temporizadores que ocultan los controles
    const resetTimers = useCallback(() => {
        const state = stateRef.current;

        // Controles Locales
        if (state.showControls && !state.modalVisible && !state.showSettings && !state.showChannels && !state.showNextEpisode) {
            if (controlTimeout.current) clearTimeout(controlTimeout.current);

            // Solo activa el temporizador si el Modo Slider está desactivado y el video aún no se ha terminado de reproducir
            if (!state.isSliderMode && !state.isEnded) {
                controlTimeout.current = setTimeout(() => {
                    if (!state.showNotifactionMessage) hideMessage();
                    setShowControls(false);
                }, 4000);
            }
        }

        // Controles Remotos (Cast)
        /*if (state.showRemoteControls) {
            if (remoteControlTimeout.current) clearTimeout(remoteControlTimeout.current);
            remoteControlTimeout.current = setTimeout(() => {
                setShowRemoteControls(false);
            }, 4000);
        }*/
    }, []);

    // useEffect para interceptar los botones fisicos del control de TV
    useEffect(() => {
        if (!Platform.isTV) return; // Si no es TV, no hace nada

        // Escucha cualquier botón que se presione en el control remoto
        KeyEvent.onKeyDownListener((keyEvent) => {
            const state = stateRef.current;

            // Si los Controles, Modales y Paneles están ocultos...
            if (!state.showControls && !state.modalVisible && !state.showSettings && !state.showChannels && !state.showNextEpisode) {
                if (keyEvent.keyCode === 19 || keyEvent.keyCode === 20) { // 19 = Flecha Arriba, 20 = Flecha Abajo
                    showTemporarilyControls(); // Muestra los Controles
                } else if (keyEvent.keyCode === 21 || keyEvent.keyCode === 22) { // 21 = Flecha Izquierda, 22 = Flecha Derecha

                    if (tipo !== 'live') { // Si es una pelicula/episodio...
                        if (!state.isCannotReproduce && !state.useInternalTimer) { // Si el video se puede reproducir y no está usando el temporizador interno...
                            setIsSliderMode(true); // Activa el Modo Slider
                            showTemporarilyControls(); // Muestra los Controles
                        } else showToast("¡Progreso deshabilitado! No es posible avanzar ni retroceder en la reproducción", 3); // Si no, muestra el mensaje

                        return; // Sale de la función
                    }

                    if (keyEvent.keyCode === 21) // Flecha Izquierda
                        handlePrevious(); // Retrocede al canal anterior
                    else // Flecha Derecha
                        handleNext(); // Avanza al siguiente canal
                }
            }
            // Si los Controles están visibles y el Modo Slider está activo...
            else if (state.showControls && state.isSliderMode) {
                if (keyEvent.keyCode === 19 || keyEvent.keyCode === 20) { // Si se presiona la Flecha Arriba (19) o la Flecha Abajo (20)...
                    setIsSliderMode(false); // Desactiva el Modo Slider
                    setTimeout(() => {
                        resetTimers(); // Reinicia el temporizador de los Controles
                    }, 100); // Pequeño retraso para asegurar que el Modo Slider ya esté desactivado
                } else if (keyEvent.keyCode === 21) { // Si se presiona la Flecha Izquierda...
                    setPaused(true); // Pausa mientras se avanza/retocede el video
                    playerRef.current?.seek(Math.max(0, state.currentTime - 15)); // Retrocede 15 segundos en el tiempo de reproducción actual
                } else if (keyEvent.keyCode === 22) { // Si se presiona la Flecha Derecha...
                    setPaused(true); // Pausa mientras se avanza/retocede el video
                    playerRef.current?.seek(Math.min(state.duration, state.currentTime + 15)); // Avanza 15 segundos en el tiempo de reproducción actual
                }
            }
            // Navegación normal con Controles visibles
            else if (state.showControls && !state.isSliderMode) {
                if (keyEvent.keyCode >= 19 && keyEvent.keyCode <= 22) { // Si se presiona alguna Flecha...
                    resetTimers(); // Reinicia el temporizador de los Controles
                }
            }
        });

        return () => {
            // Limpieza al desmontar el componente
            KeyEvent.removeKeyDownListener();
        };
    }, [resetTimers]);

    // PanResponder para detectar los gestos táctiles en teléfonos
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponderCapture: () => {
                if (!Platform.isTV) resetTimers();
                return false;
            },
            onMoveShouldSetPanResponderCapture: () => {
                if (!Platform.isTV) resetTimers();
                return false;
            },
        })
    ).current;

    // useEffect para manejar el Enter de TV cuando es un canal
    useEffect(() => {
        // Si el dispositivo es TV, el contenido es un canal y no es el montaje inicial (0)...
        if (Platform.isTV && tipo === 'live' && triggerControls > 0) {
            const state = stateRef.current;

            // Si hay menús abiertos, ignora el Enter
            if (state.modalVisible || state.showSettings || state.showChannels || state.showNextEpisode) return;

            // Manejo si está transmitiendo (Cast)
            /*if (isCasting) {
                if (state.showRemoteControls) {
                    setShowRemoteControls(false);
                    if (remoteControlTimeout.current) clearTimeout(remoteControlTimeout.current);
                } else {
                    setShowRemoteControls(true);
                    if (remoteControlTimeout.current) clearTimeout(remoteControlTimeout.current);
                    remoteControlTimeout.current = setTimeout(() => setShowRemoteControls(false), 4000);
                }
                return;
            }*/

            // Manejo normal del Reproductor
            if (!state.showControls) { // Si los Controles están ocultos...
                if (state.paused) setPaused(false); // Si está pausado el video, lo reanuda
                showTemporarilyControls(); // Muestra los Controles
            } else { // Si los Controles están visibles...
                setShowControls(false); // Oculta los Controles
                if (controlTimeout.current) clearTimeout(controlTimeout.current); // Si existe algún temporizador, lo destruye
                if (!state.showNotifactionMessage) hideMessage();
            }
        }
    }, [triggerControls, isCasting]);

    // useEffect para guardar el tiempo de reproducción y limpiar todos los Timeouts e Intervals al salir del reproductor
    useEffect(() => {
        // La función de limpieza se ejecuta solo cuando el componente se desmonta
        return () => {
            savePlaybackTime(latestTime.current);

            clearTimeout(liveVistoTimer.current);
            clearInterval(countdownTimer.current);
            clearTimeout(bufferTimeout.current);
            clearTimeout(controlTimeout.current);
            clearTimeout(remoteControlTimeout.current);
            clearTimeout(lockTimeout.current);
        };
    }, []);

    // useEffect que sincroniza la referencia instantánea del indice del canal con el prop del padre
    useEffect(() => {
        localChannelIndex.current = channelIndex;
    }, [channelIndex]);

    useEffect(() => {
        fullScreenRef.current = fullScreen; // Mantiene actualizada la referencia del tamaño de pantalla cada vez que cambia
        hideMessage(); // Oculta los mensajes de notificación cada vez que el tamaño de pantalla cambia para evitar mostrarlos con estilos incorrectos
    }, [fullScreen]);

    useEffect(() => {
        if (tipo === 'live' || (prevContentId.current !== contenido[idKey])) {
            setMainLinkFailed(false); // Cada vez que el contenido cambia, resetea el estado de 'link fallido' para que SIEMPRE intente el link principal primero
            setIsLoading(true); // Se asegura de que el 'loading' se muestre, ya que cargará un nuevo contenido
            setIsInitialLoad(true); // Se reinicia al cambiar contenido
            setIsEnded(false); // Se asegura de que 'isEnded' sea falso cada vez que se cambia el contenido
            setPaused(false); // Se asegura de que 'paused' sea falso cada vez que se cambia el contenido
            setPausedByFocusLoss(false); // Se asegura de que 'pausedByFocusLoss' sea falso cada vez que se cambia el contenido
            setIsCannotReproduce(false); // Se asegura de que 'isCannotReproduce' sea falso cada vez que se cambia el contenido
            setRetryCount(0); // Resetea el contador de reintentos
            clearTimeout(bufferTimeout.current); // Limpia cualquier temporizador de "búfer"
            setSourceKey(prev => prev + 1); // Fuerza la recarga del componente Video con una nueva llave
            setShowNotifactionMessage(false); // Indica que ya no se debe mostrar el mensaje de notificación
            hideMessage(); // Oculta cualquier mensaje de notificación anterior
        }

        switch (tipo) {
            case 'live':
                cambiarCanal(contenido);
                setBackground(contenido.stream_icon);
                setImageError(false);
                break;
            case 'vod':
                const imagen = contenido.backdrop_path ? `https://image.tmdb.org/t/p/original${contenido.backdrop_path}` : '';
                setBackground(imagen);
                prevContentId.current = contenido.stream_id;
                break;
            case 'series':
                setBackground(contenido.backdrop);
                // Resetea los estados del "siguiente episodio" solo si se ha cambiado de episodio
                if (prevContentId.current !== contenido.episode_id) {
                    isShowingNextPanel.current = false;
                    setHasCanceledNextEpisode(false);
                    setShowNextEpisode(false);
                    clearInterval(countdownTimer.current);
                }
                // Actualiza la referencia para el próximo cambio de contenido
                prevContentId.current = contenido.episode_id;
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
            if (showControls) { // Si los Controles están visibles...
                if (isSliderMode) { // Si el Modo Slider está activo
                    setIsSliderMode(false); // Desactiva el Modo Slider
                    setTimeout(() => {
                        resetTimers(); // Reinicia el temporizador de los Controles
                    }, 100); // Pequeño retraso para asegurar que el Modo Slider ya esté desactivado
                } else { // Si el Modo Slider está desactivado...
                    if (isEnded) handleBack(); // Si ya terminó de reproducirse el video, procede con la navegación normal del Botón Regresar
                    else setShowControls(false); // Si el video aún no termina, oculta los Controles
                }
            }
            else if (showSettings) { // Si el panel de ajustes está abierto...
                setShowSettings(false); // Cierra el panel de ajustes
                if (Platform.isTV && isEnded) setShowControls(true); // Si es TV y el video ya terminó, muestra los Controles
            }
            else if (showChannels) setShowChannels(false); // Si el panel de canales está abierto, lo cierra
            else if (showNextEpisode) handleCancelNextEpisode(); // Si el panel de siguiente episodio está abierto, lo cierra
            else handleBack(); // Navegación normal del Botón Regresar cuando todo está oculto

            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, [fullScreen, showControls, isSliderMode, showChannels, showSettings, showNextEpisode]);

    // useEffect para la cuenta regresiva del panel de 'Siguiente Episodio'
    useEffect(() => {
        if (showNextEpisode) {
            // Inicia el temporizador
            countdownTimer.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 0) {
                        // Se acabó el tiempo
                        clearInterval(countdownTimer.current);

                        // Llama a la función estabilizada (se envuelve en setTimeout para sacarla del ciclo de renderizado actual)
                        setTimeout(() => {
                            handlePlayNow();
                        }, 0);

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

    // useEffect para el "cronómetro" interno cuando la duración no es válida
    useEffect(() => {
        let interval = null;

        // Inicia el temporizador solo si useInternalTimer está activo (duración desconocida), no está pausado, no está cargando y el video no ha fallado
        if (useInternalTimer && !paused && !isLoading && !isCannotReproduce) {
            interval = setInterval(() => {
                // Incrementa el tiempo actual en 1 cada segundo
                setCurrentTime(prevTime => prevTime + 1);
            }, 1000);
        }

        // Función de limpieza que se ejecuta cuando el componente se desmonta o cuando cualquiera de las dependencias cambia
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [useInternalTimer, paused, isLoading, isCannotReproduce]);

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
                // Si ya había una conexión (no es el cast inicial) y el 'contenido' cambia, significa que el usuario cambió de canal
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
                contentUrl: mainLinkFailed ? contenido.aux_link : contenido.link,
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

        if (tipo !== 'live' && timeToSave > 0) {
            const time = timeToSave.toString();
            if (tipo === 'vod') {
                updateProps(tipo, false, contenido.stream_id, { playback_time: time });
            } else { // 'series', para un episodio
                updateEpisodeProps(contenido.stream_id, contenido.temporada, contenido.episode_id, 'playback_time', time);
            }
        }
    }, [contenido, tipo, updateEpisodeProps, updateProps]);

    const showTemporarilyControls = () => {
        const state = stateRef.current;
        if (state.modalVisible || state.showSettings || state.showChannels || state.showNextEpisode) return;

        setShowControls(true);
        if (controlTimeout.current) clearTimeout(controlTimeout.current);

        // Si el Modo Slider está desactivado y el video aún no se ha terminado de reproducir...
        if (!state.isSliderMode && !state.isEnded) {
            controlTimeout.current = setTimeout(() => {
                if (!state.showNotifactionMessage) hideMessage();
                setShowControls(false);
            }, 4000);
        }
    };

    const showTemporarilyRemoteControls = () => {
        setShowRemoteControls(true);
        if (remoteControlTimeout.current) clearTimeout(remoteControlTimeout.current);
        remoteControlTimeout.current = setTimeout(() => setShowRemoteControls(false), 4000);
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

    const showPanelNetxEpisode = () => {
        isShowingNextPanel.current = true; // Marca como verdadera la bandera para ya no entrar en esta sección
        setShowControls(false); // Oculta los controles
        setCountdown(5); // Reinicia la cuenta regresiva a 5
        setShowNextEpisode(true); // Muestra el panel
    };

    // Función para reiniciar el video
    const handleRestartVideo = () => {
        setCurrentTime(0);
        playerRef.current?.seek(0);
    };

    // Función para Play/Pause en el reproductor local
    const togglePlayPause = () => {
        setPaused(prev => !prev);

        // Si ya terminó el video pero no se cierra el reproductor, se reinicia el video
        if (isEnded) handleRestartVideo();
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

    // Función para adelantar/retroceder el canal/tiempo de reproducción en Movíl
    const toggleNextPrevMobile = (option) => {
        if (tipo === 'live') { // Si es un canal...
            if (option === 1) handlePrevious(); // Si es la primera opción, llama a la función para ir al canal anterior
            else handleNext(); // Es es la segunda opción, llama a la función para ir al siguiente canal
        } else if (!isLoading && !isCannotReproduce && !useInternalTimer) { // Si no está cargando y se puede reproducir y no está usando el temporizador interno...
            if (option === 1) seekTo(currentTime - 10); // Si es la primera opción, retrocede 10 segundos en el tiempo de reproducción
            else seekTo(currentTime + 10); // Si es la segunda opción, avanza 10 segundos en el tiempo de reproducción
        } else showToast("No es posible avanzar ni retroceder en la reproducción", 3); // Si no, muestra el mensaje
    };

    // Función para manejar la Barra de Progreso en TV
    const toggleWrapperSlider = () => {
        if (isCannotReproduce || useInternalTimer) { // Si ya no se puede reproducir el video o se está usando el temporizador interno...
            showToast("¡Progreso deshabilitado! No es posible avanzar ni retroceder en la reproducción", 3); // Muestra el mensaje
            return; // Sale de la función
        }

        if (isSliderMode) { // Si el Modo Slider está activo...
            setIsSliderMode(false); // Desactiva el Modo Slider
            setPaused(false); // Reanuda la reproducción
            setTimeout(() => {
                resetTimers(); // Reinicia el temporizador de los Controles
            }, 100); // Pequeño retraso para asegurar que el Modo Slider ya esté desactivado
        } else setIsSliderMode(true); // Si el Modo Slider está desactivado, lo activa
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

    // Función que centraliza la lógica de reintento
    const performRetry = useCallback(() => {
        let toastMessage = '';

        // Usar la actualización funcional para OBTENER y ESTABLECER el estado más reciente de 'retryCount'
        setRetryCount(currentCount => {
            const newCount = currentCount + 1; // Obtiene el valor más reciente

            if (newCount > 5) {
                // --- FALLO TOTAL ---
                console.log('Fallaron todos los reintentos de búfer.');
                setIsLoading(false);
                setIsCannotReproduce(true);
                toastMessage = `¡ERROR! No se pudo reproducir ${tipo === 'live' ? 'el canal' : tipo === 'vod' ? 'la película' : 'el episodio'}`, 3;
                setShowNotifactionMessage(true);
                setTimeout(() => {
                    setShowNotifactionMessage(false);
                }, 4000);
                if (tipo === 'series') {
                    setTimeout(() => {
                        showPanelNetxEpisode();
                    }, 100); // Muestra el modal de siguiente episodio con 100ms de retraso
                }
                return newCount; // Actualiza el estado al nuevo contador

            } else {
                // --- LÓGICA DE REINTENTO ESCALONADO ---
                toastMessage = `Error de reproducción, reintentando conexión (${newCount}/5)`, 3;
                setShowNotifactionMessage(true); // Muestra el mensaje de reintento

                if (newCount <= 3) {
                    // Intento 1, 2, 3: "Soft Reload" (Seek)
                    console.log(`Reintento (Suave) #${newCount}: Buscando a ${latestTime.current}`);
                    if (playerRef.current) {
                        playerRef.current.seek(latestTime.current);
                    }

                    // Re-arma el temporizador para la próxima comprobación
                    bufferTimeout.current = setTimeout(performRetry, 5000);

                } else {
                    // Intento 4, 5: "Hard Reload" (Source Key)
                    console.log(`Reintento (Duro) #${newCount}: Recargando source key`);
                    setSourceKey(prev => prev + 1);
                }

                return newCount; // Actualiza el estado al nuevo contador
            }
        });

        if (toastMessage) {
            showToast(toastMessage, 3);
        }
    }, [tipo]);

    const handleBack = () => {
        if (!showNotifactionMessage) {
            hideMessage();
        }
        if (tipo === 'live') {
            setFullScreen(false);
        } else {
            setMostrar(false);
        }
    };

    const handleAudioFocusChange = ({ hasAudioFocus }) => {
        if (!hasAudioFocus) {
            // PIERDE EL FOCO
            // Si el video no está pausado por el usuario...
            if (!paused) {
                console.log("Audio focus perdido. Pausando video...");
                setPaused(true);
                setPausedByFocusLoss(true); // Marca que la app pausó el video
            }
        } else {
            // RECUPERA EL FOCO
            // Si la app pausó el video (y no el usuario), lo reanuda
            if (pausedByFocusLoss) {
                console.log("Audio focus recuperado. Reanudando video...");
                setPaused(false);
                setPausedByFocusLoss(false); // Limpia la marca
            }
        }
    };

    // Método para manejar el buffer
    const handleBuffer = useCallback(({ isBuffering }) => {
        clearTimeout(bufferTimeout.current); // Limpia siempre el temporizador anterior

        if (isBuffering) { // Si el video se detuvo a cargar...
            setIsLoading(true); // Indica que el video está cargando
            setIsEnded(false); // Indica que el video no ha terminado

            // Inicia un temporizador, si sigue en búfer después de 5 segundos, llama a la lógica de reintento
            bufferTimeout.current = setTimeout(performRetry, 5000);
        } else { // Si el video ya cargó...
            setIsLoading(false); // Indica que el video se reanudó

            // Si estaba mostrando un mensaje de reintento, lo oculta
            if (retryCount > 0) {
                setRetryCount(0); // Resetea el contador
                setShowNotifactionMessage(false); // Indica que ya no se debe mostrar el mensaje
                hideMessage(); // Oculta el mensaje inmediatamente
            }
        }
    }, [performRetry, retryCount]);

    const handleEnd = () => {
        // Si es una película o episodio...
        if (tipo !== 'live') {
            savePlaybackTime(duration); // Guarda explícitamente la duración total como el tiempo de reproducción
            setPaused(true); // Pausa el reproductor en la UI
            setIsEnded(true); // Indica que el video ha terminado
            showTemporarilyControls(); // Muestra los Controles
        }
    };

    const handleVideoError = (error) => {
        console.log('Error de Video:', error);
        const code = error?.error?.errorCode ?? '';
        let toastMessage = '';

        // Detiene cualquier lógica de reintento de búfer si hay un error fatal
        clearTimeout(bufferTimeout.current);
        setRetryCount(0);
        setShowNotifactionMessage(false);

        // Si el link principal AÚN NO HA FALLADO...
        if (!mainLinkFailed) {
            console.log('Falló el link principal. Intentando con el auxiliar...');

            // Marca que falló, para que el próximo render use el aux_link
            setMainLinkFailed(true);

            // Mantiene el 'loading' visible, porque va a reintentar
            setIsLoading(true);
        } else {
            // Si llega aquí, es porque el aux_link TAMBIÉN falló
            console.log('Falló también el link auxiliar.');
            setIsLoading(false); // Deja de cargar (para evitar bucles)
            setIsCannotReproduce(true); // Establece que el contenido no se puede reproducir

            // Asigna el mensaje de error
            switch (code) {
                case '22001':
                    toastMessage = '¡Error de red! Revise su conexión a Internet';
                    break;
                case '22004':
                    toastMessage = `¡ERROR! No se pudo reproducir ${tipo === 'live' ? 'el canal' : tipo === 'vod' ? 'la película' : 'el episodio'}`;
                    break;
                case '23003':
                    toastMessage = `${tipo === 'live' ? 'Canal' : tipo === 'vod' ? 'Película' : 'Episodio'} no disponible por el momento, intente luego`;
                    break;
                case '24001':
                    toastMessage = '¡Error de reproducción! Pista de audio no soportada';
                    break;
                default:
                    toastMessage = `¡ERROR! No se pudo reproducir ${tipo === 'live' ? 'el canal' : tipo === 'vod' ? 'la película' : 'el episodio'}`;
                    break;
            }

            // Muestra y oculta el mensaje de error
            showToast(toastMessage, 3);
            setShowNotifactionMessage(true);
            setTimeout(() => {
                setShowNotifactionMessage(false);
            }, 4000);
            if (tipo === 'series') {
                setTimeout(() => {
                    showPanelNetxEpisode();
                }, 100); // Muestra el panel de siguiente episodio con 100ms de retraso
            }
        }
    };

    const handleLoad = (data) => {
        setIsLoading(false); // Indica que el video cargó y se debe ocultar el spinner
        setIsInitialLoad(false); // Indica que ya no es la carga inicial del video

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

        let startTime = 0; // Variable para el tiempo de inicio

        if (data.duration <= 0) {
            const duracion = tipo !== 'live' ? (data.duration > 0 ? data.duration : Number(tipo === 'vod' ? (contenido.episode_run_time * 60) : contenido.episode_run_time)) : 0;
            setDuration(duracion);
            if (tipo !== 'live') {
                console.log('Duración desconocida detectada. Activando cronómetro interno.');
                setCurrentTime(0); // Inicia el cronómetro en 0
                setUseInternalTimer(true); // Activa el timer del useEffect
            }
        } else {
            setUseInternalTimer(false); // Desactiva el timer del useEffect

            // Usa la duración válida del video
            const duracionValida = data.duration;
            setDuration(duracionValida);

            startTime = parseFloat(contenido.playback_time); // Convierte el string de Realm a número

            // Si la duración es válida y el porcentaje de reproducción es igual o mayor a 99%, reinicia el video
            // Usa la duración del objeto 'contenido' porque no siempre es la misma con 'data.duration' y la barra de progreso trabaja con la de 'contenido'
            if (duracionValida > 0 && tipo === 'vod' && Number(contenido.episode_run_time) > 0) {
                if (startTime / (Number(contenido.episode_run_time) * 60) >= 0.99) {
                    startTime = 0;
                }
            }
            if (duracionValida > 0 && tipo === 'series' && contenido.episode_run_time > 0) {
                if (startTime / contenido.episode_run_time >= 0.99) {
                    startTime = 0;
                }
            }

            if (startTime > 0 && playerRef.current) {
                playerRef.current.seek(startTime); // Salta al tiempo guardado para intentar reanudar la reproducción
            }

            setCurrentTime(startTime);
            lastSaveTime.current = startTime; // Sincroniza el último tiempo guardado
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

            return;
        } else {
            isVideoPlaying.current === true; // Avisa que la pelicula o episodio ya ha cargado
        }
    };

    const handleLoadStart = () => {
        setIsLoading(true);
    };

    const handleProgress = ({ currentTime: reportedTime }) => {
        // Si el id es diferente, el contenido cambió y se debe actualizar su fecha de visualización
        if (idContenido.current !== contenido.stream_id) {
            const fecha = new Date(); // Obtiene la fecha (tiempo) actual 
            updateProps(tipo, false, contenido.stream_id, { fecha_visto: fecha }); // Actualiza le propiedad 'fecha_visto' con la fecha actual
            idContenido.current = contenido.stream_id; // Actualiza la referencia para el próximo cambio de contenido
        }

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

        let reliableCurrentTime; // Variable para el tiempo fiable

        // Si está usando el temporizador interno, significa que parte de su información es inválida y 'currentTime' todavía será 0 la unica vez que se ejecutará esta sección de código...
        if (useInternalTimer) {
            /// Lee el valor actual del estado (que viene del cronómetro)
            reliableCurrentTime = currentTime + 0.021; // Le suma una cantidad muy pequeña de tiempo para que sea mayor a 0 y se marqué como vista
        } else {
            // El tiempo del evento es fiable, así que se actualiza el estado con él
            setCurrentTime(reportedTime);
            reliableCurrentTime = reportedTime;
        }

        latestTime.current = reliableCurrentTime;

        if (tipo === 'series') {
            onProgressUpdate(reliableCurrentTime, contenido.episode_id);

            // Lógica para el manejo del panel de 'Siguiente Episodio'
            if (
                contenido.episode_run_time > 0 &&
                (reliableCurrentTime / contenido.episode_run_time) >= 0.99 && // Condición: 99% completado
                !isShowingNextPanel.current &&                            // La bandera indica que no se está mostrando ya
                !hasCanceledNextEpisode &&                     // El usuario no lo ha cancelado
                (idxEpisode + 1) < episodios.length          // No es el último episodio
            ) {
                showPanelNetxEpisode(); // Muestra el panel del siguiente episodio
            }
        }

        if (tipo === 'vod') {
            onProgressUpdate(reliableCurrentTime);
        }

        const SAVE_INTERVAL = 15; // Guardar cada 15 segundos

        // Comprueba si ha pasado suficiente tiempo desde el último guardado
        if (Math.abs(reliableCurrentTime - lastSaveTime.current) > SAVE_INTERVAL) { // Se usa valor absoluto porque lo importante no es la dirección (atrás o adelante), sino la magintud del salto en el tiempo
            savePlaybackTime(reliableCurrentTime);
            lastSaveTime.current = reliableCurrentTime; // Actualiza el último tiempo de guardado
        }
    };

    // Método para manejar los cambios de estado del video (está reproduciendose o no)
    const handlePlaybackState = ({ isPlaying }) => {
        // Si el contenido dejó de reproducirse, no está cargando, no está en pausa y si es una pelicula o episodio (especialmente si ya tiene un tiempo guardado), ya inició/reanudó la reproducción...
        if (!isPlaying && !isLoading && !paused && (tipo === 'live' || isVideoPlaying.current)) {
            // Activa 'isLoading' como guardia para prevenir que se vuelva a ejecutar este bloque de código, cancelando la primera ejecución
            setIsLoading(true);
            console.log('Imagen congelada');
            clearTimeout(bufferTimeout.current); // Limpia siempre el temporizador anterior

            const newCount = retryCount + 1; // Lee el estado actual
            setRetryCount(newCount);
            showToast(`Error de reproducción, reintentando conexión (${newCount}/5)`, 3);
            setShowNotifactionMessage(true); // Muestra el mensaje de reintento

            // Inicia un temporizador, si sigue sin avanzar la reproducción después de 3 segundos, hace una 'recarga forzada'
            bufferTimeout.current = setTimeout(() => {
                console.log(`Reintento (Duro) #${newCount}: Recargando source key`);
                setSourceKey(prev => prev + 1);
            }, 3000);
        }
    };

    const seekTo = (time) => {
        // Si se está usando el temporizador interno, sigfinica que su duración y tiempo actual es inválido...
        if (useInternalTimer) {
            setCurrentTime(0); // Asigna 0 porque al ser inválida parte de su información, el video se reinicia
        }

        if (Array.isArray(time)) {
            playerRef.current?.seek(time[0]);

        } else {
            playerRef.current?.seek(time);
        }
    };

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
    const handlePrevious = useCallback(() => {
        const state = stateRef.current;
        if (!state.categoria || !state.categoria.canales) return;

        const len = state.categoria.canales.length;
        if (len === 0) return;

        const newIndex = (localChannelIndex.current - 1 + len) % len; // Fórmula para retroceder y dar la vuelta al llegar al principio
        localChannelIndex.current = newIndex; // Actualiza en memoria inmediatamente para el siguiente clic
        onContentChange(state.categoria, state.categoria.canales[newIndex]); // Pasa los nuevos argumentos a la función para cambiar de canal
    }, [onContentChange]);

    // Función para ir al siguiente canal
    const handleNext = useCallback(() => {
        const state = stateRef.current;
        if (!state.categoria || !state.categoria.canales) return;

        const len = state.categoria.canales.length;
        if (len === 0) return;

        const newIndex = (localChannelIndex.current + 1) % len; // Fórmula para avanzar y dar la vuelta al llegar al final
        localChannelIndex.current = newIndex; // Actualiza en memoria inmediatamente para el siguiente clic
        onContentChange(state.categoria, state.categoria.canales[newIndex]); // Pasa los nuevos argumentos a la función para cambiar de canal
    }, [onContentChange]);

    // Función para controlar el cierre del modal de episodios
    function handleCloseModal() {
        setModalVisible(false);
        if (Platform.isTV && isEnded) setShowControls(true); // Si es TV y el video ya terminó, muestra los Controles
    }

    // Función para controlar el cierre del panel de ajustes
    function handleClosePanelSettings() {
        setShowSettings(false);
        if (Platform.isTV && isEnded) setShowControls(true); // Si es TV y el video ya terminó, muestra los Controles
    }

    // Función para cambiar al siguiente episodio
    const nextEpisode = useCallback(() => {
        // Se asegura de que no sea el último episodio de la temporada
        if ((idxEpisode + 1) < episodios.length) {
            onContentChange(episodios[idxEpisode + 1]);
        }

        // Lógica de reseteo de variables del panel de 'Siguiente Episodio'
        isShowingNextPanel.current = false;
        setShowNextEpisode(false);
        clearInterval(countdownTimer.current);
        setHasCanceledNextEpisode(false);
    }, [idxEpisode, episodios, onContentChange]);

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

    const showToast = (mensaje, numId) => {
        if (numId !== 3) {
            Vibration.vibrate();
        }

        showMessage({
            message: mensaje,
            type: 'default',
            duration: numId === 3 ? 3000 : 1000,
            position: numId === 3 ? 'bottom' : 'top',
            backgroundColor: '#EEE',
            color: '#000',
            style: numId === 1 ? styles.flashMessage1 : numId === 2 ? styles.flashMessage2 : fullScreenRef.current ? styles.flashMessage3 : styles.flashMessage3_small,
            titleStyle: { fontSize: numId === 3 ? 16 : 14 }
        });
    };

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
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
                        if (showSettings) { // Si el Panel de Ajustes está visible...
                            setShowSettings(false); // Oculta el Panel de Ajustes
                            return; // Sale de la función
                        }
                        if (showChannels) { // Si el Panel de Canales está visible...
                            setShowChannels(false); // Oculta el Panel de Canales
                            return; // Sale de la función
                        }
                        if (!fullScreen) setFullScreen(true); // Si la Pantalla está chica, la hace completa
                        if (isScreenLock) { // Si la Pantalla está bloqueada
                            toggleIconLock(); // Muestra la funcionalidad de Pantalla Bloqueada
                            return; // Sale de la función
                        }
                        if (Platform.isTV) setPaused(prev => !prev); // Si es TV, pausa/reanuda el video
                        if (!showControls) showTemporarilyControls(); // Si los Controles están ocultos, los muestra
                        else { // Si los Controles están visibles...
                            setShowControls(false); // Oculta los Controles
                            if (controlTimeout.current) clearTimeout(controlTimeout.current); // Si existe algún temporizador, lo destruye
                        }
                    }}
                >
                    <View style={styles.container}>
                        <Video
                            key={sourceKey}
                            ref={playerRef}
                            source={{
                                uri: mainLinkFailed ? contenido.aux_link : contenido.link,
                                headers: {
                                    'User-Agent': customUserAgent
                                }
                            }}
                            style={styles.videoPlayer}
                            controls={false}
                            paused={isCannotReproduce || paused}
                            rate={playbackRate}
                            resizeMode={resizeMode.modo}
                            selectedAudioTrack={selectedAudioTrack}
                            selectedTextTrack={selectedTextTrack}
                            selectedVideoTrack={selectedVideoTrack}
                            onAudioFocusChanged={handleAudioFocusChange}
                            onBuffer={handleBuffer}
                            onEnd={handleEnd}
                            onError={handleVideoError}
                            onLoad={handleLoad}
                            onLoadStart={handleLoadStart}
                            onProgress={handleProgress}
                            onPlaybackStateChanged={handlePlaybackState}
                        />

                        {/* Cuando un canal está en pantalla chica o cuando cualquier tipo de contenido tiene la pantalla bloqueada... */}
                        {((tipo === 'live' && !fullScreen) || (fullScreen && isScreenLock)) && (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {/* Muestra la animación de carga, el icono de reproducción deshabilitada o el botón de 'play' */}
                                {isLoading ? (
                                    <ActivityIndicator size={50} color="#fff" />
                                ) : isCannotReproduce ? (
                                    <Icon3 name='play-disabled' size={60} color="#fff" />
                                ) : paused ? (
                                    <RippleButton
                                        secondaryStyle={{ padding: 10 }}
                                        iconLib={Icon4}
                                        name='play'
                                        size={45}
                                        onPress={togglePlayPause}
                                    />
                                ) : null}
                            </View>
                        )}

                        {/* Entra al bloque solo si la pantalla está completa, si se muestran los controles o está cargando el contendio o no se puede reproducir o está pausado, no está bloqueada y no se muestra el panel de 'Siguiente Episodio'*/}
                        {fullScreen && (showControls || isLoading || isCannotReproduce || paused) && !isScreenLock && !showNextEpisode && (
                            <View style={[styles.overlay, !showControls && { justifyContent: 'center' }]}>
                                {/* Controles de la parte superior */}
                                {showControls && (
                                    <View style={styles.topControls}>
                                        {/* Botón de Regresar */}
                                        <RippleButton
                                            iconLib={Icon}
                                            name="arrow-circle-left"
                                            hasTVPreferredFocus={Platform.isTV && isInitialLoad}
                                            onPress={handleBack}
                                            onLongPress={() => showToast('Regresar', 1)}
                                        />
                                        {/* Nombre del Canal */}
                                        <Text style={styles.title} numberOfLines={1}>{nombre}</Text>
                                        {/* Iconos de la esquina superior derecha */}
                                        <View style={styles.rightIcons}>
                                            {/* Botón de Cast */}
                                            {!Platform.isTV && ( // Solo se muestra para Telefonos
                                                <TouchableOpacity
                                                    style={{ opacity: 0.5 }}
                                                    disabled={true}
                                                >
                                                    {/*<CastButton style={{ width: 26, height: 26, tintColor: 'white' }} />*/}
                                                    <Icon2 name="cast" size={26} color="#fff" />
                                                </TouchableOpacity>
                                            )}
                                            {/* Botón para Bloquear Pantalla */}
                                            {!Platform.isTV && ( // Solo se muestra para Telefonos
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setIsScreenLock(true);
                                                        toggleIconLock();
                                                    }}
                                                    onLongPress={() => showToast('Bloquear Pantalla', 2)}
                                                >
                                                    <Icon name="unlock-alt" size={26} color="#fff" />
                                                </TouchableOpacity>
                                            )}
                                            {/* Botón para Reiniciar el Video */}
                                            {Platform.isTV && tipo !== 'live' && !isEnded && ( // Solo se muestra para peliculas/episodios en TV que ya hayan terminado de reproducirse
                                                <RippleButton
                                                    mainStyle={{ marginRight: '25%' }}
                                                    iconLib={Icon3}
                                                    name="restart-alt"
                                                    onPress={handleRestartVideo}
                                                    onLongPress={() => showToast('Reiniciar', 2)}
                                                />
                                            )}
                                            {/* Botón de Ajustes */}
                                            <RippleButton
                                                iconLib={Icon2}
                                                name="cog-outline"
                                                onPress={() => {
                                                    setShowControls(false);
                                                    setShowSettings(true);
                                                }}
                                                onLongPress={() => showToast('Ajustes', 2)}
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Controles de la parte de en medio */}
                                <View style={styles.middleControls}>
                                    {/* Botón para ir al canal anterior / retroceder 10 segundos */}
                                    {!Platform.isTV && showControls && ( // Se muestra solo para Telefonos
                                        <RippleButton
                                            mainStyle={{ opacity: (tipo !== 'live' && (isLoading || isCannotReproduce || useInternalTimer)) ? 0.5 : 1 }}
                                            iconLib={Icon3}
                                            name={tipo === 'live' ? "skip-previous" : "replay-10"}
                                            size={60}
                                            rippleColor="#FFFFFF00"
                                            onPress={() => toggleNextPrevMobile(1)}
                                        />
                                    )}

                                    {/* Icono/Botón central dinámico */}
                                    {isLoading ? ( // Se muestra solo cuando está cargando
                                        // Animación de carga
                                        <ActivityIndicator size={50} color="#fff" />
                                    ) : isCannotReproduce ? ( // Se muestra solo si ya no se puede reproducir el stream
                                        // Icono de reproducción deshabilitada
                                        <Icon3 name='play-disabled' size={60} color="#fff" />
                                    ) : (!Platform.isTV && (showControls || paused) && ( // Se muestra solo para Telefonos, con los Controles visibles u ocultos si está en pausa
                                        // Botón de Play/Pausa/Reinicio
                                        <RippleButton
                                            secondaryStyle={{ padding: 10 }}
                                            iconLib={isEnded ? Icon3 : Icon4}
                                            name={isEnded ? 'restart-alt' : paused ? 'play' : 'pause'}
                                            size={isEnded ? 60 : 45}
                                            rippleColor="#FFFFFF00"
                                            onPress={togglePlayPause}
                                        />
                                    ))}

                                    {/* Botón para ir al siguiente canal / avanzar 10 segundos */}
                                    {!Platform.isTV && showControls && ( // Se muestra solo para Telefonos
                                        <RippleButton
                                            mainStyle={{ opacity: (tipo !== 'live' && (isLoading || isCannotReproduce || useInternalTimer)) ? 0.5 : 1 }}
                                            iconLib={Icon3}
                                            name={tipo === 'live' ? "skip-next" : "forward-10"}
                                            size={60}
                                            rippleColor="#FFFFFF00"
                                            onPress={() => toggleNextPrevMobile(2)}
                                        />
                                    )}
                                </View>

                                {/* Controles de la parte inferior */}
                                {showControls && (
                                    <View>
                                        <View style={{ flexDirection: 'row', paddingHorizontal: Platform.isTV ? '3%' : 0, }}>
                                            {/* Botón de Play/Pausa/Reinicio para TV */}
                                            {Platform.isTV && showControls && ( // Se muestra solo para TV
                                                <RippleButton
                                                    ref={btnPlayRef}
                                                    mainStyle={{ marginRight: '2%', opacity: (isLoading || isCannotReproduce) ? 0.25 : 1 }}
                                                    secondaryStyle={{ padding: 2.5 }}
                                                    disabled={isLoading || isCannotReproduce}
                                                    iconLib={isEnded ? Icon3 : Icon4}
                                                    name={isEnded ? 'restart-alt' : paused ? 'play' : 'pause'}
                                                    size={isEnded ? 32 : 26}
                                                    hasTVPreferredFocus={Platform.isTV && !isInitialLoad && !isLoading && !isCannotReproduce && !isSliderMode}
                                                    rippleColor="#FFFFFF00"
                                                    onPress={togglePlayPause}
                                                    nextFocusDown={tipo === 'live' ? focusTags.prev : tipo === 'vod' ? focusTags.aspect : focusTags.list}
                                                    nextFocusLeft={focusTags.play}
                                                    nextFocusRight={tipo === 'live' ? focusTags.prev : focusTags.slider}
                                                />
                                            )}
                                            {/* Barra de Progreso */}
                                            {tipo === 'live' ? ( // Se muestra solo para canales
                                                <View style={styles.bottomControlsLive}>
                                                    <FastImage
                                                        style={styles.imagen}
                                                        source={contenido.stream_icon && !imageError ? {
                                                            uri: contenido.stream_icon,
                                                            priority: FastImage.priority.normal
                                                        } : require('../../assets/icono.png')}
                                                        resizeMode={FastImage.resizeMode.contain}
                                                        onError={() => setImageError(true)}
                                                    />
                                                    <View style={styles.barra} />
                                                </View>
                                            ) : ( // Se muestra para películas y episodios
                                                <View style={styles.bottomControls}>
                                                    {/* Texto que indica el tiempo transcurrido del video */}
                                                    <Text style={styles.time}>{formatTime(currentTime)}</Text>
                                                    {/* Envoltorio de la Barra de Progreso del video */}
                                                    <TouchableNativeFeedback
                                                        ref={sliderRef}
                                                        onPress={toggleWrapperSlider}
                                                        background={Platform.isTV ? TouchableNativeFeedback.Ripple(isSliderMode ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0.3)', false) : undefined}
                                                        useForeground={false}
                                                        hasTVPreferredFocus={Platform.isTV && isSliderMode}
                                                        nextFocusUp={isSliderMode ? focusTags.play : undefined}
                                                        nextFocusDown={isSliderMode ? focusTags.play : tipo === 'vod' ? focusTags.speed : focusTags.aspect}
                                                        nextFocusLeft={isSliderMode ? focusTags.slider : focusTags.play}
                                                        nextFocusRight={focusTags.slider}
                                                    >
                                                        <View
                                                            style={[
                                                                styles.sliderWrapper,
                                                                isSliderMode && Platform.isTV && { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                                                            ]}
                                                        >
                                                            {/* pointerEvents="none" en TV evita que el Slider bloquee el foco del envoltorio */}
                                                            <View style={{ flex: 1 }} pointerEvents={Platform.isTV ? "none" : "auto"}>
                                                                <Slider
                                                                    value={currentTime}
                                                                    minimumValue={0}
                                                                    maximumValue={duration}
                                                                    disabled={isCannotReproduce || useInternalTimer}
                                                                    onSlidingComplete={seekTo}
                                                                    trackStyle={styles.track}
                                                                    thumbStyle={{
                                                                        height: Platform.isTV ? 17.5 : 15,
                                                                        width: Platform.isTV ? 17.5 : 15,
                                                                        backgroundColor: Platform.isTV && isSliderMode ? '#00F' : '#fff'
                                                                    }}
                                                                    minimumTrackTintColor={isSliderMode ? "#FFD700" : "#00c0fe"}
                                                                    maximumTrackTintColor="#888"
                                                                    containerStyle={{ flex: 1 }}
                                                                />
                                                            </View>
                                                        </View>
                                                    </TouchableNativeFeedback>
                                                    {/* Texto que indica la duración del video */}
                                                    <Text style={styles.time}>{formatTime(duration)}</Text>
                                                </View>
                                            )}
                                        </View>
                                        {/* Botón de Canal Anterior */}
                                        <View style={styles.bottomIcons}>
                                            {Platform.isTV && tipo === 'live' && ( // Solo se muestra para canales en TV
                                                <View style={styles.wrapper}>
                                                    <TouchableNativeFeedback
                                                        ref={btnPrevRef}
                                                        onPress={handlePrevious}
                                                        background={focusRipple}
                                                        useForeground={false}
                                                        nextFocusUp={focusTags.play}
                                                        nextFocusLeft={focusTags.play}
                                                        nextFocusRight={focusTags.list}
                                                    >
                                                        <View style={styles.innerContent}>
                                                            <Icon3 name="skip-previous" size={26} color="#fff" style={styles.iconMargin} />
                                                            <Text style={styles.textIcon}>Canal anterior</Text>
                                                        </View>
                                                    </TouchableNativeFeedback>
                                                </View>
                                            )}
                                            {/* Botón de Lista de Canales/Episodios */}
                                            {tipo !== 'vod' && ( // Solo se muestra para canales y episodios
                                                <View style={styles.wrapper}>
                                                    <TouchableNativeFeedback
                                                        ref={btnListRef}
                                                        onPress={() => {
                                                            setShowControls(false);
                                                            if (tipo === 'live') {
                                                                setShowChannels(true);
                                                            } else {
                                                                setModalVisible(true);
                                                            }
                                                        }}
                                                        background={focusRipple}
                                                        useForeground={false}
                                                        nextFocusUp={focusTags.play}
                                                        nextFocusLeft={tipo === 'live' ? focusTags.prev : focusTags.list}
                                                        nextFocusRight={focusTags.aspect}
                                                    >
                                                        <View style={styles.innerContent}>
                                                            <Icon2 name="card-multiple" size={26} color="#fff" style={styles.iconMargin} />
                                                            <Text style={styles.textIcon}>{tipo === 'live' ? 'Lista de canales' : 'Lista de Episodios'}</Text>
                                                        </View>
                                                    </TouchableNativeFeedback>
                                                </View>
                                            )}
                                            {/* Botón de Relación de Aspecto (Proporción) */}
                                            <View style={styles.wrapper}>
                                                <TouchableNativeFeedback
                                                    ref={btnAspectRef}
                                                    onPress={cycleAspectRatio}
                                                    background={focusRipple}
                                                    useForeground={false}
                                                    nextFocusUp={tipo !== 'series' ? focusTags.play : focusTags.slider}
                                                    nextFocusLeft={tipo === 'vod' ? focusTags.play : focusTags.list}
                                                    nextFocusRight={tipo === 'live' ? focusTags.next : focusTags.speed}
                                                >
                                                    <View style={styles.innerContent}>
                                                        <Icon3 name="aspect-ratio" size={26} color="#fff" style={styles.iconMargin} />
                                                        <Text style={styles.textIcon}>Proporción ({resizeMode.nombre})</Text>
                                                    </View>
                                                </TouchableNativeFeedback>
                                            </View>
                                            {/* Botón de Velocidad de Reproducción */}
                                            {tipo !== 'live' && ( // Solo se muestra para películas y episodios
                                                <View style={styles.wrapper}>
                                                    <TouchableNativeFeedback
                                                        ref={btnSpeedRef}
                                                        onPress={cyclePlaybackSpeed}
                                                        background={focusRipple}
                                                        useForeground={false}
                                                        nextFocusUp={focusTags.slider}
                                                        nextFocusLeft={focusTags.aspect}
                                                        nextFocusRight={tipo === 'vod' ? focusTags.speed : focusTags.next}
                                                    >
                                                        <View style={styles.innerContent}>
                                                            <Icon3 name="speed" size={26} color="#fff" style={styles.iconMargin} />
                                                            <Text style={styles.textIcon}>Velocidad ({playbackRate}x)</Text>
                                                        </View>
                                                    </TouchableNativeFeedback>
                                                </View>
                                            )}
                                            {/* Botón de Siguiente Canal/Episodio */}
                                            {((Platform.isTV && tipo === 'live') || tipo === 'series') && ( // Solo se muestra para canales en TV o episodios
                                                <View style={styles.wrapper}>
                                                    <TouchableNativeFeedback
                                                        ref={btnNextRef}
                                                        onPress={tipo === 'live' ? handleNext : nextEpisode}
                                                        disabled={tipo === 'series' && !(idxEpisode + 1 < episodios.length)}
                                                        background={focusRipple}
                                                        useForeground={false}
                                                        nextFocusUp={tipo === 'live' ? focusTags.play : focusTags.slider}
                                                        nextFocusLeft={tipo === 'live' ? focusTags.aspect : focusTags.speed}
                                                        nextFocusRight={focusTags.next}
                                                    >
                                                        <View style={[styles.innerContent, { opacity: tipo === 'series' && !(idxEpisode + 1 < episodios.length) ? 0.5 : 1 }]}>
                                                            <Icon3 name="skip-next" size={26} color="#fff" style={styles.iconMargin} />
                                                            <Text style={styles.textIcon}>{tipo === 'live' ? 'Siguiente canal' : 'Siguiente episodio'}</Text>
                                                        </View>
                                                    </TouchableNativeFeedback>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Botón para Desbloquear Pantalla */}
                        {isScreenLock && showIconLock && fullScreen && ( // Se muestra solo si la pantalla está bloqueada y en fullscreen
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
                    onClose={handleClosePanelSettings}
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
        fontSize: Platform.isTV ? 20 : 18,
        marginLeft: 20,
    },
    rightIcons: {
        flex: 0.20,
        flexDirection: 'row',
        justifyContent: Platform.isTV ? 'flex-end' : 'space-between',
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
    wrapper: {
        borderRadius: 10,
        overflow: 'hidden'
    },
    innerContent: {
        flexDirection: 'row',
        padding: 7.5
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottomControlsLive: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '1%',
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
        textAlign: 'center',
        fontSize: Platform.isTV ? 16 : 14,
    },
    sliderWrapper: {
        flex: 1,
        marginHorizontal: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        height: 35,
        borderRadius: 20
    },
    track: {
        height: Platform.isTV ? 5 : 4,
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
    },
    flashMessage1: {
        width: '12.5%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingTop: 1,
        paddingBottom: 5,
        marginTop: '5.5%',
        marginLeft: 1
    },
    flashMessage2: {
        width: '18.5%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingTop: 1,
        paddingBottom: 5,
        marginTop: '5.5%',
        marginRight: 16
    },
    flashMessage3: {
        width: '50%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: 7.5,
        paddingBottom: 5,
        marginBottom: '15%',
    },
    flashMessage3_small: {
        width: '50%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingTop: 7.5,
        paddingBottom: 5,
        marginBottom: '7.5%',
        marginRight: '5%'
    }
});

export default Reproductor;
