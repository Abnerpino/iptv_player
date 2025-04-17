import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

const ModalExit = ({ visible, onConfirm, onCancel }) => {
    return (
        <Modal transparent visible={visible} onRequestClose={onCancel} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Icon name="exit" size={27} color="#333" />
                        <Text style={styles.title}>SALIR</Text>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={onConfirm} style={[styles.button, { backgroundColor: 'green' }]}>
                            <Icon2 name="check" size={24} color="#FFF" />
                            <Text style={styles.text}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onCancel} style={[styles.button, { backgroundColor: 'red' }]}>
                            <Icon2 name="cancel" size={24} color="#FFF" />
                            <Text style={styles.text}>Cancelar</Text>
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
        borderRadius: 5,
        padding: 5,
        marginVertical: 10,
        width: '30%',
    },
    text: {
        fontSize: 18,
        color: "#FFF",
        textAlign: 'center',
    },
});

export default ModalExit;
