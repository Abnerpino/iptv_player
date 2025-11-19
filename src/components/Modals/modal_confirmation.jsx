import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

const ModalConfirmation = ({ visible, onConfirm, onCancel, onRequestClose, numdId, itemName }) => {
    const mensaje = 
        numdId === 1 ? '¿Está seguro que desea salir de la aplicación?'
        : numdId === 2 ? `¿Está seguro que desea eliminar "${itemName}" del Historial de Reproducción?`
        : '¡Ocurrío un error mientras se cargaba la aplicación! Por favor, recargue la app o intente de nuevo más tarde. \n\nSi persiste el error, consulte a su Proveedor de Servicios.';

    return (
        <Modal transparent visible={visible} onRequestClose={onRequestClose || onCancel} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Icon name="warning" size={27} color="#333" />
                        <Text style={styles.title}>AVISO</Text>
                    </View>
                    <Text style={styles.textMessage}>{mensaje}</Text>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={onConfirm} style={[styles.button, { backgroundColor: 'green' }]}>
                            <Icon2 name={numdId === 3 ? "reload" : "check"} size={24} color="#FFF" />
                            <Text style={styles.textButton}>{`${numdId === 3 ? 'Recargar' : 'Aceptar'}`}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: 'red' }]}>
                            {numdId === 3 ? (
                                <Icon name="exit-outline" size={24} color="#FFF" />
                            ) : (
                                <Icon2 name="cancel" size={24} color="#FFF" />
                            )}
                            <Text style={styles.textButton}>{`${numdId === 3 ? 'Salir' : 'Cancelar'}`}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        width: "40%",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 5,
        padding: 5,
        marginVertical: 10,
        width: '30%',
    },
    textMessage: {
        color: '#000',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 10,
        marginHorizontal: 5,
    },
    textButton: {
        fontSize: 18,
        color: "#FFF",
        textAlign: 'center',
    },
});

export default ModalConfirmation;
