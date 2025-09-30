import { Modal, Text, TouchableOpacity, View, StyleSheet, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import ItemEpisode from "../Items/item_episode";

const ModalEpisodes = ({ openModal, handleCloseModal, temporada, episodes, onSelectEpisode }) => {

    return (
        <Modal transparent visible={openModal} onRequestClose={handleCloseModal} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleCloseModal}>
                            <Icon name="arrow-circle-left" size={26} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                        <Text style={styles.textHeader}>{`Episodios - Temporada ${temporada}`}</Text>
                    </View>
                    <View style={{ paddingTop: 10, paddingBottom: 40 }}>
                        <FlatList
                            data={episodes}
                            keyExtractor={(item) => item.id} //No es necesario hacer la conversión porque ya es string
                            renderItem={({ item }) => (
                                <ItemEpisode
                                    episode={item}
                                    onSelectEpisode={(episodio) => {
                                        onSelectEpisode(episodio);
                                        handleCloseModal();
                                    }}
                                />
                            )}
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
        backgroundColor: "rgba(0,0,0,0.75)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "100%",
        height: '100%'
    },
    header: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#888',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    textHeader: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff',
        textAlignVertical: 'center',
        paddingLeft: 5
    },
});

export default ModalEpisodes;