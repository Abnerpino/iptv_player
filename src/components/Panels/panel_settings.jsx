import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Icon3 from 'react-native-vector-icons/Entypo';
import Icon4 from 'react-native-vector-icons/MaterialIcons';

const getTrackLabel = (track, trackType) => {
    if (!track) return 'Desconocido';

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
        parts.push(track.width && track.height ? `${track.width} x ${track.height}` : 'N/A'); // Resolución
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

const PanelSettings = ({ onClose, videoTracks, audioTracks, textTracks, selectedVideoTrack, selectedAudioTrack, selectedTextTrack, onSelectVideoTrack, onSelectAudioTrack, onSelectTextTrack, }) => {
    const TrackOption = ({ track, isSelected, onSelect, trackType }) => (
        <TouchableOpacity style={styles.optionRow} onPress={onSelect}>
            <Icon name={isSelected ? 'radiobox-marked' : 'radiobox-blank'} size={22} color="#fff" />
            <Text style={styles.optionText}>{getTrackLabel(track, trackType)}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <Icon2 name="arrow-circle-left" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajustes</Text>
            </View>
            <ScrollView style={styles.scrollView}>
                {/* Pistas de Video */}
                <View style={styles.containerTitle}>
                    <Icon3 name="video" size={26} color="#FFF" />
                    <Text style={styles.sectionTitle}>PISTAS DE VIDEO</Text>
                </View>
                {videoTracks && videoTracks.length > 0 ? (
                    <>
                        {videoTracks.map((track) => (
                            <TrackOption
                                key={`video-${track.index}`}
                                track={track}
                                isSelected={selectedVideoTrack?.value === track.index}
                                onSelect={() => onSelectVideoTrack({ type: 'index', value: track.index })}
                                trackType="video"
                            />
                        ))}
                    </>
                ) : (
                    <Text style={[styles.optionText, { fontStyle: 'italic' }]}>No se encontró ninguna pista de video</Text>
                )}


                {/* Pistas de Audio */}
                <View style={styles.containerTitle}>
                    <Icon4 name="audiotrack" size={26} color="#FFF" />
                    <Text style={styles.sectionTitle}>PISTAS DE AUDIO</Text>
                </View>
                {audioTracks && audioTracks.length > 0 ? (
                    <>
                        <TouchableOpacity style={styles.optionRow} onPress={() => onSelectAudioTrack({ type: 'index', value: -1 })}>
                            <Icon name={selectedAudioTrack?.value === -1 ? 'radiobox-marked' : 'radiobox-blank'} size={22} color="#fff" />
                            <Text style={styles.optionText}>Desactivar</Text>
                        </TouchableOpacity>
                        {audioTracks.map((track) => (
                            <TrackOption
                                key={`audio-${track.index}`}
                                track={track}
                                isSelected={selectedAudioTrack?.value === track.index}
                                onSelect={() => onSelectAudioTrack({ type: 'index', value: track.index })}
                                trackType="audio"
                            />
                        ))}
                    </>
                ) : (
                    <Text style={[styles.optionText, { fontStyle: 'italic' }]}>No se encontraron pistas de audio para este video</Text>
                )}


                {/* Pistas de Subtítulos */}
                <View style={styles.containerTitle}>
                    <Icon4 name="closed-caption" size={26} color="#FFF" />
                    <Text style={styles.sectionTitle}>PISTAS DE SUBTÍTULOS</Text>
                </View>
                {textTracks && textTracks.length > 0 ? (
                    <>
                        <TouchableOpacity style={styles.optionRow} onPress={() => onSelectTextTrack(undefined)}>
                            <Icon name={!selectedTextTrack ? 'radiobox-marked' : 'radiobox-blank'} size={22} color="#fff" />
                            <Text style={styles.optionText}>Desactivar</Text>
                        </TouchableOpacity>
                        {textTracks.map((track) => (
                            <TrackOption
                                key={`text-${track.index}`}
                                track={track}
                                isSelected={selectedTextTrack?.value === track.index}
                                onSelect={() => onSelectTextTrack({ type: 'index', value: track.index })}
                                trackType="subtitle"
                            />
                        ))}
                    </>
                ) : (
                    <Text style={[styles.optionText, { fontStyle: 'italic' }]}>No se encontraron subtítulos para este video</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '37.5%',
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#444'
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    scrollView: {
        flex: 1,
    },
    containerTitle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: 10,
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
    subtitleSettingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 5,
    },
    fontSizeControl: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default PanelSettings;