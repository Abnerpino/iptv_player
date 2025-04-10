import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import MenuLateral from '../../components/MenuLateral';
import CardItem from '../../components/Cards/card_item';
import Icon from 'react-native-vector-icons/FontAwesome';

const Seccion = ({ navigation, route }) => {
    const type = route.params.tipo; //Obtiene el tipo de Multimedia seleccionada
    const { catsTv, catsMovies, catsSeries } = useSelector(state => state.categories); //Obtiene las categorias del estado global
    const { tv, movies, series } = useSelector(state => state.content); //Obtiene el contenido del estado global
    
    //Las categorias y el contenido se mantienen acutalizados cada que el store cambia
    const [categories, content] = useMemo(() => {
        if (type === 'TV') return [catsTv, tv];
        if (type === 'Cine') return [catsMovies, movies];
        return [catsSeries, series];
    }, [type, catsTv, catsMovies, catsSeries, tv, movies, series]);
    
    const [category, setCategory] = useState('TODO'); //Estado para manejar el nombre de la categoria seleccionada
    const [selectedId, setSelectedId] = useState(1); //Estado para el manejo del ID de la categoria seleccionada
    const [contenido, setContenido] = useState(content); //Estado para manejar el contenido por categoria
    const [mensaje, setMensaje] = useState(''); //Estado para manejar el mensaje a mostrar cuando Favoritos y Recientemente Visto estén vacios

    //Actualiza el contenido de las categorias (especialmente Favoritos) cuando hay un cambio
    useEffect(() => {
        if (category === 'RECIENTEMENTE VISTO') {
            const vistos = content.filter(item => item.visto === true);
            setContenido(vistos);
            if (vistos.length < 1) {
                setMensaje(type === 'TV' ? 'Sin canales vistos' : (type === 'Cine' ? 'Sin películas vistas' : 'Sin series vistas'))
            }
        } else if (category === 'FAVORITOS') {
            const favoritos = content.filter(item => item.favorito === true);
            setContenido(favoritos);
            if (favoritos.length < 1) {
                setMensaje(type === 'TV' ? 'Sin canales favoritos' : (type === 'Cine' ? 'Sin películas favoritas' : 'Sin series favoritas'))
            }
        } else if (category === 'TODO') {
            setContenido(content);
        } else {
            const filtrado = content.filter(item => item['group-title'] === category);
            setContenido(filtrado);
        }
    }, [content, category]);

    //Muestra el contenido de la categoria seleccionada
    function seleccionarCategoria(idCategoria) {
        if (idCategoria !== selectedId) {
            setSelectedId(idCategoria);
            const nameCategory = categories.find(item => item.id === idCategoria);
            setCategory(nameCategory.name);
        }
    }

    return (
        <View style={{ flexDirection: 'column', flex: 1, backgroundColor: '#000' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
                    <Icon name="arrow-circle-left" size={26} color="white"/>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>{category}</Text>
                </View>
            </View>
            <View style={styles.container}>
                <View style={styles.menuContainer}>
                    <Text style={styles.menuTitle}>Buscar en categorias</Text>
                    <FlatList
                        data={categories}
                        numColumns={1}
                        renderItem={({ item }) => (
                            <MenuLateral
                                categoria={item}
                                seleccionado={selectedId}
                                seleccionar={seleccionarCategoria}
                            />
                        )}
                        keyExtractor={item => item.id}

                    />
                </View>
                <View style={styles.peliculasContainer}>
                    {(category === 'FAVORITOS' && contenido.length === 0) || (category === 'RECIENTEMENTE VISTO' && contenido.length === 0) ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>{mensaje}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={contenido}
                            numColumns={5}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <CardItem
                                    navigation={navigation}
                                    id={item.id}
                                    imagen={item['tvg-logo']}
                                    titulo={item['tvg-name']}
                                    link={item.link}
                                    visto={item.visto}
                                    temporadas={item.temporadas}
                                    tipo={type}
                                />
                            )}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        backgroundColor: '#000',
    },
    menuContainer: {
        width: '25%',
        backgroundColor: '#101010',
    },
    menuTitle: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 10,
    },
    peliculasContainer: {
        width: '75%',
    },
    sectionTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
    },
    movieItem: {
        flex: 1,
        margin: 5,
    },
    movieImage: {
        width: 120,
        height: 180,
        borderRadius: 5,
    },
    ratingContainer: {
        position: 'absolute',
        top: 5,
        left: 5,
        backgroundColor: '#007ACC',
        padding: 2,
        borderRadius: 3,
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
    },
    movieTitle: {
        color: '#FFF',
        fontSize: 12,
        marginTop: 5,
    },
    movieYear: {
        color: '#FFF',
        fontSize: 10,
    },
});

export default Seccion;
