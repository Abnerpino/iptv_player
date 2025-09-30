import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { getItemById, updateItem, saveOrUpdateItems, deleteItem } from '../../services/realm/streaming';
import { changeContentProperties, changeCategoryProperties } from '../../services/redux/slices/streamingSlice';
import StarRating from '../../components/StarRating';
import CardActor from '../../components/Cards/card_actor';
import Reproductor from '../../components/Reproductor';

const Pelicula = ({ navigation, route }) => {
    const pelicula = route.params.selectedContent;
    const poster = pelicula.stream_icon !== "" ? pelicula.stream_icon : pelicula.poster_path !== "" ? `https://image.tmdb.org/t/p/original${pelicula.poster_path}` : null;
    const background = pelicula.backdrop_path;
    const originalTitle = pelicula.original_title;
    const genres = pelicula.genre !== "" ? pelicula.genre : pelicula.genres !== "" ? pelicula.genres : null;
    const runtime = pelicula.episode_run_time !== "" ? Number(pelicula.episode_run_time) : Number(pelicula.runtime);
    const overview = pelicula.plot !== "" ? pelicula.plot : pelicula.overview;
    const rating = pelicula.rating !== "" ? Number(pelicula.rating) : Number(pelicula.vote_average);
    const cast = pelicula.cast ? JSON.parse(pelicula.cast) : [];
    const { catsVod, vod } = useSelector(state => state.streaming);

    const dispatch = useDispatch();
    const vistos = catsVod.find(categoria => categoria.category_id === '0.2');
    const [favorite, setFavorite] = useState(pelicula?.favorito ?? false);
    const favoritos = catsVod.find(categoria => categoria.category_id === '0.3');
    const [error, setError] = useState(false);
    const [showReproductor, setShowReproductor] = useState(false);

    const handleMarkAsViewed = () => {
        // Verificamos si ya está en Vistos (para evitar agregar de nuevo)
        if (pelicula?.visto === true) return;

        updateItem('vod', 'stream_id', pelicula.stream_id, { visto: true }); // Actualiza el item en el schema principal
        saveOrUpdateItems('auxVod', { num: pelicula.num, stream_id: pelicula.stream_id, favorito: pelicula.favorito, visto: true }); // Actualiza el item en el schema auxiliar

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        dispatch(changeCategoryProperties({
            type: 'vod',
            categoryId: '0.2',
            changes: { total: newTotal }
        }));
    };

    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        // Verificamos si ya está en Favoritos (para evitar agregar de nuevo)
        if (pelicula?.favorito === newFavoriteStatus) return;

        setFavorite(newFavoriteStatus);

        updateItem('vod', 'stream_id', pelicula.stream_id, { favorito: newFavoriteStatus }); // Actualiza el item en el schema principal
        saveOrUpdateItems('auxVod', { num: pelicula.num, stream_id: pelicula.stream_id, favorito: newFavoriteStatus, visto: pelicula.visto }); // Actualiza el item en el schema auxiliar
        if (newFavoriteStatus === false) {
            deleteItem('auxVod', pelicula.stream_id); // Elimina el item del schema auxiliar
        }

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        dispatch(changeCategoryProperties({
            type: 'vod',
            categoryId: '0.3',
            changes: { total: newTotal }
        }));
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

    const ItemSeparator = () => (
        <View style={{ width: 10 }} /> // Espacio entre elementos
    );

    return (
        <>
            {!showReproductor ? (
                <ImageBackground
                    source={background ? { uri: `https://image.tmdb.org/t/p/original${background}` } : require('../../assets/fondo.jpg')} //Imagen de fondo
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                    <View style={[styles.container, { backgroundColor: background ? 'rgba(16,16,16,0.9)' : 'rgba(16,16,16,0.5)' }]}>
                        {/* Vista principal en columna */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                            {/* Fila con textos */}
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 10 }}>
                                <Icon name="arrow-circle-left" size={26} color="white" />
                            </TouchableOpacity>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{pelicula.name}</Text>
                            </View>
                        </View>

                        {/* ScrollView para contenido desplazable */}
                        <ScrollView>
                            {/* Vista en fila dentro del ScrollView */}
                            <View style={styles.row}>
                                <Image
                                    source={poster && !error ? { uri: poster } : require('../../assets/not_image.png')} // URL de la imagen
                                    style={{ width: '15.5%', borderRadius: 5, borderColor: '#fff', borderWidth: 0.5, backgroundColor: '#201F29' }}
                                    onError={() => setError(true)}
                                    resizeMode='contain'
                                />
                                <View style={{ flexDirection: 'row', paddingLeft: 35, paddingVertical: 7.5, width: '100%', }}>
                                    <View style={styles.column}>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Título original:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Duración:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Género:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Calificación:</Text>
                                    </View>
                                    <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 75 }}>
                                        <Text style={styles.text}>{originalTitle ? originalTitle : 'N/A'}</Text>
                                        <Text style={styles.text}>{pelicula.release_date ? getDate(`${pelicula.release_date}T06:00:00.000Z`) : 'N/A'}</Text>
                                        <Text style={[styles.text, { backgroundColor: 'rgba(80,80,100,0.5)', paddingHorizontal: 10, paddingBottom: 2, borderRadius: 5 }]}>{convertDuration(runtime ? runtime : 0)}</Text>
                                        <Text style={styles.text}>{genres ? genres : 'N/A'}</Text>
                                        <StarRating rating={rating ? rating : 0} size={20} />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                                <TouchableOpacity
                                    style={[styles.button, { flexDirection: 'row', justifyContent: 'center' }]}
                                    onPress={() => {
                                        handleMarkAsViewed();
                                        setShowReproductor(true);
                                    }}
                                >
                                    <Icon name="play-circle-o" size={22} color="white" />
                                    <Text style={styles.textButton}>Play</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleToggleFavorite} style={[styles.button, { flexDirection: 'row', justifyContent: 'center', marginLeft: 20 }]}>
                                    <Icon name={!favorite ? "heart-o" : "heart"} size={22} color={!favorite ? "black" : "red"} />
                                    <Text style={styles.textButton}>{!favorite ? 'Agregar a Favoritos' : 'Quitar de Favoritos'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingVertical: 10 }}>
                                <Text style={{ fontSize: 16, textAlign: 'justify', color: '#CCC', }}>{overview ? overview : 'Sinopsis no disponible'}</Text>
                            </View>
                            {/* Vista en columna con texto y FlatList */}
                            {Array.isArray(cast) && cast.length > 0 ? (
                                <View style={{ paddingHorizontal: 5, paddingBottom: 5 }}>
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
                />
            )}
        </>
    );
};

// Estilos para la aplicación
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    text: {
        fontSize: 16,
        color: '#CCC',
        marginVertical: 6.5,
    },
    button: {
        width: '25%',
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: 'rgb(80,80,100)',
    },
    textButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        paddingLeft: 5
    },
});

export default Pelicula;