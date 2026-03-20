import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback, findNodeHandle, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';

const CardActor = ({ index, imagen, nombre, upTag, getFirstCard }) => {
    const cardRef = useRef(null);
    const [focusLeftTag, setFocusLeftTag] = useState(null);

    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // useEffect para vincular el Card para navegación explicita
    useEffect(() => {
        // Si no es TV, no hace nada
        if (!Platform.isTV) return;

        // Timeout para asegurar que el Card esté montado
        const timer = setTimeout(() => {
            if (index === 0 && cardRef.current) {
                const tag = findNodeHandle(cardRef.current);
                setFocusLeftTag(tag);
                getFirstCard('card', tag);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <TouchableNativeFeedback
                ref={cardRef}
                background={focusRipple}
                useForeground={!Platform.isTV}
                nextFocusUp={upTag}
                nextFocusLeft={focusLeftTag}
            >
                <View style={styles.borderSimulator}>
                    <View style={[styles.innerContent]}>
                        <FastImage
                            source={{
                                uri: imagen,
                                priority: FastImage.priority.normal
                            }}
                            style={styles.imagen}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                        <View style={styles.textContainer}>
                            <Text
                                style={styles.texto}
                                numberOfLines={2}
                            >{nombre}</Text>
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
    },
    borderSimulator: {
        flex: 1,
        padding: Platform.isTV ? 3 : 1,
    },
    innerContent: {
        width: 100,
        height: 150,
    },
    imagen: {
        width: '100%',
        height: '100%',
        backgroundColor: '#201F29',
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 0.5,
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        padding: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
    },
    texto: {
        color: 'white',
        fontSize: 13,
        textAlign: 'center'
    },
});

export default CardActor;