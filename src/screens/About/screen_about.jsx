import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const About = ({ navigation }) => {

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15, paddingVertical: 12.5, alignSelf: 'flex-start' }}>
                    <Icon name="arrow-circle-left" size={26} color="white" />
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>ACERCA DE</Text>
            </View>
            <View style={styles.body}>
                <Image
                    source={require('../../assets/imagotipo.png')}
                    style={{ height: '30%', width: '30%', resizeMode: 'contain' }}
                />
                <Text style={styles.version}>Versión: 1.0</Text>
                <Text style={styles.description}>IPTV Player es una aplicación móvil para ver canales en vivo, películas y series, todo a través de una conexión a Internet.</Text>
                <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
                    <View style={{ alignItems: 'flex-start', paddingRight: 25 }}>
                        <Text style={[styles.info, { fontWeight: 'bold' }]}>Desarrollador:</Text>
                        <Text style={[styles.info, { fontWeight: 'bold' }]}>Correo:</Text>
                        <Text style={[styles.info, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                    </View>
                    <View style={{ alignItems: 'flex-start', paddingLeft: 25 }}>
                        <Text style={styles.info}>Ing. Abner Pino Federico</Text>
                        <Text style={styles.info}>abnerpino15@gmail.com</Text>
                        <Text style={styles.info}>2025</Text>
                    </View>
                </View>

            </View>
        </View>
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
    version: {
        color: '#FFF',
        fontSize: 12,
        paddingTop: 10,
        paddingBottom: 15
    },
    description: {
        color: '#FFF',
        fontSize: 16,
        paddingTop: 10,
        paddingHorizontal: 50,
        textAlign: 'center',
        fontWeight: '500'
    },
    info: {
        color: '#FFF',
        fontSize: 16,
        paddingTop: 10

    },
});

export default About;