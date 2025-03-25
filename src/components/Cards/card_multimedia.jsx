import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const CardMultimedia = ({ navigation, tipo, fondo, data }) => {
    //Estado para manejar el color del botón de actualizar contenido
    const [buttonColor, setButtonColor] = useState('rgba(0,0,0,0.5)');
    const categorias = data[0];
    //console.log(data[1]);
    const contenido = data[1];

    const imagen =
        tipo === 'TV'
            ? require('../../assets/tv.png')
            : tipo === 'Cine'
                ? require('../../assets/cine.png')
                : require('../../assets/series.png')
    ;

    const handlePressIn = () => {
        setButtonColor('rgb(0,0,0)'); // Cambia el color al presionar
    };

    const handlePressOut = () => {
        setButtonColor('rgba(0,0,0,0.5)'); // Regresa al color original al soltar
    };

    const handleNavigateToScreen = () => {
        navigation.navigate('Seccion', { tipo, categorias, contenido });
    };

    return (
        <TouchableOpacity style={{
            flex: 1,
            marginHorizontal: 5,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: fondo
        }} onPress={handleNavigateToScreen}>
            <View style={{ flex: 0.8, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Image
                    source={imagen}
                    resizeMode="contain"
                    style={{
                        width: '60%', // Resto del ancho
                        height: '60%', // Resto del alto
                        alignSelf: 'center',
                    }}>
                </Image>
            </View>
            <TouchableOpacity style={{ flex: 0.2, justifyContent: 'center', width: '100%', backgroundColor: buttonColor }} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <View style={{ flexDirection: 'row', width: '100%', height: '100%', marginHorizontal: 20 }}>
                    <Text style={{
                        color: '#fff',
                        fontSize: 12,
                        borderTopLeftRadius: 10,
                        borderBottomLeftRadius: 10,
                        paddingVertical: 10,
                        height: '100%',
                        width: '70%',
                        textAlign: 'left',
                        verticalAlign: 'middle'
                    }}>Última actualización: 14 mins ago</Text>
                    <View style={{ height: '100%', width: '16%', justifyContent: 'center' }}>
                        <Image
                            source={require('../../assets/update.png')}
                            resizeMode="contain"
                            style={{
                                width: '100%',
                                height: '100%',
                                alignSelf: 'flex_start',
                            }} />
                    </View>
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

export default CardMultimedia;