import React from 'react';
import { View, Text, Image, } from 'react-native';

const CardActor = ({ navigation, imagen, nombre }) => {
    return (
        <View style={{ position: 'relative', }}>
            <Image
                source={{ uri: imagen }} // URL de la imagen
                style={{
                    width: 100,
                    height: 150,
                    backgroundColor: '#201F29',
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 0.5
                }}
                resizeMode='cover'
            />
            <View style={{
                position: 'absolute', // Permite posicionar el texto sobre la imagen
                bottom: 0, // Alinea el texto en la parte inferior
                left: 0, // Alinea el texto a la izquierda
                right: 0, // Alinea el texto a la derecha
                backgroundColor: 'rgba(0, 0, 0, 0.15)', // Fondo semitransparente para mejorar la legibilidad
                padding: 5, // Espaciado interno
                borderBottomRightRadius: 5,
                borderBottomLeftRadius: 5,
            }}>
                <Text
                    style={{
                        color: 'white', // Color del texto
                        fontSize: 13, // Tamaño del texto
                        textAlign: 'center'
                    }}
                    numberOfLines={2}
                >{nombre}</Text>
            </View>
        </View>
    );
}

export default CardActor;