import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import TextTicker from 'react-native-text-ticker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import Video from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';
import { updateItem, saveOrUpdateItems } from '../../services/realm/streaming';
import { changeCategoryProperties } from '../../services/redux/slices/streamingSlice';
import BarraBusqueda from '../../components/BarraBusqueda';
import ItemChannel from '../../components/Items/item_channel';
import Reproductor from '../../components/Reproductor';

const Canal = ({ navigation, route }) => {
    const canal = route.params.selectedContent;
    const categorias = route.params.categories;
    const contenido = route.params.content;
    const { catsLive } = useSelector(state => state.streaming);

    const dispatch = useDispatch();
    const vistos = catsLive.find(categoria => categoria.category_id === '0.2');
    const [favorite, setFavorite] = useState(selectedChannel?.favorito ?? false);
    const favoritos = catsLive.find(categoria => categoria.category_id === '0.3');
    const [currentIndex, setCurrentIndex] = useState(0); //Estado para manejar el indice de la categoria actual
    const [selectedChannel, setSelectedChannel] = useState(canal); //Estado para el manejo del canal seleccionado
    const [isFullScreen, setIsFullScreen] = useState(false); //Estado para manejar la pantalla completa del reproductor

    useEffect(() => {
        // Verifica si el canal ya está en Vistos (para evitar agregar de nuevo)
        if (selectedChannel?.visto === true) return;

        updateItem('live', 'stream_id', selectedChannel.stream_id, { visto: true }); // Actualiza el item en el schema principal
        saveOrUpdateItems('auxLive', { num: selectedChannel.num, stream_id: selectedChannel.stream_id, favorito: selectedChannel.favorito, visto: true }); // Actualiza el item en el schema auxiliar

        const currentTotal = vistos.total;
        let newTotal = currentTotal + 1;

        dispatch(changeCategoryProperties({
            type: 'live',
            categoryId: '0.2',
            changes: { total: newTotal }
        }));
    }, [selectedChannel]);

    // Función para ir a la categoría anterior
    const handlePrevious = () => {
        // Fórmula para retroceder y dar la vuelta al llegar al principio
        const newIndex = (currentIndex - 1 + categorias.length) % categorias.length;
        setCurrentIndex(newIndex);
    };

    // Función para ir a la siguiente categoría
    const handleNext = () => {
        // Fórmula para avanzar y dar la vuelta al llegar al final
        const newIndex = (currentIndex + 1) % categorias.length;
        setCurrentIndex(newIndex);
    };

    // Función para actualiza el número y nombre del canal seleccionado
    function seleccionarCanal(channel) {
        if (channel.num !== selectedChannel.num) {
            setSelectedChannel(channel);
        }
    }

    const renderPlayer = () => (
        <TouchableOpacity
            style={isFullScreen ? styles.fullScreenVideo : styles.videoPlayerContainer}
            onPress={() => setIsFullScreen(!isFullScreen)} // 👈 6. Activa/desactiva la pantalla completa
        >
            <Video
                source={{ uri: selectedChannel.link }} // ⚠️ ¡IMPORTANTE! Reemplaza 'stream_url' con el nombre de la propiedad que contiene la URL del video en tu objeto 'canal'
                style={styles.videoPlayer}
                controls={true} // Muestra los controles nativos (play, pausa, etc.)
                resizeMode="contain"
                fullscreen={isFullScreen}
                onEnd={() => setIsFullScreen(false)} // Opcional: sale de pantalla completa al terminar
            />
        </TouchableOpacity>
    );

    return (
        <ImageBackground
            source={require('../../assets/fondo2.jpg')}
            style={styles.fondo}
            resizeMode='cover'
        >
            <View style={styles.opacidad}>
                <View style={styles.container}>
                    {!isFullScreen && (
                        <View style={styles.listaContainer}>
                            <View style={styles.logoContainer}>
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.flechaIcono}>
                                    <Icon name="arrow-circle-left" size={26} color="white" />
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <Image
                                        source={require('../../assets/imagotipo_live.png')}
                                        style={styles.imagotipo}
                                    />
                                </View>
                            </View>
                            <View style={styles.categoriaContanier}>
                                <TouchableOpacity onPress={handlePrevious} style={{ paddingHorizontal: 5 }} >
                                    <Icon2 name="arrow-left" size={26} color="white" />
                                </TouchableOpacity>
                                <View style={{ flex: 1, alignItems: categorias[currentIndex].category_name.length > 28 ? 'stretch' : 'center' }}>
                                    <TextTicker
                                        style={styles.categoryText}
                                        duration={10000}
                                        loop
                                        bounce={false}
                                        repeatSpacer={100}
                                        marqueeDelay={250}
                                    >
                                        {categorias[currentIndex].category_name}
                                    </TextTicker>
                                </View>
                                <TouchableOpacity onPress={handleNext} style={{ paddingHorizontal: 5 }} >
                                    <Icon2 name="arrow-right" size={26} color="white" />
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                data={contenido}
                                numColumns={1}
                                renderItem={({ item }) => (
                                    <ItemChannel
                                        canal={item}
                                        seleccionado={selectedChannel.num}
                                        seleccionar={seleccionarCanal}
                                    />
                                )}
                                keyExtractor={item => item.num}
                            />
                        </View>
                    )}
                    <View style={isFullScreen ? styles.fullScreenContainer : styles.reproductorContainer}>
                        {!isFullScreen && (
                            <View>
                                <View style={styles.barraContainer}>
                                    <View style={styles.busquedaContainer}>
                                        <BarraBusqueda message='Buscar canal' searchText={''} />
                                    </View>
                                    <TouchableOpacity style={styles.searchBarIcono}>
                                        <Icon name='search' size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.textContainer}>
                                    <TextTicker
                                        style={styles.nameText}
                                        duration={10000}
                                        loop
                                        bounce={false}
                                        repeatSpacer={100}
                                        marqueeDelay={250}
                                    >
                                        {selectedChannel.name}
                                    </TextTicker>
                                </View>
                            </View>
                        )}
                        <Reproductor
                            tipo={'live'}
                            fullScreen={isFullScreen}
                            setFullScreen={(value) => setIsFullScreen(value)}
                            contenido={selectedChannel}
                            data={[]}
                        />
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    fondo: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    opacidad: {
        flex: 1,
        backgroundColor: 'rgba(16,16,16,0.5)'
    },
    container: {
        flexDirection: 'row',
        flex: 1,
    },
    listaContainer: {
        flex: 4,
    },
    reproductorContainer: {
        flex: 6,
        flexDirection: 'column',
    },
    fullScreenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 10, // Se asegura de que esté por encima de todo
    },
    logoContainer: {
        flexDirection: 'row',
        height: '12.5%',
    },
    barraContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 0.75,
        paddingHorizontal: 10,
    },
    busquedaContainer: {
        flex: 1,
        alignItems: 'center'
    },
    flechaIcono: {
        paddingHorizontal: 15,
        paddingVertical: 12.5
    },
    categoriaContanier: {
        height: '10%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBarIcono: {
        marginLeft: 10,
        marginRight: 5
    },
    imagotipo: {
        height: '100%',
        width: '100%',
        resizeMode: 'contain'
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 11,
        paddingHorizontal: 5,
    },
    categoryText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    nameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    }
});

export default Canal;