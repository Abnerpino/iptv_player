import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setFavoriteMovie } from '../../services/redux/slices/contentSlice';
import { setCatsMovies, setCatFavoriteMovies } from '../../services/redux/slices/categoriesSlice';
import StarRating from '../../components/StarRating';
import CardActor from '../../components/Cards/card_actor';
import Icon from 'react-native-vector-icons/FontAwesome';

const Pelicula = ({ navigation, route }) => {
    const title = route.params.titulo;
    const poster = route.params.imagen;
    const details = route.params.info[0];
    const credits = route.params.info[1];
    const link = route.params.link;
    const visto = route.params.visto;
    //const favorito = route.params.favorito;
    const { movies } = useSelector(state => state.content);
    const { catsMovies } = useSelector(state => state.categories);
    
    const dispatch = useDispatch();
    const movie = movies.find(movie => movie['tvg-name'] === title);
    const [favorite, setFavorite] = useState(movie?.favorito ?? false);
    const favoritos = catsMovies.find(categoria => categoria.id === 3);


    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        // Verificamos si ya está en favoritos (para evitar agregar de nuevo)
        if (movie?.favorito === newFavoriteStatus) return;

        setFavorite(newFavoriteStatus);

        dispatch(setFavoriteMovie({
            title: title,
            changes: { favorito: newFavoriteStatus }
        }));

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        dispatch(setCatFavoriteMovies({
            id: 3,
            changes: { total: newTotal }
        }));
    };

    const getDate = (date) => {
        const fecha = new Date(date);
        const day = fecha.getDate().toString().padStart(2, '0');
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const year = fecha.getFullYear();
        const newDate = date ? `${day}/${month}/${year}` : 'N/A';
        return newDate;
    };

    const convertDuration = (minutes) => {
        if (minutes) {
            const hours = Math.floor(minutes / 60); // Obtener las horas
            const minutesRemaining = minutes % 60; // Obtener los minutos restantes
            return `${hours}h ${minutesRemaining}m`; // Formato de salida
        } else {
            return 'N/A';
        }
    };

    const ItemSeparator = () => (
        <View style={{ width: 10 }} /> // Espacio entre elementos
    );

    return (
        <ImageBackground
            source={{ uri: `https://image.tmdb.org/t/p/original${details.backdrop_path}` }} //Imagen de fondo
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
            <View style={styles.container}>
                {/* Vista principal en columna */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                    {/* Fila con textos */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 10 }}>
                        <Icon name="arrow-circle-left" size={26} color="white"/>
                    </TouchableOpacity>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{title}</Text>
                    </View>
                </View>

                {/* ScrollView para contenido desplazable */}
                <ScrollView>
                    {/* Vista en fila dentro del ScrollView */}
                    <View style={styles.row}>
                        <Image
                            source={{ uri: poster }} // URL de la imagen
                            style={{ width: '15.5%', borderRadius: 5, borderColor: '#fff', borderWidth: 0.5 }}
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
                                <Text style={styles.text}>{details.original_title ? details.original_title : 'N/A'}</Text>
                                <Text style={styles.text}>{getDate(`${details.release_date}T06:00:00.000Z`)}</Text>
                                <Text style={[styles.text, { backgroundColor: 'rgba(80,80,100,0.5)', paddingHorizontal: 10, borderRadius: 5 }]}>{convertDuration(details.runtime)}</Text>
                                <Text style={styles.text}>{details.genres ? details.genres.join(' / ') : 'N/A'}</Text>
                                <StarRating rating={details.vote_average ? details.vote_average : 0} size={20}/>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Reproductor', { link })} style={[styles.button, { flexDirection: 'row', justifyContent: 'center' }]}>
                            <Icon name="play-circle-o" size={22} color="white"/>
                            <Text style={styles.textButton}>Play</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleToggleFavorite} style={[styles.button, { flexDirection: 'row', justifyContent: 'center', marginLeft: 20 }]}>
                            <Icon name={!favorite ? "heart-o" : "heart"} size={22} color={!favorite ? "black" : "red"}/>
                            <Text style={styles.textButton}>{!favorite ? 'Agregar a Favoritos' : 'Quitar de Favoritos'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingVertical: 10 }}>
                        <Text style={{ fontSize: 16, textAlign: 'justify', color: '#CCC', }}>{details.overview ? details.overview : 'N/A'}</Text>
                    </View>
                    {/* Vista en columna con texto y FlatList */}
                    <View style={{ paddingHorizontal: 5, paddingBottom: 5 }}>
                        <FlatList
                            data={credits[0]}
                            horizontal
                            renderItem={({ item }) => (
                                <CardActor
                                    imagen={item.imagen}
                                    nombre={item.nombre}
                                />
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            ItemSeparatorComponent={ItemSeparator}
                        />
                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

// Estilos para la aplicación
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
        backgroundColor: 'rgba(16,16,16,0.9)',
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