import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, ToastAndroid, Pressable } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking } from 'react-native';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
import ModalLogger from '../../components/Modals/modal_logger';

const About = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false); // Estado para manejar el modal de la bitácora

    const version = DeviceInfo.getVersion();
    const email = 'abnerpino15@gmail.com';

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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15, paddingVertical: 12.5, alignSelf: 'flex-start' }}>
                        <Icon name="arrow-circle-left" size={26} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.sectionTitle}>ACERCA DE</Text>
                </View>
                <ScrollView style={styles.body}>
                    <Image
                        source={require('../../assets/icono.jpg')}
                        style={{ height: '30%', width: '30%', resizeMode: 'contain', alignSelf: 'center' }}
                    />
                    <View style={styles.versionContainer}>
                        <Icon2 name="versions" size={16} color="white" />
                        <Text style={styles.version}>Versión: {version}</Text>
                    </View>
                    <Text style={styles.description}>IPTV Player es una aplicación móvil para ver canales en vivo, películas y series, todo a través de una conexión a Internet.</Text>
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
                            <Pressable onPress={handlePress} onLongPress={handleLongPress}>
                                <Text style={styles.email}>{email}</Text>
                            </Pressable>
                            <Text style={[styles.info, { marginTop: 10 }]}>2026</Text>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <Image
                            source={require('../../assets/logo_dev.png')}
                            resizeMode='contain'
                            style={styles.imageDev}
                        />
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            onPress={() => setModalVisible(true)}
                        >
                            <Icon2 name="log" size={18} color="white" />
                            <Text style={styles.textButton}>Bitácora de Errores</Text>
                        </TouchableOpacity>
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
        fontSize: 12,
        marginLeft: 5
    },
    description: {
        color: '#FFF',
        fontSize: 16,
        marginHorizontal: '5%',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    info: {
        color: '#FFF',
        fontSize: 16,
        paddingVertical: 2,
    },
    email: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        color: 'blue',
        textDecorationLine: 'underline',
        fontSize: 16,
        marginTop: 10,
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingBottom: 5,
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '5%',
        marginTop: 20,
    },
    imageDev: {
        width: '20%',
        height: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        borderColor: '#FFF',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: 'gray'
    },
    textButton: {
        fontWeight: '500',
        color: '#FFF',
        marginLeft: 5,
        textAlignVertical: 'center',
    }
});

export default About;