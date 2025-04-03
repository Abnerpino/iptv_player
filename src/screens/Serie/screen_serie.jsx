import React, { useState } from 'react';
import { View, Text, ScrollView, Image, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import CardActor from '../../components/Cards/card_actor';
import StarRating from '../../components/StarRating';
import ModalOverview from '../../components/Modals/modal_overview';
import Icon from 'react-native-vector-icons/FontAwesome';

const Serie = ({ navigation, route }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [favorite, setFavorite] = useState(false);

    const title = route.params.titulo;
    const poster = route.params.imagen;
    const details = route.params.info;
    const link = route.params.link;
    const chapters = route.params.capitulos;
    const id = route.params.id;
    //console.log(id);
    //const credits = route.params.info[1];

    const getDate = (date) => {
        const fecha = new Date(date);
        const day = fecha.getDate().toString().padStart(2, '0');
        const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const year = fecha.getFullYear();
        const newDate = date ? `${day}/${month}/${year}` : 'N/A';
        return newDate;
    };

    const convertDuration = (minutes) => {
        if (minutes) {
            const hours = Math.floor(minutes / 60); // Obtener las horas
            const minutesRemaining = minutes % 60; // Obtener los minutos restantes
            return `${hours}h ${minutesRemaining}m`; // Formato de salida
        } else {
            return 'N/A';
        }
    };

    function handleCloseModal() {
        setModalVisible(false);
    }

    return (
        <View style={styles.container}>
            {/* Vista principal en columna */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10
            }}>
                {/* Fila con textos */}
                <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>{title}</Text>
            </View>

            {/* ScrollView para contenido desplazable */}
            <ScrollView>
                {/* Vista en fila dentro del ScrollView */}
                <View style={styles.row}>
                    <Image
                        source={{ uri: `https://image.tmdb.org/t/p/original${details.poster_path}` }} // URL de la imagen
                        style={{ width: '15.5%', height: '100%', borderRadius: 5, borderColor: '#fff', borderWidth: 0.5 }}
                        resizeMode='contain'
                    />
                    <View style={{ flexDirection: 'row', paddingLeft: 35, width: '100%', }}>
                        <View style={styles.column}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Título original:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Lanzamiento:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Género:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Calificación:</Text>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>Trama:</Text>
                            
                        </View>
                        <View style={{ flexDirection: "column", alignItems: "flex-start", marginLeft: 75, paddingRight: '31%', }}>
                            <Text style={styles.text}>{details.original_name ? details.original_name : 'N/A'}</Text>
                            <Text style={styles.text}>{getDate(`${details.first_air_date}T06:00:00.000Z`)}</Text>
                            <Text style={styles.text}>{details.genres ? details.genres.map(genre => genre.name).join('/') : 'N/A'}</Text>
                            <StarRating rating={details.vote_average ? details.vote_average : 0}/>
                            <Text style={{ fontSize: 16, textAlign: 'justify', color: '#CCC', paddingRight: 0, }} numberOfLines={2} >{details.overview ? details.overview : 'N/A'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Text style={{ color: 'rgb(255,127,0)', fontSize: 14, fontWeight: 'bold' }}>Leer Más</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Reproductor', { link })} style={[styles.button, { marginRight: 20 }]}>
                        <Icon name="play-circle-o" size={22} color="white"/>
                        <Text style={styles.textButton}>Play</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { marginRight: 20 }]}>
                        <Icon name="list-alt" size={22} color="white"/>
                        <Text style={styles.textButton}>Temporada</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFavorite(!favorite)} style={styles.button}>
                        <Icon name={!favorite ? "heart-o" : "heart"} size={22} color={!favorite ? "black" : "red"}/>
                        <Text style={styles.textButton}>Favoritos</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingVertical: 10 }}>
                    <Text ></Text>
                </View>
                {/* Vista en columna con texto y FlatList */}
                <View style={{ paddingHorizontal: 5, paddingBottom: 5 }}>
                    {/*<FlatList
                        data={credits[0]}
                        horizontal
                        renderItem={({ item }) => (
                            <CardActor
                                imagen={item.imagen}
                                nombre={item.nombre}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={ItemSeparator}
                    />*/}
                </View>
            </ScrollView>
            {/* Modal para mostrar la trama completa */}
            <ModalOverview
                openModal={modalVisible}
                handleCloseModal={handleCloseModal}
                overview={details.overview}
            />
        </View>
    );
};

// Estilos para la aplicación
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 25,
        backgroundColor: '#101010',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    column: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    text: {
        fontSize: 16,
        color: '#CCC',
        marginVertical: 5,
    },
    button: {
        width: '15%',
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 5,
        padding: 5,
        backgroundColor: 'rgb(80,80,100)',
    },
    textButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        paddingLeft: 5 
    },
});

export default Serie;