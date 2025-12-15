import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Vibration, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useObject, useQuery } from '@realm/react';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useStreaming } from '../../services/hooks/useStreaming';
import ProgressBar from '../../components/ProgressBar/progress_bar';
import StarRating from '../../components/StarRating';
import CardActor from '../../components/Cards/card_actor';
import Reproductor from '../../components/Reproductor';

const Pelicula = ({ navigation, route }) => {
    const { idContent, username } = route.params;
    const pelicula = useObject('Pelicula', idContent); // Encuentra la pelicula usando su Modelo y su ID

    const poster = pelicula.stream_icon !== "" ? pelicula.stream_icon : pelicula.poster_path !== "" ? `https://image.tmdb.org/t/p/original${pelicula.poster_path}` : null;
    const background = pelicula.backdrop_path;
    const originalTitle = pelicula.original_title;
    const genres = pelicula.genre !== "" ? pelicula.genre : pelicula.genres !== "" ? pelicula.genres : null;
    const runtime = pelicula.episode_run_time !== "" ? Number(pelicula.episode_run_time) : pelicula.runtime !== "" ? Number(pelicula.runtime) : 0;
    const overview = pelicula.plot !== "" ? pelicula.plot : pelicula.overview;
    const rating = pelicula.rating !== "" ? Number(pelicula.rating) : Number(pelicula.vote_average);
    const cast = pelicula.cast ? JSON.parse(pelicula.cast) : [];

    const { getModelName, updateProps } = useStreaming();
    const categoryModel = getModelName('vod', true);
    const categories = useQuery(categoryModel);
    const vistos = categories.find(categoria => categoria.category_id === '0.2');
    const [favorite, setFavorite] = useState(pelicula?.favorito ?? false);
    const favoritos = categories.find(categoria => categoria.category_id === '0.3');
    const [error, setError] = useState(false);
    const [showReproductor, setShowReproductor] = useState(false);
    const [playbackTime, setPlaybackTime] = useState(parseFloat(pelicula.playback_time));
    const hasPerformedInitialSave = useRef(false);  // Referencia para saber cuando ya se guardó el 'playback_time' de la pelicula la primera vez que se reproduce

    const isComplete = (runtime > 0 && (playbackTime / (runtime * 60)) >= 0.99) ? true : false; //Bandera para saber cuando una pelicula ya se reprodujo por completo

    // Efecto para marcar como vista una pelicula
    useEffect(() => {
        const storedPlaybackTime = parseFloat(pelicula.playback_time); // Obtiene el tiempo de reproducción que tenía la pelicula al ser cargada

        // Verifica que la pelicula no haya sido guardado aún, que su 'playback_time' guardado sea 0 y que ya haya comenzado a reproducirse
        if (!hasPerformedInitialSave.current && storedPlaybackTime === 0 && playbackTime > 0) {
            updateProps('vod', false, pelicula.stream_id, { playback_time: playbackTime.toString() }); // Si se cumplen las condiciones, guarda el primer tiempo de reproducción que recibe
            hasPerformedInitialSave.current = true; // "Levanta la bandera" para no volver a ejecutar este guardado
        }

        // Verifica si ya se reprodujo al menos un fotograma de la pelicula
        if (playbackTime === 0) return;

        // Verifica si ya está en Vistos (para evitar agregar de nuevo)
        if (pelicula?.visto === true) return;

        updateProps('vod', false, pelicula.stream_id, { visto: true }); // Actualiza la pelicula en el schema

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        updateProps('vod', true, vistos.category_id, { total: newTotal }); // Actualiza el total de la categoría Vistos
    }, [playbackTime]);

    useEffect(() => {
        const backAction = () => {
            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        setFavorite(newFavoriteStatus);

        updateProps('vod', false, pelicula.stream_id, { favorito: newFavoriteStatus }); // Actualiza la pelicula en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        updateProps('vod', true, favoritos.category_id, { total: newTotal }); // Actualiza el total de la categoría Favoritos
    };

    const handleBack = () => {
        hideMessage();
        navigation.goBack();
    };

    const getDate = (date) => {
        const fecha = new Date(date);
        const day = fecha.getDate().toString().padStart(2, '0');
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const year = fecha.getFullYear();
        const newDate = `${day}/${month}/${year}`;
        return newDate;
    };

    const convertDuration = (minutes) => {
        if (minutes) {
            const hours = Math.floor(minutes / 60); // Obtener las horas
            const minutesRemaining = minutes % 60; // Obtener los minutos restantes
            return `${hours}h ${minutesRemaining}m`; // Formato de salida
        } else {
            return '0m';
        }
    };

    const handleProgressUpdate = (time) => {
        setPlaybackTime(time);
    };

    const showToast = (mensaje) => {
        Vibration.vibrate();

        showMessage({
            message: mensaje,
            type: 'default',
            duration: 1000,
            backgroundColor: '#EEE',
            color: '#000',
            style: styles.flashMessage
        });
    };

    const ItemSeparator = () => (
        <View style={{ width: 10 }} /> // Espacio entre elementos
    );

    return (
        <>
            {!showReproductor ? (
                <ImageBackground
                    source={background ? { uri: `https://image.tmdb.org/t/p/original${background}` } : require('../../assets/fondo.jpg')} //Imagen de fondo
                    style={styles.imageBackground}
                >
                    <View style={[styles.container, { backgroundColor: background ? 'rgba(16,16,16,0.9)' : 'rgba(16,16,16,0.5)' }]}>
                        {/* Vista principal en columna */}
                        <View style={styles.containerBackButton}>
                            {/* Fila con textos */}
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBack}
                                onLongPress={() => showToast('Regresar')}
                            >
                                <Icon name="arrow-circle-left" size={26} color="white" />
                            </TouchableOpacity>
                            <View style={styles.containerTitle}>
                                <Text style={styles.title}>{pelicula.name}</Text>
                            </View>
                        </View>

                        {/* ScrollView para contenido desplazable */}
                        <ScrollView>
                            {/* Vista en fila dentro del ScrollView */}
                            <View style={styles.containerDetailsMovie}>
                                <View style={styles.containerPoster}>
                                    <Image
                                        source={poster && !error ? { uri: poster } : require('../../assets/not_image.png')} // URL de la imagen
                                        style={styles.poster}
                                        onError={() => setError(true)}
                                        resizeMode='contain'
                                    />
                                </View>
                                <View style={styles.details}>
                                    <View style={styles.column}>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Título original:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Duración:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Género:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Calificación:</Text>
                                    </View>
                                    <View style={[styles.column, { marginLeft: '18.5%', }]}>
                                        <Text style={styles.text}>{originalTitle ? originalTitle : 'N/A'}</Text>
                                        <Text style={styles.text}>{pelicula.release_date ? getDate(`${pelicula.release_date}T06:00:00.000Z`) : 'N/A'}</Text>
                                        <Text style={[styles.text, styles.runtime]}>{convertDuration(runtime)}</Text>
                                        <Text style={styles.text}>{genres ? genres : 'N/A'}</Text>
                                        <StarRating rating={rating ? rating : 0} size={20} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.containerButtons}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => setShowReproductor(true)}
                                >
                                    <View style={styles.playButton}>
                                        <Icon name="play-circle-o" size={22} color="white" />
                                        <Text style={styles.textButton}>{playbackTime === 0 ? 'Reproducir' : isComplete ? 'Reiniciar' : 'Reanudar'}</Text>
                                    </View>
                                    {playbackTime > 0 && (
                                        <ProgressBar isVod={true} duration={runtime} playback={playbackTime} />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleToggleFavorite} style={[styles.button, styles.favoriteButton]}>
                                    <Icon name={!favorite ? "heart-o" : "heart"} size={22} color={!favorite ? "black" : "red"} />
                                    <Text style={styles.textButton}>{!favorite ? 'Agregar a Favoritos' : 'Quitar de Favoritos'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingVertical: 10, }}>
                                <Text style={styles.overview}>{overview ? overview : 'Sinopsis no disponible'}</Text>
                            </View>
                            {/* Vista en columna con texto y FlatList */}
                            {Array.isArray(cast) && cast.length > 0 ? (
                                <View style={styles.containerFlatList}>
                                    <FlatList
                                        data={cast}
                                        horizontal
                                        renderItem={({ item }) => (
                                            <CardActor
                                                imagen={item.imagen}
                                                nombre={item.nombre}
                                            />
                                        )}
                                        keyExtractor={(item, index) => index.toString()}
                                        ItemSeparatorComponent={ItemSeparator}
                                    />
                                </View>
                            ) : null}
                        </ScrollView>
                    </View>
                </ImageBackground>
            ) : (
                <Reproductor
                    tipo={'vod'}
                    fullScreen={true}
                    contenido={pelicula}
                    setMostrar={(value) => setShowReproductor(value)}
                    onProgressUpdate={handleProgressUpdate}
                    username={username}
                />
            )}
        </>
    );
};

// Estilos para la aplicación
const styles = StyleSheet.create({
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 25,
    },
    containerBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10, 
    },
    backButton: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    containerTitle: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    containerDetailsMovie: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    containerPoster: {
        flex: 0.175,
        height: '100%',
    },
    poster: {
        flex: 1,
        width: '100%',
        height: '100%',
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 0.5,
        backgroundColor: '#201F29'
    },
    details: {
        flexDirection: 'row',
        paddingLeft: '7.5%',
        paddingVertical: 10,
        flex: 0.825,
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    text: {
        fontSize: 16,
        color: '#CCC',
        marginVertical: 8,
    },
    runtime: {
        backgroundColor: 'rgba(80,80,100,0.5)',
        paddingHorizontal: 10,
        paddingBottom: 2,
        borderRadius: 5
    },
    containerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingTop: 10,
    },
    button: {
        width: '25%',
        justifyContent: 'center',
        borderRadius: 5,
        backgroundColor: 'rgb(80,80,100)',
    },
    playButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    favoriteButton: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    textButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        paddingLeft: 5
    },
    overview: {
        fontSize: 16,
        textAlign: 'justify',
        color: '#CCC',
    },
    containerFlatList: {
        paddingHorizontal: 5,
        paddingBottom: 5,
    },
    flashMessage: {
        width: '12.5%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingTop: 1,
        paddingBottom: 5,
        marginTop: '5.5%',
        marginLeft: 1
    },
});

export default Pelicula;