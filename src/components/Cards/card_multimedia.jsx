import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useXtream } from '../../services/hooks/useXtream';

const CardMultimedia = ({ navigation, tipo, fondo, onStartLoading, onFinishLoading }) => {
    const { getStreamingByType } = useXtream();
    const [buttonColor, setButtonColor] = useState('rgba(0,0, 0, 0.5)'); //Estado para manejar el color del botón de actualizar contenido   

    const imagen = tipo === 'live' ? require('../../assets/tv.png') : (tipo === 'vod' ? require('../../assets/cine.png') : require('../../assets/series.png'));

    const handlePressIn = () => {
        setButtonColor('rgba(255,255,255,1)'); // Cambia el color al presionar
    };

    const handlePressOut = () => {
        setButtonColor('rgba(0,0,0,0.5)'); // Regresa al color original al soltar
    };

    const handleNavigateToScreen = () => {
        navigation.navigate('Seccion', { tipo });
    };

    const handleUpdateStreaming = async () => {
        onStartLoading?.();
        await getStreamingByType(tipo);
        onFinishLoading?.();
    }

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: fondo }]} onPress={handleNavigateToScreen}>
            <View style={styles.imageContainer1}>
                <Image
                    source={imagen}
                    resizeMode="contain"
                    style={{
                        width: tipo === 'live' ? '80%' : '60%',
                        height: tipo === 'live' ? '80%' : '60%',
                        alignSelf: 'center',
                    }}>
                </Image>
            </View>
            <TouchableOpacity
                style={[styles.updateContainer, { backgroundColor: buttonColor }]}
                onPress={handleUpdateStreaming}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Text style={[styles.updateText, { verticalAlign: 'middle' }]}>Última actualización: 14 mins ago</Text>
                <View style={styles.imageContainer2}>
                    <Image
                        source={require('../../assets/update.png')}
                        resizeMode="contain"
                        style={styles.updateImage} />
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer1: {
        flex: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    updateContainer: {
        flexDirection: 'row',
        flex: 0.2,
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    updateText: {
        color: '#fff',
        fontSize: 12,
        paddingVertical: 10,
        height: '100%',
        width: '70%',
        textAlign: 'left',
    },
    imageContainer2: {
        height: '100%',
        width: '16%',
        justifyContent: 'center'
    },
    updateImage: {
        width: '100%',
        height: '100%',
        alignSelf: 'flex_start',
    }
});

export default CardMultimedia;