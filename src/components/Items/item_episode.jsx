import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import StarRating from '../StarRating';

const ItemEpisode = ({ episode }) => {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: episode.poster }}
                style={styles.image}
                resizeMode='cover'
            />
            <View style={styles.details}>
                <Text style={styles.title}>{episode.capitulo}</Text>
                <StarRating rating={episode.vote_average ? episode.vote_average : 0} />
                <Text style={styles.duration}>
                    {episode.runtime ? `${Math.floor(episode.runtime / 60)}h ${episode.runtime % 60}m` : 'Duración no disponible'}
                </Text>
                <Text
                    style={styles.overview}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                >
                    {episode.link ? episode.link : 'Trama no disponible'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#222',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },
    image: {
        width: 100,
        height: 80,
        borderRadius: 6
    },
    details: {
        flex: 1,
        paddingLeft: 12,
        justifyContent: 'space-around'
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    duration: {
        color: '#ccc',
        fontSize: 13
    },
    overview: {
        color: '#ddd',
        fontSize: 14
    }
});

export default ItemEpisode;
