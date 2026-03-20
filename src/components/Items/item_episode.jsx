import React from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback, Platform } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome6';
import ProgressBar from '../ProgressBar/progress_bar';
import StarRating from '../StarRating';

const ItemEpisode = ({ episode, onSelectEpisode, upTag }) => {
    const duracion = episode.duration_secs !== "" ? Number(episode.duration_secs) : 0;
    const reproducido = parseFloat(episode.playback_time);
    const imagen = episode.movie_image;
    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#FFFFFF40', false);;

    const convertDuration = (duration_secs) => {
        let texto = '0m';

        if (!duration_secs) return texto;

        const seconds = Number(duration_secs);
        const minutes = Math.floor(seconds / 60);

        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            texto = `${hours}h ${minutes % 60}m`;
        } else {
            texto = `${minutes}m`;
        }

        return texto;
    }

    return (
        <View style={styles.container}>
            <TouchableNativeFeedback
                onPress={() => onSelectEpisode(episode)}
                background={focusRipple}
                useForeground={false}
                nextFocusUp={upTag}
            >
                <View style={styles.borderSimulator}>
                    <View style={styles.innerContainer}>
                        <View style={{ flex: 0.25, }}>
                            {imagen ? (
                                <FastImage
                                    style={[styles.image, { opacity: episode.visto ? 0.5 : 1 }]}
                                    source={{
                                        uri: imagen,
                                        priority: FastImage.priority.normal
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                />
                            ) : <View style={styles.notImage} />}
                            {reproducido > 0 && (
                                <ProgressBar isVod={false} duration={duracion} playback={reproducido} />
                            )}
                            <FastImage source={require('../../assets/icono_play.png')} style={styles.iconPlay} resizeMode={FastImage.resizeMode.contain} />
                        </View>
                        <View style={styles.details}>
                            {episode.visto && (
                                <Icon name="eye" size={20} color="white" style={styles.eyeIcon} />
                            )}
                            <Text style={styles.title}>{episode.title}</Text>
                            <StarRating rating={episode.rating ? Number(episode.rating) : 0} size={16} />
                            <Text style={styles.duration}>{convertDuration(episode.duration_secs)}</Text>
                            <Text style={styles.overview} numberOfLines={2} ellipsizeMode='tail' >{episode.plot ? episode.plot : 'Sinopsis no disponible'}</Text>
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
    },
    borderSimulator: {
        flex: 1,
        padding: 2,
    },
    innerContainer: {
        flexDirection: 'row',
        borderColor: '#888',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        alignItems: 'stretch',
    },
    image: {
        width: '100%',
        height: Platform.isTV ? 160 :  '100%',
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 0.1,
    },
    notImage: {
        width: '100%',
        height: Platform.isTV ? 160 :  '100%',
        borderRadius: 2,
        borderColor: '#fff',
        borderWidth: 0.1,
    },
    iconPlay: {
        width: '35%',
        height: '35%',
        position: 'absolute',
        top: '30%',
        left: '30%',
        zIndex: 10,
    },
    details: {
        flex: 0.75,
        paddingLeft: 12,
        justifyContent: 'space-around',
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 10,
        padding: 2
    },
    title: {
        color: '#fff',
        fontSize: Platform.isTV ? 18 : 16,
        fontWeight: 'bold'
    },
    duration: {
        color: '#ccc',
        fontSize: Platform.isTV ? 15 : 13,
        backgroundColor: 'rgba(80,80,100,0.5)',
        paddingHorizontal: 10,
        paddingBottom: 1,
        borderRadius: 5,
        alignSelf: 'flex-start'
    },
    overview: {
        height: 40,
        color: '#ddd',
        fontSize: Platform.isTV ? 16 : 14,
        textAlign: 'justify',
        textAlignVertical: 'center',
    }
});

export default ItemEpisode;
