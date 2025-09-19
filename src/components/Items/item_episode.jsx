import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import StarRating from '../StarRating';

const ItemEpisode = ({ navigation, episode, onSelectEpisode }) => {
    const link = episode.link;
    const imagen = episode.movie_image;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => {
                onSelectEpisode(episode);
                if (navigation) {
                    navigation.navigate('Reproductor', { link })
                }
            }}
        >
            {imagen ? (
                <Image source={{ uri: imagen }} style={styles.image} resizeMode='cover' />
            ) : <View style={styles.notImage} />}
            <View style={styles.details}>
                <Text style={styles.title}>{episode.title}</Text>
                <StarRating rating={episode.rating ? Number(episode.rating) : 0} size={16} />
                <Text style={styles.duration}>{episode.duration_secs ? `${Math.floor(episode.duration_secs / 60)}m` : '0m'}</Text>
                <Text style={styles.overview} numberOfLines={2} ellipsizeMode='tail' >{episode.plot ? episode.plot : 'Sinopsis no disponible'}</Text>
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
    notImage: {
        width: '20%',
        borderRadius: 2,
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
        paddingBottom: 1,
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
