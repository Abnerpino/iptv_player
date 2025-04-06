import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const StarRating = ({ rating, size }) => {
    const maxStars = 5;
    const scaledRating = (rating / 10) * maxStars; // Convierte de 10 a 5 estrellas

    return (
        <View style={{ flexDirection: 'row' }}>
            {[...Array(maxStars)].map((_, index) => {
                let starType = 'star-o'; // Estrella vacía por defecto
                let starValue = scaledRating - index; // Parte fraccionaria de la estrella actual
                
                if (starValue >= 1) {
                    starType = 'star'; // Estrella llena
                } else if (starValue > 0.75) {
                    starType = 'star'; // Si el decimal es mayor a 0.75, se redondea a estrella llena
                } else if (starValue >= 0.25 && starValue <= 0.75) {
                    starType = 'star-half-full'; // Si el decimal está entre 0.25 y 0.75, se usa media estrella
                }
                // Si el decimal está entre 0.01 y 0.25, la estrella queda vacía (default)

                return (
                    <Icon
                        key={index}
                        name={starType}
                        size={size}
                        color={starType === 'star' || starType === 'star-half-full' ? 'gold' : 'gray'}
                        style={{ marginHorizontal: 2, marginVertical: 7.5, }}
                    />
                );
            })}
        </View>
    );
};

export default StarRating;
