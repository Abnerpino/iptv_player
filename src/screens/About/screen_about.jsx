import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, Text, Image, StyleSheet, TouchableNativeFeedback, ImageBackground, ToastAndroid, Pressable, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking } from 'react-native';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
import RippleButton from '../../components/RippleButton/ripple_button';
import ModalLogger from '../../components/Modals/modal_logger';

const About = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false); // Estado para manejar el modal de la bitácora

    const version = DeviceInfo.getVersion();
    const email = 'abnerpino15@gmail.com';
    const focusRipple = Platform.isTV ? TouchableNativeFeedback.Ripple('#FFD700', false) : TouchableNativeFeedback.Ripple('#00000040', false);

    // Se ejecuta cada vez que la pantalla About está enfocada
    useFocusEffect(
        useCallback(() => {
            const crashlytics = getCrashlytics(); // Obtiene la instancia de Crashlytics
            log(crashlytics, 'About'); // Establece el mensaje
        }, [])
    );

    const handlePress = () => {
        // Abre la app de correo con el destinatario prellenado
        Linking.openURL(`mailto:${email}`);
    };

    const handleLongPress = () => {
        Clipboard.setString(email); // Copia el email al portapapeles
        ToastAndroid.show('¡Correo copiado al portapapeles!', ToastAndroid.SHORT);
    };

    return (
        <ImageBackground
            source={require('../../assets/fondo3.jpg')}
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
            }}
            resizeMode='cover'
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(16,16,16,0)', }}>
                <View style={styles.header}>
                    <RippleButton
                        mainStyle={{ paddingHorizontal: 15, paddingVertical: 12.5 }}
                        iconLib={Icon}
                        name="arrow-circle-left"
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.sectionTitle}>ACERCA DE</Text>
                </View>
                <ScrollView style={styles.body}>
                    <View style={styles.topContainer}>
                        <Image
                            source={require('../../assets/icono.jpg')}
                            style={{ height: '100%', width: '100%', resizeMode: 'contain', alignSelf: 'center' }}
                        />
                        <View style={styles.versionContainer}>
                            <Icon2 name="versions" size={Platform.isTV ? 22 : 16} color="white" />
                            <Text style={styles.version}>Versión: {version}</Text>
                        </View>
                    </View>
                    <View style={styles.middleContainer}>
                        <Text style={styles.description}>IPTV Player es una aplicación para ver canales en vivo, películas y series, todo a través de una conexión a Internet.</Text>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', }}>
                            <View style={{ alignItems: '', paddingRight: 25, }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    <Icon3 name="engineering" size={24} color="white" />
                                    <Text style={[styles.info, { fontWeight: 'bold', marginLeft: 5, }]}>Desarrollador:</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, }}>
                                    <Icon3 name="email" size={24} color="white" />
                                    <Text style={[styles.info, { fontWeight: 'bold', marginLeft: 5, }]}>Correo:</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, }}>
                                    <Icon3 name="rocket-launch" size={24} color="white" />
                                    <Text style={[styles.info, { fontWeight: 'bold', marginLeft: 5, }]}>Lanzamiento:</Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-start', paddingLeft: 25, }}>
                                <Text style={styles.info}>Ing. Abner Pino Federico</Text>
                                {Platform.isTV ? (
                                    <View>
                                        <Text style={styles.email}>{email}</Text>
                                    </View>
                                ) : (
                                    <Pressable onPress={handlePress} onLongPress={handleLongPress}>
                                        <Text style={styles.email}>{email}</Text>
                                    </Pressable>
                                )}
                                <Text style={[styles.info, { marginTop: 10 }]}>2026</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <Image
                            source={require('../../assets/logo_dev.png')}
                            resizeMode='contain'
                            style={styles.imageDev}
                        />
                        <View style={styles.wrapper}>
                            <TouchableNativeFeedback
                                onPress={() => setModalVisible(true)}
                                background={focusRipple}
                                useForeground={!Platform.isTV}
                            >
                                <View style={styles.borderSimulator}>
                                    <View style={styles.buttonContainer}>
                                        <Icon2 name="log" size={Platform.isTV ? 20 : 18} color="white" />
                                        <Text style={styles.textButton}>Bitácora de Errores</Text>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                    </View>
                </ScrollView>

                <ModalLogger
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    body: {
        paddingVertical: 10,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    versionContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: 'rgba(80,80,100,0.5)',
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5
    },
    version: {
        color: '#FFF',
        fontSize: Platform.isTV ? 16 : 12,
        marginLeft: 5
    },
    topContainer: {
        height: '40%',
        justifyContent: 'center',
        paddingTop: 30,
        paddingBottom: 10
    },
    middleContainer: {
        height: Platform.isTV ? '85%' : '70%',
        justifyContent: 'center'
    },
    description: {
        color: '#FFF',
        fontSize: Platform.isTV ? 20 : 16,
        marginHorizontal: '5%',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    info: {
        color: '#FFF',
        fontSize: Platform.isTV ? 20 : 16,
        paddingVertical: 2,
    },
    email: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        color: 'blue',
        textDecorationLine: 'underline',
        fontSize: Platform.isTV ? 20 : 16,
        marginTop: 10,
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingBottom: 5,
    },
    bottomContainer: {
        height: '15%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
    },
    imageDev: {
        width: '20%',
        height: '100%',
    },
    wrapper: {
        borderRadius: 10,
        overflow: 'hidden'
    },
    borderSimulator: {
        flex: 1,
        padding: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderColor: '#FFF',
        borderWidth: 1,
        borderRadius: 7,
        paddingHorizontal: 7.5,
        paddingVertical: Platform.isTV ? 8 : 5,
        backgroundColor: 'gray'
    },
    textButton: {
        fontSize: Platform.isTV ? 16 : 14,
        fontWeight: '500',
        color: '#FFF',
        marginLeft: 5,
        textAlignVertical: 'center',
    }
});

export default About;