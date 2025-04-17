import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, ToastAndroid, Pressable } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/Octicons';
import Icon3 from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking } from 'react-native';

const About = ({ navigation }) => {
    const version = DeviceInfo.getVersion();
    const email = 'abnerpino15@gmail.com';

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
                <View style={styles.body}>
                    <Image
                        source={require('../../assets/icono.jpg')}
                        style={{ height: '30%', width: '30%', resizeMode: 'contain' }}
                    />
                    <View style={styles.versionConteiner}>
                        <Icon2 name="versions" size={16} color="white" />
                        <Text style={styles.version}>Versión: {version}</Text>
                    </View>
                    <Text style={styles.description}>IPTV Player es una aplicación móvil para ver canales en vivo, películas y series, todo a través de una conexión a Internet.</Text>
                    <View style={{ flexDirection: 'row', paddingVertical: 20, }}>
                        <View style={{ alignItems: 'flex-start', paddingRight: 25, marginTop: 5, }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Icon3 name="engineering" size={24} color="white" />
                                <Text style={[styles.info, { fontWeight: 'bold', marginLeft: 5, }]}>Desarrollador:</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, }}>
                                <Icon3 name="email" size={24} color="white" />
                                <Text style={[styles.info, { fontWeight: 'bold', marginLeft: 5, }]}>Correo:</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, }}>
                                <Icon3 name="rocket-launch" size={24} color="white" />
                                <Text style={[styles.info, { fontWeight: 'bold', marginLeft: 5, }]}>Lanzamiento:</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-start', paddingLeft: 25, marginTop: 5, }}>
                            <Text style={[styles.info, { marginTop: 0 }]}>Ing. Abner Pino Federico</Text>
                            <Pressable onPress={handlePress} onLongPress={handleLongPress}>
                                <Text style={styles.email}>{email}</Text>
                            </Pressable>
                            <Text style={[styles.info, { marginTop: 15 }]}>2025</Text>
                        </View>
                    </View>

                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    body: {
        alignItems: 'center'
    },
    sectionTitle: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
    },
    versionConteiner: {
        flexDirection: 'row',
        backgroundColor: 'rgba(80,80,100,0.5)',
        marginTop: 10,
        marginBottom: 15,
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
        paddingTop: 10,
        paddingHorizontal: 50,
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'italic'
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
        marginTop: 15,
        borderRadius: 5,
        paddingHorizontal: 5,
        paddingBottom: 5,
    },
});

export default About;