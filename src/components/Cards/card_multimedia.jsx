import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, ActivityIndicator, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useXtream } from '../../services/hooks/useXtream';

const CardMultimedia = forwardRef(({ navigation, tipo, fondo, onStartLoading, onFinishLoading, username }, ref) => {
    const { getStreamingByType } = useXtream();
    const [buttonColor, setButtonColor] = useState('rgba(0,0, 0, 0.5)'); //Estado para manejar el color del botón de actualizar contenido
    const [lastUpdateTime, setLastUpdateTime] = useState(null); // Estado para guardar la marca de tiempo (timestamp) de la última actualización
    const [timeAgo, setTimeAgo] = useState('Última actualización: nunca'); // Estado para guardar el texto formateado
    const [isLoading, setIsLoading] = useState(false); // Estado para mostrar/ocultar la barra
    const progressAnim = useRef(new Animated.Value(0)).current; //Referencia para la animación

    const imagen = tipo === 'live' ? require('../../assets/tv.png') : (tipo === 'vod' ? require('../../assets/cine.png') : require('../../assets/series.png'));

    // Efecto para cargar la última fecha de actualización guardada cuando el componente se monta
    useEffect(() => {
        const loadLastUpdateTime = async () => {
            try {
                // Se usa una clave única para cada tipo de tarjeta
                const savedTime = await AsyncStorage.getItem(`@last_update_time_${tipo}`);
                if (savedTime !== null) {
                    setLastUpdateTime(parseInt(savedTime, 10));
                }
            } catch (e) {
                console.error("Error al cargar el tiempo de actualización", e);
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

        //    Esta función se usará tanto para el cálculo inmediato como para el intervalo
        const updateText = () => {
            const now = new Date().getTime();
            const secondsSinceUpdate = Math.floor((now - lastUpdateTime) / 1000); // Calcula la diferencia en segundos

            if (secondsSinceUpdate < 60) {
                setTimeAgo('Última actualización: ahora');
            } else if (secondsSinceUpdate < 3600) {
                const minutes = Math.floor(secondsSinceUpdate / 60);
                setTimeAgo(`Última actualización: hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
            } else {
                const hours = Math.floor(secondsSinceUpdate / 3600);
                setTimeAgo(`Última actualización: hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`);
            }
        };

        // Ejecuta la función una vez de inmediato para que el texto se actualice de "nunca" a "ahora" sin esperar el primer intervalo.
        updateText();

        // El intervalo ahora corre cada segundo para detectar el cambio de minuto.
        const interval = setInterval(updateText, 1000);

        // La función de limpieza no cambia, sigue siendo crucial.
        return () => clearInterval(interval);

    }, [lastUpdateTime]); // Este efecto se reinicia cada vez que 'lastUpdateTime' cambia

    const handlePressIn = () => {
        setButtonColor('rgba(255,255,255,1)'); // Cambia el color al presionar
    };

    const handlePressOut = () => {
        setButtonColor('rgba(0,0,0,0.5)'); // Regresa al color original al soltar
    };

    const handleNavigateToScreen = () => {
        hideMessage();
        navigation.navigate('Seccion', { tipo, username });
    };

    const handleUpdateStreaming = async (flag) => {
        hideMessage();
        setIsLoading(true);
        progressAnim.setValue(0);
        if (flag) onStartLoading?.();

        // Inicia la primera animación
        Animated.timing(progressAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: false,
        }).start();

        // Espera a que la descarga de datos termine
        await getStreamingByType(tipo);

        // Envuelve la animación final en una Promesa explícita para garantizar la espera
        await new Promise(resolve => {
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
            }).start(result => {
                if (result.finished) {
                    resolve(); // Avisa que la animación terminó
                }
            });
        });

        // Se ejecutan las tareas finales despues de la animación
        setIsLoading(false);
        if (flag) onFinishLoading?.();
        const now = new Date().getTime();
        try {
            await AsyncStorage.setItem(`@last_update_time_${tipo}`, now.toString());
            setLastUpdateTime(now);
        } catch (e) {
            console.error("Error al guardar el tiempo de actualización", e);
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
        <View style={[styles.container, { backgroundColor: fondo }]}>
            <TouchableOpacity style={styles.touchableContent} onPress={handleNavigateToScreen}>
                <View style={styles.imageContainer1}>
                    <Image
                        source={imagen}
                        resizeMode="contain"
                        style={{
                            width: tipo === 'live' ? '80%' : '60%',
                            height: tipo === 'live' ? '80%' : '60%',
                            alignSelf: 'center',
                        }}>
                    </Image>
                </View>

                {isLoading ? (
                    <View style={[styles.updateContainer, { justifyContent: 'center' }]}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.updatingText}>Actualizando</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.updateContainer, { backgroundColor: buttonColor, justifyContent: 'space-evenly' }]}
                        onPress={() => handleUpdateStreaming(true)}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onLongPress={() => showToast(`Actualizar ${tipo === 'live' ? 'canales' : tipo === 'vod' ? 'películas' : 'series'}`)}
                    >
                        <Text style={styles.updateText}>{timeAgo}</Text>
                        <View style={styles.imageContainer2}>
                            <Image
                                source={require('../../assets/update.png')}
                                resizeMode="contain"
                                style={styles.updateImage} />
                        </View>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {isLoading && (
                <View style={styles.progressOverlay}>
                    <Animated.View style={[styles.progressBar, { width: widthInterpolate }]} />
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    touchableContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer1: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    updateContainer: {
        flexDirection: 'row',
        flex: 0.2,
        alignItems: 'center',
        width: '100%',
        height: '100%',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    updatingText: {
        color: '#fff',
        fontSize: 16,
        paddingVertical: 10,
        marginLeft: 5,
    },
    updateText: {
        color: '#fff',
        fontSize: 12,
        paddingVertical: 10,
        height: '100%',
        width: '70%',
        textAlign: 'left',
        textAlignVertical: 'center',
    },
    imageContainer2: {
        height: '100%',
        width: '16%',
        justifyContent: 'center'
    },
    updateImage: {
        width: '100%',
        height: '100%',
        alignSelf: 'flex_start',
    },
    progressOverlay: {
        position: 'absolute', // Se superpone sobre el contenido
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente oscuro
        justifyContent: 'flex-start', // La barra empieza desde la izquierda
        alignItems: 'flex-start',
    },
    progressBar: {
        height: '100%', // Ocupa toda la altura
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Color de la barra de progreso
    },
    flashMessage: {
        width: '20%',
        borderRadius: 20,
        alignItems: 'center',
        paddingTop: 2.5,
        paddingBottom: 1,
        marginBottom: '5%',
    },
});

export default CardMultimedia;