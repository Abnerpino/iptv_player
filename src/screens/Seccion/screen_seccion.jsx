import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import { getItems } from '../../services/realm/streaming';
import ItemCategory from '../../components/Items/item_category';
import CardContenido from '../../components/Cards/card_contenido';
import BarraBusqueda from '../../components/BarraBusqueda';
import ModalLoading from '../../components/Modals/modal_loading';
import { changeCategoryProperties } from '../../services/redux/slices/streamingSlice';

const Seccion = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const type = route.params.tipo; //Obtiene el tipo de Multimedia seleccionada
    const { catsLive, catsVod, catsSeries } = useSelector(state => state.streaming);
    const [searchCat, setSearchCat] = useState(''); //Estado para manejar la búsqueda de categorias
    const [searchCont, setSearchCont] = useState(''); //Estado para manejar la búsqueda de contenido
    const [mostrarBusqueda, setMostrarBusqueda] = useState(false); //Estado para manejar cuando mostrar la barra de busqueda
    const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga
    const flatListRef = useRef(null);   //Referencia al FlatList del contenido

    // Obtiene las categorías correctas según el tipo
    const categories = useMemo(() => {
        if (type === 'live') return catsLive;
        if (type === 'vod') return catsVod;
        return catsSeries;
    }, [type, catsLive, catsVod, catsSeries]);

    const [category, setCategory] = useState(categories[3].category_name); //Estado para manejar el nombre de la categoria seleccionada
    const [selectedId, setSelectedId] = useState(categories[3].category_id); //Estado para el manejo del ID de la categoria seleccionada

    const handleStartLoading = useCallback(() => setLoading(true), []); //Cambia el valor a verdadero para que se muestre el modal de carga
    const handleFinishLoading = useCallback(() => setLoading(false), []); //Cambia el valor a falso para que se cierre el modal de carga

    // Este useMemo construye la consulta de Realm dinámicamente
    const contentToShow = useMemo(() => {
        // 1. Obtenemos la colección base de Realm (sin filtrar)
        let baseQuery = getItems(type);

        // 2. Aplicamos el filtro de categoría
        switch (category) {
            case 'RECIENTEMENTE VISTO':
                baseQuery = baseQuery.filtered('visto == true');
                break;
            case 'FAVORITOS':
                baseQuery = baseQuery.filtered('favorito == true');
                break;
            case 'TODO':
                // No se aplica ningún filtro de categoría
                break;
            default:
                // Filtra por el ID de la categoría seleccionada
                baseQuery = baseQuery.filtered('category_ids == $0', selectedId);
                break;
        }

        // 3. Aplicamos el filtro de búsqueda si existe
        if (searchCont.trim() !== '') {
            baseQuery = baseQuery.filtered('name CONTAINS[c] $0', searchCont);
        }

        // 4. El resultado es una colección de Realm ya filtrada y optimizada
        return baseQuery;
    }, [type, category, selectedId, searchCont]); // Se re-ejecuta solo cuando un filtro cambia

    //useEffect para actualizar los totales en Redux
    useEffect(() => {
        // Obtenemos la colección base sin filtros
        const allContent = getItems(type);

        // Usamos .filtered().length para un conteo súper rápido
        const totalVistos = allContent.filtered('visto == true').length;
        const totalFavoritos = allContent.filtered('favorito == true').length;

        // Despachamos los totales a Redux
        dispatch(changeCategoryProperties({
            type: type,
            categoryId: '0.2', // ID para 'Recientemente Visto'
            changes: { total: totalVistos }
        }));

        dispatch(changeCategoryProperties({
            type: type,
            categoryId: '0.3', // ID para 'Favoritos'
            changes: { total: totalFavoritos }
        }));

    }, [type, dispatch]); // Se ejecuta solo cuando cambia el tipo de contenido

    useEffect(() => {
        // Si la lista tiene contenido, la mandamos al inicio.
        if (flatListRef.current && contentToShow.length > 0) {
            flatListRef.current.scrollToIndex({
                index: 0,
                animated: false,
            });
        }
    }, [selectedId]);

    //Filtra las categorias según sea la busqueda
    const filteredCategories = useMemo(() => {
        return categories.filter(item =>
            item.category_name.toLowerCase().includes(searchCat.toLowerCase())
        );
    }, [searchCat, categories]);

    //Muestra el contenido de la categoria seleccionada
    function seleccionarCategoria(idCategoria) {
        if (idCategoria !== selectedId) {
            setSelectedId(idCategoria);
            const categoria = categories.find(item => item.category_id === idCategoria);
            setCategory(categoria.category_name);
        }
    }

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
                        <View style={{ flexDirection: 'row', height: '12.5%' }}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15, paddingVertical: 12.5 }}>
                                <Icon name="arrow-circle-left" size={26} color="white" />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Image
                                    source={require('../../assets/imagotipo.png')}
                                    style={{ height: '100%', width: '100%', resizeMode: 'contain' }}
                                />
                            </View>
                        </View>
                        <BarraBusqueda message={"Buscar categoría"} searchText={searchCat} setSearchText={setSearchCat} />

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
                                        seleccionado={selectedId}
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: mostrarBusqueda ? 0 : 10, paddingHorizontal: 10 }}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                {mostrarBusqueda ? (
                                    <BarraBusqueda message={`Buscar ${type === 'live' ? 'canal' : (type === 'vod' ? 'película' : 'serie')}`} searchText={searchCont} setSearchText={setSearchCont} />
                                ) : (
                                    <Text style={styles.sectionTitle}>{category}</Text>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => setMostrarBusqueda(prev => !prev)} style={{ marginLeft: 10, marginRight: 5 }}>
                                <Icon name={mostrarBusqueda ? 'long-arrow-right' : 'search'} size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {(category === 'FAVORITOS' && contentToShow.length === 0) ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>
                                    {type === 'live' ? 'Sin canales favoritos' : (type === 'vod' ? 'Sin películas favoritas' : 'Sin series favoritas')}
                                </Text>
                            </View>
                        ) : (category === 'RECIENTEMENTE VISTO' && contentToShow.length === 0) ? (
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
                                        onStartLoading={handleStartLoading}
                                        onFinishLoading={handleFinishLoading}
                                    />
                                )}
                                keyExtractor={item => type === 'series' ? item.series_id.toString() : item.stream_id.toString()}
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
