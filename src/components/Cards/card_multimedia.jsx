import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useXtream } from '../../services/hooks/useXtream';

const CardMultimedia = ({ navigation, tipo, fondo, onStartLoading, onFinishLoading }) => {
    const { getStreamingByType } = useXtream();
    const [buttonColor, setButtonColor] = useState('rgba(0,0, 0, 0.5)'); //Estado para manejar el color del botón de actualizar contenido
    const [lastUpdateTime, setLastUpdateTime] = useState(null); // Estado para guardar la marca de tiempo (timestamp) de la última actualización
    const [timeAgo, setTimeAgo] = useState('Última actualización: nunca'); // Estado para guardar el texto formateado

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
        if (lastUpdateTime === null) {
            // Si nunca se ha actualizado, no se inicia el intervalo
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

        // Ejecutamos la función una vez de inmediato para que el texto se actualice de "nunca" a "ahora" sin esperar el primer intervalo.
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
        navigation.navigate('Seccion', { tipo });
    };

    const handleUpdateStreaming = async () => {
        onStartLoading?.();
        await getStreamingByType(tipo);
        onFinishLoading?.();

        // Al terminar, obtenemos la fecha y hora actual como un timestamp numérico
        const now = new Date().getTime();

        try {
            // Guardamos el timestamp en AsyncStorage
            await AsyncStorage.setItem(`@last_update_time_${tipo}`, now.toString());
            // Actualizamos el estado para que el contador se reinicie inmediatamente
            setLastUpdateTime(now);
        } catch (e) {
            console.error("Error al guardar el tiempo de actualización", e);
        }
    };

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: fondo }]} onPress={handleNavigateToScreen}>
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
            <TouchableOpacity
                style={[styles.updateContainer, { backgroundColor: buttonColor }]}
                onPress={handleUpdateStreaming}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Text style={[styles.updateText, { verticalAlign: 'middle' }]}>{timeAgo}</Text>
                <View style={styles.imageContainer2}>
                    <Image
                        source={require('../../assets/update.png')}
                        resizeMode="contain"
                        style={styles.updateImage} />
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 10,
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
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    updateText: {
        color: '#fff',
        fontSize: 12,
        paddingVertical: 10,
        height: '100%',
        width: '70%',
        textAlign: 'left',
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
    }
});

export default CardMultimedia;