import { View, Text, TouchableOpacity, Image } from "react-native";
import TMDBController from "../../services/controllers/tmdbController";

const CardItem = ({ navigation, imagen, titulo, link, tipo }) => {
    const tmdbController = new TMDBController;

    const handleNavigateToScreen = async () => {
        if (tipo === 'TV') {
            navigation.navigate('Reproductor', { link });
        }
        else if (tipo === 'Cine') {
            const title = titulo.replace(/\s*\(\d{4}\)/, ''); // Elimina el año y solo deja el nombre de la Pelicula
            const posterPath = getPosterPath(imagen);
            const info = await tmdbController.getDataMovie(title, posterPath);
            navigation.navigate('Pelicula', { imagen, titulo, info, link });
        }
        else {
            const title = separateTitle(titulo);
            console.log(title);
            const stillPath = getPosterPath(imagen);
            const info = await tmdbController.findSerie(title.name, title.season, title.episode, stillPath);
            console.log(info.poster_path);
            navigation.navigate('Serie', { imagen, titulo, info, link });
        }
    }

    function separateTitle(info) {
        const regex = /(.*?)\s\((\d{4})\)\sS(\d+)\sE(\d+)/;
        const match = info.match(regex);

        return { // Retorna por separado la información
            name: match[1],   // Nombre de la serie
            year: match[2],   // Año de estreno
            season: match[3], // Número de temporada
            episode: match[4] // Número de episodio
        };
    }

    function getPosterPath(url) {
        const ultimoSlash = url.lastIndexOf('/'); // Encuentra la última posición de '/'
        return url.substring(ultimoSlash); // Extrae desde esa posición hasta el final
    }

    return (
        <TouchableOpacity style={{ margin: '1%', width: '18%', height: tipo === 'TV' ? 100 : 160 }} onPress={handleNavigateToScreen}>
            <Image source={{ uri: tipo === 'Series' ? `https://image.tmdb.org/t/p/original${imagen}` : imagen }} resizeMode={tipo === 'TV' ? "cover" : "contain"} style={{ width: '100%', height: '100%', borderRadius: 5, }} />
            <View style={{
                position: 'absolute',
                bottom: 0, // Posiciona el texto en la parte inferior
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.35)', // Fondo semitransparente para el texto
                paddingVertical: 5,
                borderBottomLeftRadius: 5,
                borderBottomRightRadius: 5
            }}>
                <Text style={{ color: '#FFF', fontSize: 14, textAlign: 'center', fontWeight: '500' }}>{titulo}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default CardItem;