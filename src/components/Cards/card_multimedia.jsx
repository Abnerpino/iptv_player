import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableNativeFeedback, Image, StyleSheet, Animated, ActivityIndicator, Vibration, findNodeHandle, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useXtream } from '../../services/hooks/useXtream';
import ErrorLogger from '../../services/logger/errorLogger';

const CardMultimedia = forwardRef(({ index, navigation, tipo, fondo, onStartLoading, onFinishLoading, onUpdateError, username, hasTVPreferredFocus, lastCard, getFirstCard }, ref) => {
    const { getStreamingByType } = useXtream();
    const [lastUpdateTime, setLastUpdateTime] = useState(null); // Estado para guardar la marca de tiempo (timestamp) de la última actualización
    const [timeAgo, setTimeAgo] = useState('Última actualización: nunca'); // Estado para guardar el texto formateado
    const [isLoading, setIsLoading] = useState(false); // Estado para mostrar/ocultar la barra de progreso
    const [nextFocusIds, setNextFocusIds] = useState({ update: null, main: null }); // Estado para manejar los ids de los componentes para el foco de atención
    const progressAnim = useRef(new Animated.Value(0)).current; // Referencia para la animación
    const mainTouchableRef = useRef(null); // Referencia para el componente principal
    const updateTouchableRef = useRef(null); // Referencia para el botón de actualización

    const imagen = tipo === 'live' ? require('../../assets/tv.png') : (tipo === 'vod' ? require('../../assets/cine.png') : require('../../assets/series.png'));

    // Efecto para vincular la navegación explicita
    useEffect(() => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        // Timeout para asegurar que los elementos estén montados
        const timer = setTimeout(() => {
            let mainTag, updateTag = null;

            if (mainTouchableRef.current && updateTouchableRef.current) {
                mainTag = findNodeHandle(mainTouchableRef.current); // Encuentra la etiqueta del componente principal
                updateTag = findNodeHandle(updateTouchableRef.current); // Encuentra la etiqueta del botón de actualización
                setNextFocusIds({ update: updateTag, main: mainTag }); // Asigna las etiquetas de los componentes
            }
            if (index === 0) {
                getFirstCard('card', mainTag); // Registra la etiqueta del componente principal en el padre
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isLoading]);

    // Efecto para cargar la última fecha de actualización guardada cuando el componente se monta
    useEffect(() => {
        const loadLastUpdateTime = async () => {
            try {
                // Se usa una clave única para cada tipo de tarjeta
                const savedTime = await AsyncStorage.getItem(`@last_update_time_${tipo}`);
                if (savedTime !== null) {
                    setLastUpdateTime(parseInt(savedTime, 10));
                }
            } catch (error) {
                ErrorLogger.log('CardMultimedia - loadLastUpdateTime', error);
            }
        };

        loadLastUpdateTime();
    }, [tipo]); // Se ejecuta si el 'tipo' de la tarjeta cambia

    // Efecto para actualizar el contador de tiempo cada segundo
    useEffect(() => {
        if (lastUpdateTime === null) { // Si nunca se ha actualizado, no se inicia el intervalo
            setTimeAgo('Última actualización: nunca');
            return;
        }

        // Esta función se usará tanto para el cálculo inmediato como para el intervalo
        const updateText = () => {
            const now = new Date().getTime();
            const secondsSinceUpdate = Math.floor((now - lastUpdateTime) / 1000); // Calcula la diferencia en segundos

            if (secondsSinceUpdate < 60) {
                setTimeAgo('Última actualización: ahora');
            } else if (secondsSinceUpdate < 3600) {
                const minutes = Math.floor(secondsSinceUpdate / 60);
                setTimeAgo(`Última actualización: hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
            } else if (secondsSinceUpdate < 86400) {
                const hours = Math.floor(secondsSinceUpdate / 3600);
                setTimeAgo(`Última actualización: hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`);
            } else {
                const days = Math.floor(secondsSinceUpdate / 86400);
                setTimeAgo(`Última actualización: hace ${days} ${days === 1 ? 'día' : 'días'}`);
            }
        };

        // Ejecuta la función una vez de inmediato para que el texto se actualice de "nunca" a "ahora" sin esperar el primer intervalo
        updateText();

        // El intervalo corre cada segundo para detectar el cambio de minuto
        const interval = setInterval(updateText, 1000);

        // Función de limpieza
        return () => clearInterval(interval);

    }, [lastUpdateTime]);

    const handleNavigateToScreen = () => {
        hideMessage();
        navigation.navigate('Seccion', { tipo, username });
    };

    const handleUpdateStreaming = async (flag) => {
        hideMessage();
        setIsLoading(true);
        progressAnim.setValue(0);
        if (flag) onStartLoading?.();

        try {
            // Inicia la primera animación
            Animated.timing(progressAnim, {
                toValue: 0.5,
                duration: 1000,
                useNativeDriver: false,
            }).start();

            // Espera a que la descarga de datos termine
            await getStreamingByType(tipo);

            // Envuelve la animación final en una Promesa explícita para garantizar la espera
            await new Promise((resolve, reject) => {
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: false,
                }).start(result => {
                    if (result.finished) {
                        resolve(); // Avisa que la animación terminó
                    } else {
                        // Si la animación se interrumpe
                        resolve();
                    }
                });
            });

            // Se ejecutan las tareas finales despues de la animación
            setIsLoading(false);
            if (flag) onFinishLoading?.();
            const now = new Date().getTime();
            await AsyncStorage.setItem(`@last_update_time_${tipo}`, now.toString());
            setLastUpdateTime(now);
        } catch (error) {
            // Detiene la carga y resetea la animación
            ErrorLogger.log(`CardMultimedia - handleUpdateStreaming (${tipo})`, error);
            setIsLoading(false);
            progressAnim.setValue(0); // Regresa la barra a 0
            if (flag) onFinishLoading?.(); // Cierra modal de carga global si estaba abierto

            // Decisión de Propagación
            if (flag) {
                // CASO MANUAL (Botón): Notifica al padre explícitamente para que abra el ModalError
                onUpdateError?.(tipo);
            } else {
                // CASO AUTOMÁTICO (Ref): "Relanza" el error para que el try/catch del Menú lo capture y pueda continuar con el siguiente item del bucle
                throw error;
            }
        }
    };

    // screen_menu ahora podrá llamar a `ref.current.triggerUpdateEffects()`
    useImperativeHandle(ref, () => ({
        triggerUpdateEffects: () => handleUpdateStreaming(false)
    }));

    // Interpola el valor animado para que se traduzca en un ancho (de '0%' a '100%')
    const widthInterpolate = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"]
    });

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#00000040', false);
    const dimensionValue = Platform.isTV ? 0 : 5;

    const showToast = (mensaje) => {
        Vibration.vibrate();

        showMessage({
            message: mensaje,
            type: 'default',
            duration: 1000,
            backgroundColor: '#EEE',
            color: '#000',
            position: 'bottom',
            style: [styles.flashMessage, {
                alignSelf: tipo === 'live' ? 'flex-start' : tipo === 'vod' ? 'center' : 'flex-end',
                marginLeft: tipo === 'live' ? '8%' : 0,
                marginRight: tipo === 'series' ? '8%' : 0
            }],
        });
    };

    return (
        <View style={styles.cardContainer}>
            {/* Capa 1: Componente Principal */}
            <View style={[styles.mainLayer, styles.roundedClipperOuter, { top: dimensionValue, bottom: dimensionValue, left: dimensionValue, right: dimensionValue }]}>
                <TouchableNativeFeedback
                    ref={mainTouchableRef}
                    nextFocusDown={nextFocusIds.update}
                    onPress={handleNavigateToScreen}
                    hasTVPreferredFocus={hasTVPreferredFocus}
                    background={focusRipple}
                    useForeground={!Platform.isTV}
                    nextFocusRight={lastCard ? nextFocusIds.main : undefined}
                >
                    <View style={{ flex: 1, padding: Platform.isTV ? 5 : 0 }}>
                        <View style={[styles.innerContent, { backgroundColor: fondo }]}>
                            <View style={styles.imageZone}>
                                <Image
                                    source={imagen}
                                    resizeMode="contain"
                                    style={styles.mainImage}
                                />
                            </View>
                            <View style={styles.footerPlaceholder} />
                        </View>
                    </View>
                </TouchableNativeFeedback>
            </View>

            {/* Capa 2: Botón de Actualización */}
            <View style={[styles.updateLayer, styles.roundedClipperInner]}>
                {isLoading ? (
                    <View style={[styles.loadingContainer]}>
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 5 }} />
                        <Text style={styles.textLoading}>Actualizando...</Text>
                    </View>
                ) : (
                    <TouchableNativeFeedback
                        ref={updateTouchableRef}
                        nextFocusUp={nextFocusIds.main}
                        onPress={() => handleUpdateStreaming(true)}
                        onLongPress={() => showToast(`Actualizar ${tipo === 'live' ? 'canales' : tipo === 'vod' ? 'películas' : 'series'}`)}
                        background={focusRipple}
                        useForeground={!Platform.isTV}
                        nextFocusRight={lastCard ? nextFocusIds.update : undefined}
                    >
                        <View style={{ flex: 1, padding: Platform.isTV ? 3 : 0 }}>
                            <View style={[styles.innerUpdateButton, { backgroundColor: fondo }]}>
                                <View style={styles.footerOverlay}>
                                    <Text style={styles.textTime} numberOfLines={2}>{timeAgo}</Text>
                                    <Image
                                        source={require('../../assets/update.png')}
                                        resizeMode="contain"
                                        style={styles.iconUpdate}
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                )}
            </View>

            {/* Barra de Progreso */}
            {isLoading && (
                <View style={styles.progressOverlay}>
                    <Animated.View style={[styles.progressBar, { width: widthInterpolate }]} />
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        margin: 5,
        position: 'relative',
    },
    flashMessage: {
        width: '20%',
        borderRadius: 20,
        alignItems: 'center',
        paddingTop: 2.5,
        paddingBottom: 1,
        marginBottom: '5%'
    },
    // Máscaras de recorte
    roundedClipperOuter: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    roundedClipperInner: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    // Capa 1
    mainLayer: {
        position: 'absolute',
        zIndex: 1,
    },
    innerContent: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageZone: {
        flex: 0.78,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainImage: {
        width: '80%',
        height: '80%',
    },
    footerPlaceholder: {
        flex: 0.22,
    },
    // Capa 2
    updateLayer: {
        position: 'absolute',
        height: '22%',
        zIndex: 2,
        bottom: 5, left: 5, right: 5,
    },
    innerUpdateButton: {
        flex: 1,
        borderRadius: 6,
        overflow: 'hidden',
    },
    footerOverlay: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
    },
    loadingContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
    },
    // Textos e iconos
    textTime: {
        color: '#eee',
        fontSize: Platform.isTV ? 14 : 12,
        width: '75%'
    },
    textLoading: {
        color: '#fff',
        fontSize: Platform.isTV ? 18 : 16,
        fontWeight: 'bold'
    },
    iconUpdate: {
        width: '16%',
        height: '100%',
        opacity: 0.9
    },
    // Progreso
    progressOverlay: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        right: 5,
        top: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        overflow: 'hidden',
        zIndex: 3
    },
    progressBar: {
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)'
    },
});

export default CardMultimedia;