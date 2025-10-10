import React from 'react';
import { View, StyleSheet } from 'react-native';

const ProgressBar = ({ isVod, duration, playback }) => {
    // Determina la duración total dependiendo si es película o episodio
    const totalDuration = isVod // Determina si es pelicula o episodio
        ? duration * 60 // Convierte minutos a segundos para películas
        : Number(duration); // Usa segundos directamente para episodios

    const playbackTime = playback; // Obtiene el tiempo de reproducción

    const progressPercentage = totalDuration > 0 ? (playbackTime / totalDuration) * 100 : 0; // Calcula el porcentaje de progreso

    return (
        <View style={styles.container}>
            <View style={[styles.progress, { width: `${progressPercentage}%` }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 4, // Altura de la barra
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Color de fondo de la barra
        borderRadius: 2,
        marginTop: -4, // Posiciona la barra justo en el borde inferior de la imagen
        overflow: 'hidden', // Asegura que la barra de progreso no se salga del contenedor
    },
    progress: {
        height: '100%',
        backgroundColor: '#FFD700', // Color de la barra de progreso
        borderRadius: 2,
    },
});

export default ProgressBar;