import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useObject, useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';
import CardActor from '../../components/Cards/card_actor';
import StarRating from '../../components/StarRating';
import ModalOverview from '../../components/Modals/modal_overview';
import ModalSeasons from '../../components/Modals/modal_seasons';
import ItemEpisode from '../../components/Items/item_episode';
import ProgressBar from '../../components/ProgressBar/progress_bar';
import Reproductor from '../../components/Reproductor';

const Serie = ({ navigation, route }) => {
    const { idContent } = route.params;
    const serie = useObject('Serie', idContent); // Encuentra la serie usando su Modelo y su ID

    const poster = serie.cover !== "" ? serie.cover : serie.poster_path !== "" ? `https://image.tmdb.org/t/p/original${serie.poster_path}` : null;
    const background = serie.backdrop_path !== "" ? serie.backdrop_path : serie.backdrop_path_aux !== "" ? `https://image.tmdb.org/t/p/original${serie.backdrop_path_aux}` : null;
    const originalName = serie.original_name;
    const genres = serie.genre !== "" ? serie.genre : serie.genres !== "" ? serie.genres : null;
    const overview = serie.plot !== "" ? serie.plot : serie.overview;
    const rating = serie.rating !== "" ? Number(serie.rating) : Number(serie.vote_average);
    const cast = serie.cast ? JSON.parse(serie.cast) : [];
    const seasons = serie?.temporadas ?? [];
    const season_idx = serie?.last_ep_played[0] ?? 0; // Indice de la temporada del último episodio reproducido
    const episode_idx = serie?.last_ep_played[1] ?? 0; // Indice del último episodio reproducido

    const { getModelName, updateProps, updateSeasonProps, updateEpisodeProps } = useStreaming();
    const categoryModel = getModelName('series', true);
    const categories = useQuery(categoryModel);
    const vistos = categories.find(categoria => categoria.category_id === '0.2');
    const [favorite, setFavorite] = useState(serie?.favorito ?? false); //Estado para manejar cuando un contenido se marca/desmarca como favorito
    const favoritos = categories.find(categoria => categoria.category_id === '0.3');

    const [modalVisibleO, setModalVisibleO] = useState(false); //Estado para manejar el modal de la trama
    const [modalVisibleS, setModalVisibleS] = useState(false); //Estado para manejar el modal de las temporadas
    const [selectedSeason, setSelectedSeason] = useState(seasons[season_idx]); //Estado para manejar la información de la temporada seleccionada
    const [episodios, setEpisodios] = useState(selectedSeason.episodios);
    const [selectedEpisode, setSelectedEpisode] = useState(selectedSeason.episodios[episode_idx]);//serie.episodes[1][0]); //Estado para manejar la información del episodio seleccionado
    const [playbackInfo, setPlaybackInfo] = useState({
        time: parseFloat(selectedEpisode.playback_time),
        episodeId: selectedEpisode.id
    });
    const [selectedTab, setSelectedTab] = useState('episodios'); //Estado para manejar el tab seleccionado: 'episodios' o 'reparto'
    const [error, setError] = useState(false);
    const [showReproductor, setShowReproductor] = useState(false);
    const hasUpdatedIndex = useRef(false);
    const hasPerformedInitialSave = useRef(false); // Referencia para saber cuando ya se guardó el 'playback_time' del episodio la primera vez que se reproduce

    const duration = selectedEpisode.duration_secs !== "" ? Number(selectedEpisode.duration_secs) : 0;
    const isComplete = (duration > 0 && (parseFloat(selectedEpisode.playback_time) / duration) >= 0.99) ? true : false; //Bandera para saber cuando una pelicula ya se reprodujo por completo

    useEffect(() => {
        if (playbackInfo.episodeId !== selectedEpisode.id) return;

        const playbackTime = playbackInfo.time;
        const storedPlaybackTime = parseFloat(selectedEpisode.playback_time); // Obtiene el tiempo de reproducción que tenía el episodio al ser cargado

        // Verifica que el episodio no haya sido guardado aún, que su 'playback_time' guardado sea 0 y que ya haya comenzado a reproducirse
        if (!hasPerformedInitialSave.current && storedPlaybackTime === 0 && playbackTime > 0) {
            updateEpisodeProps(serie.series_id, selectedSeason.numero, selectedEpisode.id, 'playback_time', playbackTime.toString()); // Si se cumplen las condiciones, guarda el primer tiempo de reproducción que recibe
            hasPerformedInitialSave.current = true; // "Levanta la bandera" para no volver a ejecutar este guardado
        }

        if (playbackTime === 0) return; // No hace nada si el episodio no ha comenzado a reproducirse

        if (!hasUpdatedIndex.current) {
            const hasProgressed = playbackTime > storedPlaybackTime; // Verifica si realmente hubo un avance en la reproducción

            if (!hasProgressed) return; // Si no ha habido progreso, no hace nada más en este bloque

            // Procede a verificar si los índices deben ser actualizados
            const newIdxSeason = seasons.findIndex(season => season.numero === selectedSeason.numero);
            const newIdxEpisode = episodios.findIndex(episodio => episodio.id === selectedEpisode.id);

            const isNewEpisode = season_idx !== newIdxSeason || episode_idx !== newIdxEpisode;

            if (isNewEpisode) { // Solo si es un episodio diferente y ha progresado, actualiza los índices
                updateProps('series', false, serie.series_id, { last_ep_played: [newIdxSeason, newIdxEpisode] }); // Actualiza en el schema los indices de la temporada y episodio último reproducido
                updateSeasonProps(serie.series_id, selectedSeason.numero, 'idx_last_ep_played', newIdxEpisode); // Actualiza el indice del último episodio reproducido de la temporada
            }

            hasUpdatedIndex.current = true; // Marca el índice como actualizado para esta sesión de visualización para evitar re-escrituras
        }

        if (selectedEpisode?.visto === true) return; // Si el episodio ya está marcado como visto, no hay nada más que hacer

        updateEpisodeProps(serie.series_id, selectedSeason.numero, selectedEpisode.id, 'visto', true); // Marca el episodio como 'Visto'

        if (serie?.visto === true) return; // Si la serie ya está marcada como vista, tampoco continua

        updateProps('series', false, serie.series_id, { visto: true }); // Actualiza la serie como vista en el schema

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        updateProps('series', true, vistos.category_id, { total: newTotal }); // Actualiza el total de la categoría Vistos

    }, [playbackInfo, selectedEpisode]);

    const handleToggleFavorite = () => {
        const newFavoriteStatus = !favorite;

        setFavorite(newFavoriteStatus);

        updateProps('series', false, serie.series_id, { favorito: newFavoriteStatus }); // Actualiza la serie en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        updateProps('series', true, favoritos.category_id, { total: newTotal }); // Actualiza el total de la categoría Favoritos
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

    const handleChangeEpisode = (episodio) => {
        // Actualiza el estado en el padre, esto provocará que el reproductor se reinicie
        setSelectedEpisode(episodio);
        setPlaybackInfo({
            time: parseFloat(episodio.playback_time),
            episodeId: episodio.id
        });
        hasUpdatedIndex.current = false;
        hasPerformedInitialSave.current = false;
    };

    const handleProgressUpdate = (time, episodeId) => {
        setPlaybackInfo({ time, episodeId });
    };

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
                                    onPress={() => setShowReproductor(true)}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, }}>
                                        <Icon name="play-circle-o" size={22} color="white" />
                                        <Text style={styles.textButton}>
                                            {`${parseFloat(selectedEpisode.playback_time) === 0 ? 'Reproducir' : isComplete ? 'Reiniciar' : 'Reanudar'}: T${selectedSeason.numero}-E${selectedEpisode.episode_num}`}
                                        </Text>
                                    </View>
                                    {parseFloat(selectedEpisode.playback_time) > 0 && (
                                        <ProgressBar isVod={false} duration={duration} playback={parseFloat(selectedEpisode.playback_time)} />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisibleS(true)} style={[styles.button, { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 5, marginRight: 20 }]}>
                                    <Icon name="list-alt" size={22} color="white" />
                                    <Text style={styles.textButton}>{`Temporada: ${selectedSeason.numero}`}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleToggleFavorite} style={[styles.button, { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 5, }]}>
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
                                                        handleChangeEpisode(episodio);
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
                                setEpisodios(season.episodios);
                                setSelectedEpisode(season.episodios[season.idx_last_ep_played]);
                                hasUpdatedIndex.current = false;
                            }}
                        />
                    </View>
                </ImageBackground>
            ) : (
                <Reproductor
                    key={selectedEpisode.id}
                    tipo={'series'}
                    fullScreen={true}
                    setMostrar={(value) => setShowReproductor(value)}
                    contenido={{
                        stream_id: serie.series_id, // se cambió 'series_id' por 'stream_id' para facilitar su uso en el reproductor
                        temporada: selectedSeason.numero,
                        episode_id: selectedEpisode.id,
                        link: selectedEpisode.link,
                        aux_link: selectedEpisode.aux_link,
                        name: selectedEpisode.title,
                        playback_time: selectedEpisode.playback_time,
                        episode_run_time: Number(selectedEpisode.duration_secs),
                        cover: serie.cover,
                        backdrop: background,
                        movie_image: selectedEpisode.movie_image
                    }}
                    episodios={episodios}
                    idxEpisode={episodios.findIndex(episodio => episodio.id === selectedEpisode.id)}
                    onContentChange={handleChangeEpisode}
                    setVisto={handleChangeEpisode}
                    onProgressUpdate={handleProgressUpdate}
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
        justifyContent: 'center',
        borderRadius: 5,
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