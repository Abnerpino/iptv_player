import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableHighlight, TouchableNativeFeedback, StyleSheet, Vibration, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useQuery } from '@realm/react';
import { useStreaming } from '../../services/hooks/useStreaming';

const ItemChannel = ({ canal, index, seleccionado, seleccionar, upTag, rightTag, isOnReproductor }) => {
    const { getModelName, updateProps } = useStreaming();
    const categoryModel = getModelName('live', true);
    const categories = useQuery(categoryModel);
    const favoritos = categories.find(categoria => categoria.category_id === '0.3');
    const [favorite, setFavorite] = useState(canal?.favorito ?? false);
    const [error, setError] = useState(false);
    const [focusTags, setFocusTags] = useState({ up: null, right: null }); // Estado para manejar las etiqueta de los elementos para la navegación

    const backgroundColor = canal.num === seleccionado ? '#006172' : 'rgba(16,16,16,0)'; // Cambia el color según la selección
    const borderBottomColor = isOnReproductor ? '#999' : '#303030'; // Establece el color dependiendo de si el item se muestra dentro o fuera del reproductor
    const focusRipple = canal.num !== seleccionado ? TouchableNativeFeedback.Ripple('#FFD700', false) : undefined;

    useEffect(() => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        let arriba, derecha = null;

        if (index === 0 && upTag) {
            arriba = upTag;
        }
        if (rightTag) {
            derecha = rightTag;
        }

        setFocusTags({ up: arriba, right: derecha });
    }, [index, upTag, rightTag])

    const handleToggleFavorite = () => {
        Vibration.vibrate();

        const newFavoriteStatus = !favorite;
        setFavorite(newFavoriteStatus);

        updateProps('live', false, canal.stream_id, { favorito: newFavoriteStatus }); // Actualiza el item en el schema

        const currentTotal = favoritos.total;
        let newTotal = newFavoriteStatus ? currentTotal + 1 : Math.max(0, currentTotal - 1);

        updateProps('live', true, favoritos.category_id, { total: newTotal }); // Actualiza el total de la categoría Favoritos
    };

    return (
        <>
            {Platform.isTV ? (
                // Diseño para TV
                <View style={[styles.wrapper, { backgroundColor, borderBottomColor }]}>
                    <TouchableNativeFeedback
                        onPress={() => seleccionar(canal)}
                        onLongPress={handleToggleFavorite}
                        background={focusRipple}
                        useForeground={false}
                        nextFocusUp={focusTags.up}
                        nextFocusRight={focusTags.right}
                        hasTVPreferredFocus={canal.num === seleccionado}
                    >
                        <View style={[
                            styles.content,
                            { padding: 5 },
                            canal.num === seleccionado && { backgroundColor: '#006172' }
                        ]}>
                            <Text style={styles.textoNum}>{canal.num}</Text>
                            <View style={styles.imageContainer}>
                                <FastImage
                                    style={styles.imagen}
                                    source={canal.stream_icon && !error ?{
                                        uri: canal.stream_icon,
                                        priority: FastImage.priority.normal
                                    } : require('../../assets/icono.png')}
                                    resizeMode={FastImage.resizeMode.contain}
                                    onError={() => setError(true)}
                                />
                            </View>
                            <Text style={styles.textoName} numberOfLines={1}>{canal.name}</Text>
                            <View style={{ width: '10%' }}>
                                {canal.favorito && (
                                    <Icon name={"heart"} size={20} color={"red"} />
                                )}
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            ) : (
                // Diseño para Móvil
                <TouchableHighlight
                    style={[styles.wrapper, { padding: 5, backgroundColor, borderBottomColor }]}
                    onPress={() => seleccionar(canal)}
                    onLongPress={handleToggleFavorite}
                    underlayColor={canal.num !== seleccionado ? "#D5700F" : "#006172"}
                >
                    <View style={styles.content}>
                        <Text style={styles.textoNum}>{canal.num}</Text>
                        <View style={styles.imageContainer}>
                            <FastImage
                                style={styles.imagen}
                                source={{
                                    uri: canal.stream_icon,
                                    priority: FastImage.priority.normal
                                }}
                                resizeMode={FastImage.resizeMode.contain}
                                onError={() => setError(true)}
                            />
                        </View>
                        <Text style={styles.textoName} numberOfLines={1}>{canal.name}</Text>
                        <View style={{ width: '10%' }}>
                            {canal.favorito && (
                                <Icon name={"heart"} size={20} color={"red"} />
                            )}
                        </View>
                    </View>
                </TouchableHighlight>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        height: 50,
        borderBottomWidth: 1,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textoNum: {
        width: '15%',
        color: '#FFF',
        fontSize: Platform.isTV ? 16 : 14,
        textAlign: 'right',
        fontWeight: 'bold',
        paddingRight: 5,
    },
    textoName: {
        width: '65%',
        color: '#FFF',
        fontSize: Platform.isTV ? 18 : 16,
        paddingLeft: 10,
    },
    imageContainer: {
        width: '10%',
        alignItems: 'center',
    },
    imagen: {
        width: '100%',
        height: '100%',
    }
});

export default ItemChannel;