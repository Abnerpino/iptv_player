import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalNotifications = ({ openModal, handleCloseModal, notificaciones }) => {
    return (
        <Modal transparent visible={openModal} onRequestClose={handleCloseModal} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="list-alt" size={27} color="#333" />
                            <Text style={styles.textHeader}>NOTIFICACIONES</Text>
                        </View>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="window-close" size={27} color="red" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 14, paddingVertical: 12.5, maxHeight: '88%', }}>
                        {!notificaciones || notificaciones.length === 0 ? (
                            <Text style={{ color: '#000', fontSize: 16, fontStyle: 'italic', textAlign: 'center' }}>
                                Sin notificaciones
                            </Text>
                        ) : (
                            <FlatList
                                data={notificaciones}
                                numColumns={1}
                                renderItem={({ item }) => (
                                    <View style={[styles.notificactionConteiner, { marginBottom: notificaciones.length === item.id ? 0 : 12.5 }]}>
                                        <Text style={styles.text}>{item.mensaje}</Text>
                                    </View>
                                )}
                                keyExtractor={item => item.id}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

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
        width: "70%",
        maxHeight: '80%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        paddingVertical: 5,
        paddingHorizontal: 20,
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
    notificactionConteiner: {
        backgroundColor: '#0A6522',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    text: {
        fontSize: 16,
        color: "#FFF",
        textAlign: 'justify',
    },
});

export default ModalNotifications;