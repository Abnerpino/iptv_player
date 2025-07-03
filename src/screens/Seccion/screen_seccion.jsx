import React, { useState, useEffect, useMemo } from 'react';
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
    const live = useMemo(() => [...getItems('live')], []);
    const vod = useMemo(() => [...getItems('vod')], []);
    const series = useMemo(() => [...getItems('series')], []);

    //Las categorias y el contenido se mantienen acutalizados cada que el store cambia
    const [categories, content] = useMemo(() => {
        if (type === 'live') return [catsLive, live];
        if (type === 'vod') return [catsVod, vod];
        return [catsSeries, series];
    }, [type, catsLive, catsVod, catsSeries, live, vod, series]);

    const [category, setCategory] = useState('TODO'); //Estado para manejar el nombre de la categoria seleccionada
    const [selectedId, setSelectedId] = useState('0.1'); //Estado para el manejo del ID de la categoria seleccionada
    const [contenido, setContenido] = useState(content); //Estado para manejar el contenido por categoria
    const [mensaje, setMensaje] = useState(''); //Estado para manejar el mensaje a mostrar cuando Favoritos y Recientemente Visto estén vacios
    const [searchCat, setSearchCat] = useState(''); //Estado para manejar la búsqueda de categorias
    const [searchCont, setSearchCont] = useState(''); //Estado para manejar la búsqueda de contenido
    const [mostrarBusqueda, setMostrarBusqueda] = useState(false); //Estado para manejar cuando mostrar la barra de busqueda
    const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga

    const handleStartLoading = () => setLoading(true); //Cambia el valor a verdadero para que se muestre el modal de carga
    const handleFinishLoading = () => setLoading(false); //Cambia el valor a falso para que se cierre el modal de carga

    //Filtra las categorias según sea la busqueda
    const filteredCategories = useMemo(() => {
        return categories.filter(item =>
            item.category_name.toLowerCase().includes(searchCat.toLowerCase())
        );
    }, [searchCat, categories]);

    //Filtra el contenido según sea la búsqueda
    const filteredContent = useMemo(() => {
        return contenido.filter(item =>
            item.name?.toLowerCase().includes(searchCont.toLowerCase())
        );
    }, [searchCont, contenido]);

    //Actualiza el contenido de las categorias (especialmente Favoritos y Vistos) cuando hay un cambio
    useEffect(() => {
        switch (category) {
            case 'TODO':
                setContenido(content);
                break;
            case 'RECIENTEMENTE VISTO':
                const vistos = content.filter(item => item.visto === true);
                dispatch(changeCategoryProperties({
                    type: type,
                    categoryId: '0.2',
                    changes: { total: vistos.length }
                }));
                setContenido(vistos);
                if (vistos.length < 1) {
                    setMensaje(type === 'live' ? 'Sin canales vistos' : (type === 'vod' ? 'Sin películas vistas' : 'Sin series vistas'))
                }
                break;
            case 'FAVORITOS':
                const favoritos = content.filter(item => item.favorito === true);
                dispatch(changeCategoryProperties({
                    type: type,
                    categoryId: '0.3',
                    changes: { total: favoritos.length }
                }));
                setContenido(favoritos);
                if (favoritos.length < 1) {
                    setMensaje(type === 'live' ? 'Sin canales favoritos' : (type === 'vod' ? 'Sin películas favoritas' : 'Sin series favoritas'))
                }
                break;
            default:
                const filtrado = content.filter(item => item.category_ids.some(id => id == selectedId));
                setContenido(filtrado);
                break;
        }
    }, [category]);

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

                        {(category === 'FAVORITOS' && contenido.length === 0) || (category === 'RECIENTEMENTE VISTO' && contenido.length === 0) ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <Text style={{ color: 'white', fontSize: 18, fontStyle: 'italic' }}>{mensaje}</Text>
                            </View>
                        ) : filteredContent.length === 0 ? (
                            <View style={{ padding: 10 }}>
                                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
                                    No se ha encontrado {type === 'live' ? 'el canal' : (type === 'vod' ? 'la película' : 'la serie')}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredContent}
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
                                keyExtractor={item => item.num.toString()}
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
