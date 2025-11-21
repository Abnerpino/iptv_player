import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ItemNotification = ({ notificacion, seleccionar, expiracion, flag }) => {
    // Reemplaza '{fecha_expiracion}' por la fecha de expiración del paquete contratado y agrega saltos de linea cuando encuentra '{salto_linea}' en el mensaje
    const mensaje = notificacion.message.replace("{fecha_expiracion}", expiracion).replace(/{salto_linea}/g, "\n");

    // Formatea la fecha para mostrarla de acuerdo a la configuración regional (es-MX), omitiendo los segundos
    const fecha = notificacion.fecha.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Método para seleccionar notificaciones
    const handleSelectNotification = () => {
        // Si la notificación no ha sido vista...
        if (!notificacion.visto) {
            seleccionar(notificacion.id); // Manda el id de la notifiación
        }
    };

    return (
        <TouchableOpacity
            style={[styles.notificactionConteiner, {
                backgroundColor: notificacion.visto ? '#383838' : '#0A6522',
                marginHorizontal: notificacion.visto ? 10 : 0,
                marginBottom: flag ? 0 : 12.5
            }]}
            onPress={handleSelectNotification}
        >
            <Text style={[styles.textMessage, { fontSize: notificacion.visto ? 14 : 16 }]}>{mensaje}</Text>
            <View style={styles.dateContainer}>
                <Icon name='calendar-clock' size={12.5} color='#FFF' />
                <Text style={styles.textDate}>{fecha}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    notificactionConteiner: {
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    textMessage: {
        color: "#FFF",
        textAlign: 'justify',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 5,
    },
    textDate: {
        color: '#FFF',
        fontSize: 10,
        fontStyle: 'italic',
        marginLeft: 2.5
    }
});

export default ItemNotification;