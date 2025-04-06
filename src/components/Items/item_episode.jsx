import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from '../StarRating';
import { ScreenWidth } from '@rneui/base';

const ItemEpisode = ({ navigation, season, episode }) => {
    const link = episode.link;

    return (
        <TouchableOpacity onPress={() => navigation.navigate('Reproductor', { link })} style={styles.container}>
            <Image
                source={{ uri: episode.poster }}
                style={styles.image}
                resizeMode='cover'
            />
            <View style={styles.details}>
                <Text style={styles.title}>{`Temporada ${season} - Episodio ${episode.capitulo}: ${episode.name}`}</Text>
                <StarRating rating={episode.vote_average ? episode.vote_average : 0} size={16} />
                <Text style={styles.duration}>
                    {episode.runtime ? `${episode.runtime % 60}m` : 'Duración no disponible'}
                </Text>
                <Text
                    style={styles.overview}
                    numberOfLines={2}
                    ellipsizeMode='tail'
                >
                    {episode.overview ? episode.overview : 'Trama no disponible'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '100%',
        borderRadius: 5,
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        alignItems: 'stretch'
    },
    image: {
        width: '20%',
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 0.1
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
        fontSize: 13,
        backgroundColor: 'rgba(80,80,100,0.5)',
        paddingHorizontal: 10,
        borderRadius: 5,
        alignSelf: 'flex-start'
    },
    overview: {
        color: '#ddd',
        fontSize: 14,
        textAlign: 'justify',
        paddingTop: 5
    }
});

export default ItemEpisode;
