import { View, Text, StyleSheet, TouchableNativeFeedback, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TrackOption = ({ track, isSelected, onSelect, trackType }) => {
    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#FFFFFF80', false);

    const getTrackLabel = (track, trackType) => {
        if (!track) {
            const response = trackType ? 'Desconocido' : 'Desactivar';
            return response;
        }

        const parts = [track.index];

        if (trackType === 'video') {
            parts.push('VIDEO');

            // Codec
            if (track.codecs && track.codecs.startsWith('avc')) {
                parts.push('h264');
            } else if (track.codecs && track.codecs.startsWith('hvc')) {
                parts.push('hevc');
            } else {
                parts.push(track.codecs || 'N/A');
            }

            parts.push(track.bitrate ? `${Math.round(track.bitrate / 1000)} kb/s` : 'N/A'); // Bitrate
            parts.push(track.width && track.width > 0 && track.height && track.height > 0 ? `${track.width} x ${track.height}` : 'N/A'); // Resolución
        }

        if (trackType === 'audio') {
            parts.push('AUDIO');
            parts.push(track.type && track.type.includes('/') ? track.type.split('/')[1] : 'N/A'); // Codec (extraído de 'type')
            parts.push(track.title || 'N/A'); // Titulo de la pista
            parts.push(track.language || 'N/A'); // Idioma
        }

        if (trackType === 'subtitle') {
            parts.push('SUBTÍTULO');
            parts.push(track.title || 'N/A'); // Titulo de la pista
            parts.push(track.language || 'N/A'); // Idioma
        }

        return parts.join(', ');
    };

    return (
        <View style={styles.wrapper}>
            <TouchableNativeFeedback
                onPress={onSelect}
                background={focusRipple}
                useForeground={false}
            >
                <View style={styles.optionRow}>
                    <Icon name={isSelected ? 'radiobox-marked' : 'radiobox-blank'} size={22} color="#fff" />
                    <Text style={styles.optionText}>{getTrackLabel(track, trackType)}</Text>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 10,
        overflow: 'hidden'
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7.5,
        paddingHorizontal: 5,
    },
    optionText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 5,
    },
});

export default TrackOption;