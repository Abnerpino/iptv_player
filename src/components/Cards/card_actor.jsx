import React from 'react';
import { View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';

const CardActor = ({ imagen, nombre }) => {
    return (
        <View style={{ position: 'relative', }}>
            <FastImage
                source={{
                    uri: imagen,
                    priority: FastImage.priority.normal
                }}
                style={{
                    width: 100,
                    height: 150,
                    backgroundColor: '#201F29',
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 0.5
                }}
                resizeMode={FastImage.resizeMode.cover}
            />
            <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                padding: 5,
                borderBottomRightRadius: 5,
                borderBottomLeftRadius: 5,
            }}>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 13,
                        textAlign: 'center'
                    }}
                    numberOfLines={2}
                >{nombre}</Text>
            </View>
        </View>
    );
}

export default CardActor;