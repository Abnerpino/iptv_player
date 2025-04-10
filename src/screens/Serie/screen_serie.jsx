import React, { useState } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setFavoriteSerie } from '../../services/redux/slices/contentSlice';
import { setCatFavoriteSeries } from '../../services/redux/slices/categoriesSlice';
import CardActor from '../../components/Cards/card_actor';
import StarRating from '../../components/StarRating';
import ModalOverview from '../../components/Modals/modal_overview';
import ModalSeasons from '../../components/Modals/modal_seasons';
import ItemEpisode from '../../components/Items/item_episode';
import Icon from 'react-native-vector-icons/FontAwesome';

const Serie = ({ navigation, route }) => {
    const title = route.params.titulo;
    const poster = route.params.imagen;
    const details = route.params.info;
    const link = route.params.link;
    const seasons = route.params.seasons;
    const id = route.params.id;
    const credits = route.params.creditos;

    const { series } = useSelector(state => state.content);
    const { catsSeries } = useSelector(state => state.categories);
    const dispatch = useDispatch();
    const serie = series.find(serie => serie.id === id);
    const [favorite, setFavorite] = useState(serie?.favorito ?? false); //Estado para manejar cuando un contenido se marca/desmarca como favorito
    const favoritos = catsSeries.find(categoria => categoria.id === 3);

    const [modalVisibleO, setModalVisibleO] = useState(false); //Estado para manejar el modal de la trama
    const [modalVisibleS, setModalVisibleS] = useState(false); //Estado para manejar el modal de las temporadas
    const [selectedSeason, setSelectedSeason] = useState(seasons[0]); //Estado para manejar la información del episodio seleccionado
    const [selectedEpisode, setSelectedEpisode] = useState(seasons[0].capitulos[0].capitulo); //Estado para manejar el numero del episodio seleccionado
    const [selectedLinkEpisode, setSelectedLinkEpisode] = useState(seasons[0].capitulos[0].link); //Estado para manejar la url de stream del episodio seleccionado
    const [selectedTab, setSelectedTab] = useState('episodios'); //Estado para manejar el tab seleccionado: 'episodios' o 'reparto'

    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        // Verificamos si ya está en favoritos (para evitar agregar de nuevo)
        if (serie?.favorito === newFavoriteStatus) return;

        setFavorite(newFavoriteStatus);
    
        dispatch(setFavoriteSerie({
            id: id,
            changes: { favorito: newFavoriteStatus }
        }));

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);
    
        dispatch(setCatFavoriteSeries({
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
        <ImageBackground
            source={{ uri: `https://image.tmdb.org/t/p/original${details.backdrop_path}` }} //Imagen de fondo
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
                            source={{ uri: `https://image.tmdb.org/t/p/original${details.poster_path}` }} // URL de la imagen
                            style={{ width: '15.5%', borderRadius: 5, borderColor: '#fff', borderWidth: 0.5 }}
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
                                <Text style={styles.text}>{details.original_name ? details.original_name : 'N/A'}</Text>
                                <Text style={styles.text}>{getDate(`${details.first_air_date}T06:00:00.000Z`)}</Text>
                                <Text style={styles.text}>{details.genres ? details.genres.map(genre => genre.name).join('/') : 'N/A'}</Text>
                                <StarRating rating={details.vote_average ? details.vote_average : 0} size={20}/>
                                <Text style={{ fontSize: 16, textAlign: 'justify', color: '#CCC', paddingRight: 0, }} numberOfLines={2} >{details.overview ? details.overview : 'N/A'}</Text>
                                <TouchableOpacity onPress={() => setModalVisibleO(true)}>
                                    <Text style={{ color: 'rgb(255,127,0)', fontSize: 14, fontWeight: 'bold' }}>Leer Más</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 20, paddingBottom: 10 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('Reproductor', { link })} style={[styles.button, { marginRight: 20 }]}>
                            <Icon name="play-circle-o" size={22} color="white"/>
                            <Text style={styles.textButton}>{`Play: T${selectedSeason.temporada}-E${selectedEpisode}`}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisibleS(true)} style={[styles.button, { marginRight: 20 }]}>
                            <Icon name="list-alt" size={22} color="white"/>
                            <Text style={styles.textButton}>{`Temporada: ${selectedSeason.temporada}`}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleToggleFavorite} style={styles.button}>
                            <Icon name={!favorite ? "heart-o" : "heart"} size={22} color={!favorite ? "black" : "red"}/>
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
                                        EPISODIOS ({selectedSeason.capitulos.length})
                                    </Text>
                                </TouchableOpacity>

                                {/* Botón Reparto (solo si hay datos) */}
                                {credits.length > 0 && (
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
                                    data={selectedSeason.capitulos}
                                    scrollEnabled={false} // Desactiva scroll interno para evitar conflictos con el ScrollView ya que la oritentación de desplazamiento es la misma
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                        <ItemEpisode
                                            navigation={navigation}
                                            season={selectedSeason.temporada}
                                            episode={item}
                                            onSelectEpisode={(episodio) => {
                                                setSelectedEpisode(episodio);
                                                setSelectedLinkEpisode(item.link);
                                            }}
                                        />
                                    )}
                                />
                            ) : (
                                <FlatList
                                    data={credits}
                                    horizontal
                                    renderItem={({ item }) => (
                                        <CardActor
                                            imagen={item.imagen}
                                            nombre={item.nombre}
                                        />
                                    )}
                                    keyExtractor={(item) => item.id}
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
                    overview={details.overview}
                />
                {/* Modal para mostrar las temporadas */}
                <ModalSeasons
                    openModal={modalVisibleS}
                    handleCloseModal={handleCloseModalS}
                    seasons={seasons}//.map((season) => season.temporada)} //Envia un nuevo arreglo solo con el valor de las temporadas
                    onSelectSeason={(season) => {
                        setSelectedSeason(season);
                        setSelectedEpisode(season.capitulos[0].capitulo);
                        setSelectedLinkEpisode(season.capitulos[0].link);
                    }}
                />
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