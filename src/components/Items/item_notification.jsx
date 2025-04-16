import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ItemNotification = ({ notificacion, seleccionar, longitud }) => {
    const handleSelectNotification = () => {
        seleccionar(notificacion.id);
    };

    return (
        <TouchableOpacity
            style={[notificacion.visto ? styles.notificactionConteinerViewed : styles.notificactionConteiner, { marginBottom: longitud === notificacion.id ? 0 : 12.5 }]}
            onPress={handleSelectNotification}
        >
            <Text style={[styles.text, { fontSize: notificacion.visto ? 14 : 16 }]}>{notificacion.mensaje}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    notificactionConteiner: {
        backgroundColor: '#0A6522',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    notificactionConteinerViewed: {
        backgroundColor: '#383838',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginHorizontal: 10,
    },
    text: {
        color: "#FFF",
        textAlign: 'justify',
    },
});

export default ItemNotification;