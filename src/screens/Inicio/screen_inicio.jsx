import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground } from 'react-native';

const Inicio = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Valor inicial de opacidad (0 = transparente)

    useEffect(() => {
        // Inicia animación de fade-in
        Animated.timing(fadeAnim, {
            toValue: 1, // opacidad 100%
            duration: 500, // medio segundo
            useNativeDriver: true,
        }).start();

        // Cambia de pantalla después de 1.5 segundos
        const timeout = setTimeout(() => {
            navigation.replace('Menu');
        }, 1500);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ImageBackground
                source={require('../../assets/inicio.jpg')}
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                }}
                resizeMode='cover'
            />
        </Animated.View>
    );
};

export default Inicio;
