import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';
import ItemCategory from '../../components/Items/item_category';
import CardContenido from '../../components/Cards/card_contenido';
import SearchBar from '../../components/SearchBar';
import ModalLoading from '../../components/Modals/modal_loading';

const Seccion = ({ navigation, route }) => {
    const type = route.params.tipo; //Obtiene el tipo de Multimedia seleccionada
    const [category, setCategory] = useState(null); //Estado para manejar la categoria seleccionada
    const [searchCat, setSearchCat] = useState(''); //Estado para manejar la búsqueda de categorias
    const [searchCont, setSearchCont] = useState(''); //Estado para manejar la búsqueda de contenido
    const [mostrarBusqueda, setMostrarBusqueda] = useState(false); //Estado para manejar cuando mostrar la barra de busqueda
    const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga
    const flatListRef = useRef(null);   //Referencia al FlatList del contenido

    const { getModelName, getWatchedItems, getFavoriteItems, unmarkItemsAsWatched, unmarkItemsAsFavorite, updateProps } = useStreaming();
    const categoryModel = getModelName(type, true);
    const categories = useQuery(categoryModel);

    const handleStartLoading = useCallback(() => setLoading(true), []); //Cambia el valor a verdadero para que se muestre el modal de carga
    const handleFinishLoading = useCallback(() => setLoading(false), []); //Cambia el valor a falso para que se cierre el modal de carga

    const contentField = type === 'live' ? 'canales' : (type === 'vod' ? 'peliculas' : 'series');

    // Efecto para establecer la categoría inicial solo hasta cuando las categorías se han cargado
    useEffect(() => {
        if (!category && categories.length > 3) {
            setCategory(categories[3]);
        }
    }, [type, categories]);

    // Memo para guardar y mantener actualizado el contenido de las categorías
    const contentToShow = useMemo(() => {
        if (!category) return [];

        let contenido = category[contentField]; //Obtiene el contenido de Realm de acuerdo al tipo

        if (category.category_id === '0.2') {
            contenido = getWatchedItems(type); //Filtra el contenido 'Recientemente Visto'
        }

        if (category.category_id === '0.3') {
            contenido = getFavoriteItems(type); //Filtra el contenido 'Favorito'
        }

        if (searchCont.trim() !== '') {
            contenido = contenido.filtered('name CONTAINS[c] $0', searchCont); //Filtra por el término de búqueda si es que existe
        }

        return contenido; // Retorna una colección de Realm ya filtrada y optimizada
    }, [type, category, searchCont]); // Se re-ejecuta solo cuando un filtro cambia

    useEffect(() => {
        // Si la lista tiene contenido, la mandamos al inicio.
        if (flatListRef.current && contentToShow.length > 0) {
            flatListRef.current.scrollToIndex({
                index: 0,
                animated: false,
            });
        }
    }, [category]);

    //Filtra las categorias según sea la busqueda
    const filteredCategories = useMemo(() => {
        return categories.filter(item =>
            item.category_name.toLowerCase().includes(searchCat.toLowerCase())
        );
    }, [searchCat, categories]);

    //Muestra el contenido de la categoria seleccionada
    function seleccionarCategoria(selectCategory) {
        if (selectCategory.category_id !== category.category_id) {
            setCategory(selectCategory);
        }
    }

    // Quita items de las categorias 'Recientemente Vistos' y 'Favoritos' marcando con 'false' las propiedades 'visto' y 'favorito',
    const handleUnmarkItems = () => {
        if (category.category_id === '0.2') { // Si la categoría es 'Recientemente Vistos'
            unmarkItemsAsWatched(type); // Marca como No Vistos (false) los items que ya han sido Vistos (true)
            updateProps(type, true, category.category_id, { total: 0 }); // Actualiza el total de la categoría Vistos a 0
        }

        if (category.category_id === '0.3') { // Si la categoría es 'Favoritos'
            unmarkItemsAsFavorite(type); // Desmarca como Favoritos (false) los items que ya han sido marcados como Favoritos (true)
            updateProps(type, true, category.category_id, { total: 0 }); // Actualiza el total de la categoría Favoritos a 0
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/fondo2.jpg')}
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
            }}
            resizeMode='cover'
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.5)' }}>
                <View style={styles.container}>
                    <View style={styles.menuContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15, paddingVertical: 12.5, }}>
                                <Icon name="arrow-circle-left" size={26} color="white" />
                            </TouchableOpacity>
                            <Image
                                source={require('../../assets/imagotipo.png')}
                                style={{ height: '100%', width: '76%', resizeMode: 'contain', }}
                            />
                        </View>
                        <SearchBar message={"Buscar categoría"} searchText={searchCat} setSearchText={setSearchCat} />

                        {filteredCategories.length === 0 ? (
                            <View style={{ padding: 10 }}>
                                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>No se ha encontrado la categoría</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredCategories}
                                numColumns={1}
                                renderItem={({ item }) => (
                                    <ItemCategory
                                        categoria={item}
                                        seleccionado={category?.category_id}
                                        seleccionar={seleccionarCategoria}
                                    />
                                )}
                                keyExtractor={item => item.category_id}
                                initialNumToRender={20}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                removeClippedSubviews={true}
                                updateCellsBatchingPeriod={50}
                            />
                        )}

                    </View>
                    <View style={styles.peliculasContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: mostrarBusqueda ? 0 : 10, paddingHorizontal: 10, }}>
                            <View style={{ flex: 1, alignItems: 'center', }}>
                                {mostrarBusqueda ? (
                                    <SearchBar message={`Buscar ${type === 'live' ? 'canal' : (type === 'vod' ? 'película' : 'serie')}`} searchText={searchCont} setSearchText={setSearchCont} />
                                ) : (
                                    <Text style={styles.sectionTitle}>{category?.category_name}</Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setMostrarBusqueda(prev => !prev)} style={{ marginLeft: 20, }}>
                                <Icon name={mostrarBusqueda ? 'long-arrow-right' : 'search'} size={26} color="#FFF" />
                            </TouchableOpacity>
                            {(category?.category_id === '0.2' || category?.category_id === '0.3') && (
                                <TouchableOpacity
                                    style={{ marginLeft: 20, opacity: category?.total > 0 ? 1 : 0.5 }}
                                    onPress={handleUnmarkItems}
                                    disabled={category?.total > 0 ? false : true}
                                >
                                    <Icon2 name={category?.category_id === '0.2' ? 'eye-remove' : 'heart-remove'} size={26} color="#FFF" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {(category?.category_id === '0.3' && contentToShow.length === 0) ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>
                                    {type === 'live' ? 'Sin canales favoritos' : (type === 'vod' ? 'Sin películas favoritas' : 'Sin series favoritas')}
                                </Text>
                            </View>
                        ) : (category?.category_id === '0.2' && contentToShow.length === 0) ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>
                                    {type === 'live' ? 'Sin canales vistos' : (type === 'vod' ? 'Sin películas vistas' : 'Sin series vistas')}
                                </Text>
                            </View>
                        ) : contentToShow.length === 0 ? (
                            <View style={{ padding: 10 }}>
                                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                                    No se ha encontrado {type === 'live' ? 'el canal' : (type === 'vod' ? 'la película' : 'la serie')}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={contentToShow}
                                numColumns={5}
                                renderItem={({ item }) => (
                                    <CardContenido
                                        navigation={navigation}
                                        tipo={type}
                                        item={item}
                                        idCategory={category.category_id}
                                        onStartLoading={handleStartLoading}
                                        onFinishLoading={handleFinishLoading}
                                    />
                                )}
                                keyExtractor={item => type === 'series' ? item.series_id : item.stream_id}
                                initialNumToRender={20}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                removeClippedSubviews={true}
                                updateCellsBatchingPeriod={50}
                            />
                        )}
                    </View>
                </View>
                <ModalLoading visible={loading} />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
    },
    menuContainer: {
        width: '25%',
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
});

export default Seccion;
