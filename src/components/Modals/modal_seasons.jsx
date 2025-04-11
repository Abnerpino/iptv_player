import { Modal, Text, TouchableOpacity, View, StyleSheet, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

const ModalSeasons = ({ openModal, handleCloseModal, seasons, onSelectSeason }) => {
    return(
        <Modal transparent visible={openModal} onRequestClose={handleCloseModal} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row' }}>
                            <Icon name="list-alt" size={27} color="#333"/>
                            <Text style={styles.textHeader}>TEMPORADAS</Text>
                        </View>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="window-close" size={27} color="red"/>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingHorizontal: 14, paddingVertical: 10, }}>
                        <FlatList
                            data={seasons}
                            numColumns={4}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.buttonSeason}
                                    onPress={() => {
                                        onSelectSeason(item); // Envía la temporada seleccionada a Serie
                                        handleCloseModal();   // Cierra el modal
                                    }}
                                >
                                    <Text style={styles.text}>{`Temporada ${item.temporada}`}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item.temporada}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    )
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
    buttonSeason: {
        backgroundColor: '#007BFF',
        borderRadius: 5,
        padding: 10,
        margin: 6,
        width: '23%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 16,
        color: "#FFF",
        textAlign: 'center',
    },
});

export default ModalSeasons;