import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Entypo';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import RippleButton from '../RippleButton/ripple_button';
import TrackOption from '../TrackOption';

const PanelSettings = ({ onClose, videoTracks, audioTracks, textTracks, selectedVideoTrack, selectedAudioTrack, selectedTextTrack, onSelectVideoTrack, onSelectAudioTrack, onSelectTextTrack, initialLoad }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <RippleButton
                    iconLib={Icon}
                    name="arrow-circle-left"
                    onPress={onClose}
                    hasTVPreferredFocus={Platform.isTV}
                />
                <Text style={styles.headerTitle}>Ajustes</Text>
            </View>
            <ScrollView style={styles.scrollView}>
                {/* Pistas de Video */}
                <View style={styles.containerTitle}>
                    <Icon2 name="video" size={26} color="#FFF" />
                    <Text style={styles.sectionTitle}>PISTAS DE VIDEO</Text>
                </View>
                {!initialLoad && videoTracks && videoTracks.length > 0 ? (
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
                    <Icon3 name="audiotrack" size={26} color="#FFF" />
                    <Text style={styles.sectionTitle}>PISTAS DE AUDIO</Text>
                </View>
                {!initialLoad && audioTracks && audioTracks.length > 0 ? (
                    <>
                        <TrackOption
                            isSelected={selectedAudioTrack?.value === -1}
                            onSelect={() => onSelectAudioTrack({ type: 'index', value: -1 })}
                        />
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
                    <Icon3 name="closed-caption" size={26} color="#FFF" />
                    <Text style={styles.sectionTitle}>PISTAS DE SUBTÍTULOS</Text>
                </View>
                {!initialLoad && textTracks && textTracks.length > 0 ? (
                    <>
                        <TrackOption
                            isSelected={!selectedTextTrack}
                            onSelect={() => onSelectAudioTrack({ type: 'index', value: -1 })}
                        />
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
        paddingLeft: 7.5,
        borderBottomWidth: 1,
        borderColor: '#444',
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