import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Image, ImageBackground, Vibration, BackHandler, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery } from '@realm/react';
import { showMessage, hideMessage } from 'react-native-flash-message';
import { useStreaming } from '../../services/hooks/useStreaming';
import ItemCategory from '../../components/Items/item_category';
import CardContenido from '../../components/Cards/card_contenido';
import SearchBar from '../../components/SearchBar';
import ModalConfirmation from '../../components/Modals/modal_confirmation';
import ModalLoading from '../../components/Modals/modal_loading';

const Seccion = ({ navigation, route }) => {
    const type = route.params.tipo; //Obtiene el tipo de Multimedia seleccionada
    const username = route.params.username; // Obtiene el nombre de usuario
    const [category, setCategory] = useState(null); //Estado para manejar la categoria seleccionada
    const [searchCat, setSearchCat] = useState(''); //Estado para manejar la búsqueda de categorias
    const [searchCont, setSearchCont] = useState(''); //Estado para manejar la búsqueda de contenido
    const [mostrarBusqueda, setMostrarBusqueda] = useState(false); //Estado para manejar cuando mostrar la barra de busqueda
    const [confirmationResult, setConfirmationResult] = useState(null); //Estado para manejar la respuesta del modal de confirmación
    const [showModal, setShowModal] = useState(false); //Estado para manejar el modal de confirmación
    const [itemToDelete, setItemToDelete] = useState(null); //Estado para manejar el item seleccionado
    const [loading, setLoading] = useState(false); //Estado para manejar el modal de carga
    const flatListRef = useRef(null);   //Referencia al FlatList del contenido

    const { getModelName, getWatchedItems, getFavoriteItems, getLastPlayedEpisode, unmarkItemsAsWatched, unmarkItemsAsFavorite, updateProps } = useStreaming();
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

    // Memo para guardar y mantener actualizado el contenido de la categoría de Favoritos
    const favoritos = useMemo(() => {
        return categories.find(c => c.category_id === '0.3');
    }, [categories]);

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

    // useEffect para manejar las opciones del modal de confirmación
    useEffect(() => {
        // Si el usuario presionó "Aceptar" y hay un item para eliminar
        if (confirmationResult === true && itemToDelete) {
            updateProps(type, false, itemToDelete.id, { visto: false, fecha_visto: null }); // Actualiza la propiedad del item en el schema

            const vistos = categories.find(categoria => categoria.category_id === '0.2');
            const currentTotal = vistos.total;
            let newTotal = Math.max(0, currentTotal - 1);

            updateProps(type, true, vistos.category_id, { total: newTotal }); // Actualiza la propiedad de la categoría en el schema
        }

        // Limpia los estados después de cualquier acción (Aceptar o Cancelar)
        if (confirmationResult !== null) {
            setConfirmationResult(null);
            setItemToDelete(null);
        }
    }, [confirmationResult, itemToDelete]);

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

    //Obtiene el último episodio reproducido de una serie
    const ultimoEpisodioReproducido = (item) => {
        if (tipo === 'series' && category.category_id === '0.2' && item.visto) {
            const episodio = getLastPlayedEpisode(item.series_id, item.last_ep_played[0], item.last_ep_played[1]);
            return {
                duration_secs: episodio.duration_secs,
                playback_time: episodio.playback_time
            }
        } else {
            return null;
        }
    };

    const handleBack = () => {
        hideMessage();
        navigation.goBack();
    };

    useEffect(() => {
        const backAction = () => {
            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

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

    const handleShowModal = useCallback((item) => {
        setItemToDelete(item); // Guarda el item que se quiere eliminar
        setShowModal(true);
        setConfirmationResult(null); // Reinicia el resultado
    }, []);

    const handleAccept = () => {
        setShowModal(false);
        setConfirmationResult(true);
    };

    const handleCancel = () => {
        setShowModal(false);
        setConfirmationResult(false);
    };

    const getItemLayout = useCallback((data, index) => ({
        length: type === 'live' ? 100 : 160,
        offset: (type === 'live' ? 100 : 160) * index,
        index,
    }), [type]);

    const showToast = (mensaje, numStyle) => {
        Vibration.vibrate();

        showMessage({
            message: mensaje,
            type: 'default',
            duration: 1000,
            backgroundColor: '#EEE',
            color: '#000',
            style: numStyle === 1 ? styles.flashMessage1 : styles.flashMessage2,
        });
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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0.5)' }}>
                    <View style={styles.container}>
                        <View style={styles.categoriasContainer}>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{ paddingHorizontal: 15, paddingVertical: 12.5, }}
                                    onPress={handleBack}
                                    onLongPress={() => showToast('Regresar', 1)}
                                >
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
                                    keyboardShouldPersistTaps="handled"
                                    keyboardDismissMode="on-drag"
                                />
                            )}
                        </View>
                        <View style={styles.contenidoContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: mostrarBusqueda ? 0 : 10, paddingHorizontal: 10, }}>
                                <View style={{ flexDirection: 'row', width: (category?.category_id === '0.2' || category?.category_id === '0.3') ? '12.5%' : '5%', justifyContent: 'space-between', }}>
                                    {(category?.category_id === '0.2' || category?.category_id === '0.3') && (
                                        <TouchableOpacity
                                            style={{ opacity: category?.total > 0 ? 1 : 0.5 }}
                                            onPress={handleUnmarkItems}
                                            onLongPress={() => showToast(category?.category_id === '0.2' ? 'Eliminar Historial' : 'Quitar Favoritos', 2)}
                                            disabled={category?.total > 0 ? false : true}
                                        >
                                            <Icon2 name={category?.category_id === '0.2' ? 'eye-remove' : 'heart-remove'} size={26} color="#FFF" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={{ paddingRight: 5 }}
                                        onPress={() => setMostrarBusqueda(prev => !prev)}
                                        onLongPress={() => showToast(mostrarBusqueda ? 'Ocultar Barra de Búsqueda' : 'Mostrar Barra de Búsqueda', 2)}
                                    >
                                        <Icon name={mostrarBusqueda ? 'long-arrow-right' : 'search'} size={26} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, alignItems: 'center', }}>
                                    {mostrarBusqueda ? (
                                        <SearchBar
                                            message={`Buscar ${type === 'live' ? 'canal' : (type === 'vod' ? 'película' : 'serie')}`}
                                            searchText={searchCont} setSearchText={setSearchCont}
                                        />
                                    ) : (
                                        <Text style={styles.sectionTitle}>{category?.category_name}</Text>
                                    )}
                                </View>
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
                                            favoritos={{
                                                category_id: favoritos.category_id,
                                                total: favoritos.total
                                            }}
                                            idCategory={category.category_id}
                                            episodio={() => ultimoEpisodioReproducido(item)}
                                            onStartLoading={handleStartLoading}
                                            onFinishLoading={handleFinishLoading}
                                            hideMessage={() => hideMessage()}
                                            showModal={handleShowModal}
                                            username={username}
                                        />
                                    )}
                                    getItemLayout={getItemLayout}
                                    keyExtractor={item => type === 'series' ? item.series_id : item.stream_id}
                                    initialNumToRender={20}
                                    maxToRenderPerBatch={10}
                                    windowSize={5}
                                    removeClippedSubviews={true}
                                    updateCellsBatchingPeriod={50}
                                    keyboardShouldPersistTaps="handled"
                                    keyboardDismissMode="on-drag"
                                />
                            )}
                        </View>
                    </View>

                    <ModalConfirmation
                        visible={showModal}
                        onConfirm={handleAccept}
                        onCancel={handleCancel}
                        numdId={2}
                        itemName={itemToDelete?.nombre}
                    />

                    <ModalLoading visible={loading} />
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
    },
    categoriasContainer: {
        width: '25%',
    },
    contenidoContainer: {
        width: '75%',
        paddingLeft: '0.75%',
        paddingRight: '1%',
    },
    sectionTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
    },
    flashMessage1: {
        width: '12.5%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingTop: 1,
        paddingBottom: 5,
        marginTop: '5%',
        marginLeft: 1
    },
    flashMessage2: {
        width: '25%',
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingTop: 1,
        paddingBottom: 5,
        marginTop: '5%',
        marginLeft: '25.5%'
    },
});

export default Seccion;
