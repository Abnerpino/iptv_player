import React, { useState } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { updateItem, marckEpisodeAsWatched } from '../../services/realm/streaming';
import { changeCategoryProperties } from '../../services/redux/slices/streamingSlice';
import CardActor from '../../components/Cards/card_actor';
import StarRating from '../../components/StarRating';
import ModalOverview from '../../components/Modals/modal_overview';
import ModalSeasons from '../../components/Modals/modal_seasons';
import ItemEpisode from '../../components/Items/item_episode';
import Reproductor from '../../components/Reproductor';

const Serie = ({ navigation, route }) => {
    const serie = route.params.selectedContent;
    const poster = serie.cover !== "" ? serie.cover : serie.poster_path !== "" ? `https://image.tmdb.org/t/p/original${serie.poster_path}` : null;
    const background = serie.backdrop_path !== "" ? serie.backdrop_path : serie.backdrop_path_aux !== "" ? `https://image.tmdb.org/t/p/original${serie.backdrop_path_aux}` : null;
    const originalName = serie.original_name;
    const genres = serie.genre !== "" ? serie.genre : serie.genres !== "" ? serie.genres : null;
    const overview = serie.plot !== "" ? serie.plot : serie.overview;
    const rating = serie.rating !== "" ? Number(serie.rating) : Number(serie.vote_average);
    const cast = serie.cast ? JSON.parse(serie.cast) : [];
    const seasons = serie?.temporadas ?? [];

    const { catsSeries } = useSelector(state => state.streaming);
    const dispatch = useDispatch();
    const vistos = catsSeries.find(categoria => categoria.category_id === '0.2');
    const [favorite, setFavorite] = useState(serie?.favorito ?? false); //Estado para manejar cuando un contenido se marca/desmarca como favorito
    const favoritos = catsSeries.find(categoria => categoria.category_id === '0.3');

    const [modalVisibleO, setModalVisibleO] = useState(false); //Estado para manejar el modal de la trama
    const [modalVisibleS, setModalVisibleS] = useState(false); //Estado para manejar el modal de las temporadas
    const [selectedSeason, setSelectedSeason] = useState(seasons[0]);//serie.episodes[1]); //Estado para manejar la información de la temporada seleccionada
    const [selectedEpisode, setSelectedEpisode] = useState(selectedSeason.episodios[0]);//serie.episodes[1][0]); //Estado para manejar la información del episodio seleccionado
    const [link, setLink] = useState(selectedEpisode.link);//serie.episodes[1][0].link); //Estado para manejar la url de stream del episodio seleccionado
    const [name, setName] = useState(selectedEpisode.title);
    const [episodios, setEpisodios] = useState(selectedSeason.episodios);
    const [selectedTab, setSelectedTab] = useState('episodios'); //Estado para manejar el tab seleccionado: 'episodios' o 'reparto'
    const [error, setError] = useState(false);
    const [showReproductor, setShowReproductor] = useState(false);

    const handleMarkAsViewed = (episodio) => {
        // Verificamos si el episodio ya ha sido visto (para evitar agregarlo de nuevo)
        if (episodio?.visto === true) return;

        marckEpisodeAsWatched(serie.series_id, selectedSeason.numero, episodio.id); // Marca el episodio como 'Visto'

        // Verificamos si la Serie ya está en Vistos (para evitar agregar de nuevo)
        if (serie?.visto === true) return;

        updateItem('series', 'series_id', serie.series_id, { visto: true }); // Actualiza el item en el schema

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        dispatch(changeCategoryProperties({
            type: 'series',
            categoryId: '0.2',
            changes: { total: newTotal }
        }));
    };

    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        // Verificamos si ya está en favoritos (para evitar agregar de nuevo)
        if (serie?.favorito === newFavoriteStatus) return;

        setFavorite(newFavoriteStatus);

        updateItem('series', 'series_id', serie.series_id, { favorito: newFavoriteStatus }); // Actualiza el item en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        dispatch(changeCategoryProperties({
            type: 'series',
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

    //Función para controlar el cierre del modal de la trama
    function handleCloseModalO() {
        setModalVisibleO(false);
    }

    //Función para controlar el cierre del modal de las temporadas
    function handleCloseModalS() {
        setModalVisibleS(false);
    }

    const ItemSeparator = () => (
        <View style={{ width: 10 }} /> // Espacio entre elementos
    );

    return (
        <>
            {!showReproductor ? (
                <ImageBackground
                    source={background ? { uri: background } : require('../../assets/fondo.jpg')} //Imagen de fondo
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                    <View style={styles.container}>
                        {/* Vista principal en columna */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10
                        }}>
                            {/* Fila con el botón de regreso y el titulo de la serie */}
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginHorizontal: -20, paddingHorizontal: 20, paddingVertical: 10 }}>
                                <Icon name="arrow-circle-left" size={26} color="white" />
                            </TouchableOpacity>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{serie.name}</Text>
                            </View>
                        </View>

                        {/* ScrollView para contenido desplazable */}
                        <ScrollView>
                            {/* Vista en fila dentro del ScrollView */}
                            <View style={styles.row}>
                                <Image
                                    source={poster && !error ? { uri: poster } : require('../../assets/not_image.png')} // URL de la imagen
                                    style={{ width: '15.5%', borderRadius: 5, borderColor: '#fff', borderWidth: 0.5 }}
                                    onError={() => setError(true)}
                                    resizeMode='contain'
                                />
                                <View style={{ flexDirection: 'row', paddingLeft: 35, width: '100%', }}>
                                    <View style={styles.column}>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Título original:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Género:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Calificación:</Text>
                                        <Text style={[styles.text, { fontWeight: 'bold' }]}>Trama:</Text>

                                    </View>
                                    <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 75, paddingRight: '31%', }}>
                                        <Text style={styles.text}>{originalName ? originalName : 'N/A'}</Text>
                                        <Text style={styles.text}>{serie.release_date ? getDate(`${serie.release_date}T06:00:00.000Z`) : 'N/A'}</Text>
                                        <Text style={styles.text}>{genres ? genres : 'N/A'}</Text>
                                        <StarRating rating={rating ? rating : 0} size={20} />
                                        <Text style={{ fontSize: 16, textAlign: 'justify', color: '#CCC', paddingRight: 0, }} numberOfLines={2} >{overview ? overview : 'Trama no disponible'}</Text>
                                        {overview ? (
                                            <TouchableOpacity onPress={() => setModalVisibleO(true)}>
                                                <Text style={{ color: 'rgb(255,127,0)', fontSize: 14, fontWeight: 'bold' }}>Leer Más</Text>
                                            </TouchableOpacity>
                                        ) : <Text>{'\n'}</Text>}

                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 20, paddingBottom: 10 }}>
                                <TouchableOpacity
                                    style={[styles.button, { marginRight: 20 }]}
                                    onPress={() => {
                                        handleMarkAsViewed(selectedEpisode);
                                        setShowReproductor(true);
                                    }}
                                >
                                    <Icon name="play-circle-o" size={22} color="white" />
                                    <Text style={styles.textButton}>{`Play: T${selectedSeason.numero}-E${selectedEpisode.episode_num}`}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisibleS(true)} style={[styles.button, { marginRight: 20 }]}>
                                    <Icon name="list-alt" size={22} color="white" />
                                    <Text style={styles.textButton}>{`Temporada: ${selectedSeason.numero}`}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleToggleFavorite} style={styles.button}>
                                    <Icon name={!favorite ? "heart-o" : "heart"} size={22} color={!favorite ? "black" : "red"} />
                                    <Text style={styles.textButton}>{!favorite ? 'Agregar a Favoritos' : 'Quitar de Favoritos'}</Text>
                                </TouchableOpacity>
                            </View>

                            {selectedSeason && (
                                <View style={{ paddingVertical: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {/* Botón EPISODIOS */}
                                        <TouchableOpacity
                                            onPress={() => setSelectedTab('episodios')}
                                            style={{
                                                paddingVertical: 6,
                                                paddingHorizontal: 14,
                                                borderRadius: 8,
                                                backgroundColor: selectedTab === 'episodios' ? 'orange' : '#444',
                                                marginRight: 10
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                EPISODIOS ({selectedSeason.episodios.length})
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Botón Reparto (solo si hay datos) */}
                                        {Array.isArray(cast) && cast.length > 0 && (
                                            <TouchableOpacity
                                                onPress={() => setSelectedTab('reparto')}
                                                style={{
                                                    paddingVertical: 6,
                                                    paddingHorizontal: 14,
                                                    borderRadius: 8,
                                                    backgroundColor: selectedTab === 'reparto' ? 'orange' : '#444'
                                                }}
                                            >
                                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                    Reparto
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Línea horizontal */}
                                    <View style={{
                                        height: 1,
                                        backgroundColor: '#888',
                                        marginVertical: 10,
                                        width: '100%',
                                    }} />

                                    {/* Contenido dinámico según pestaña seleccionada */}
                                    {selectedTab === 'episodios' ? (
                                        <FlatList
                                            data={selectedSeason.episodios}
                                            scrollEnabled={false} // Desactiva scroll interno para evitar conflictos con el ScrollView ya que la oritentación de desplazamiento es la misma
                                            keyExtractor={(item) => item.id} //No es necesario hacer la conversión porque ya es string
                                            renderItem={({ item }) => (
                                                <ItemEpisode
                                                    episode={item}
                                                    onSelectEpisode={(episodio) => {
                                                        setSelectedEpisode(episodio);
                                                        setLink(item.link);
                                                        setName(item.title);
                                                        handleMarkAsViewed(episodio);
                                                        setShowReproductor(true);
                                                    }}
                                                />
                                            )}
                                        />
                                    ) : (
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
                                    )}
                                </View>
                            )}
                        </ScrollView>
                        {/* Modal para mostrar la trama completa */}
                        <ModalOverview
                            openModal={modalVisibleO}
                            handleCloseModal={handleCloseModalO}
                            overview={overview}
                        />
                        {/* Modal para mostrar las temporadas */}
                        <ModalSeasons
                            openModal={modalVisibleS}
                            handleCloseModal={handleCloseModalS}
                            seasons={seasons}//.map((season) => season.temporada)} //Envia un nuevo arreglo solo con el valor de las temporadas
                            onSelectSeason={(season) => {
                                setSelectedSeason(season);
                                setSelectedEpisode(season.episodios[0]);
                                setLink(season.episodios[0].link);
                                setName(season.episodios[0].title);
                                setEpisodios(season.episodios);
                            }}
                        />
                    </View>
                </ImageBackground>
            ) : (
                <Reproductor
                    tipo={'series'}
                    fullScreen={true}
                    setMostrar={(value) => setShowReproductor(value)}
                    contenido={{ link, name }}
                    data={episodios}
                    temporada={selectedSeason.numero}
                    setVisto={(episodio) => handleMarkAsViewed(episodio)}
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
        marginVertical: 5,
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

export default Serie;