import { View, Text, TouchableOpacity, Image } from "react-native";
import TMDBController from "../../services/controllers/tmdbController";

const tmdbController = new TMDBController;

const CardItem = ({ navigation, imagen, titulo, link, tipo, id, temporadas }) => {
    const handleNavigateToScreen = async () => {
        if (tipo === 'TV') {
            navigation.navigate('Reproductor', { link });
        }
        else if (tipo === 'Cine') {
            const title = titulo.replace(/\s*\(\d{4}\)/, ''); // Elimina el año y solo deja el nombre de la Pelicula
            const posterPath = getPosterPath(imagen);
            const info = await tmdbController.getDataMovie(title, posterPath); //Obtiene la información general de la pelicula
            navigation.navigate('Pelicula', { imagen, titulo, info, link });
        }
        else {
            const info = await tmdbController.getInfoSerie(id); // Obtitne la información general de la serie
            
            // Genera un nuevo arreglo con la información que ya existia de los capitulos y temporadas y le agrega la información obtenida de la consulta a los capitulos para que esté completa
            const seasons = await Promise.all(
                // Recorremos cada temporada y procesamos sus capítulos
                temporadas.map(async (temp) => {
                    // Hacemos la consulta a la API
                    const resultadoAPI = await tmdbController.getInfoChapters(id, temp.temporada);
                    
                    // Mapeamos los episodios de la API a un formato más accesible
                    const episodiosAPI = resultadoAPI.episodes.reduce((acc, episode) => {
                        acc[episode.episode_number] = {
                            name: episode.name,
                            overview: episode.overview,
                            vote_average: episode.vote_average,
                            runtime: episode.runtime || 0
                        };
                        return acc;
                    }, {});
                    
                    // Fusionamos los datos
                    const capitulosActualizados = temp.capitulos.map(cap => {
                        const numCapitulo = parseInt(cap.capitulo, 10);
                        return {
                            ...cap,
                            ...episodiosAPI[numCapitulo] || {} // Si existe, fusionamos los datos
                        };
                    });
                    
                    return {
                        ...temp,
                        capitulos: capitulosActualizados
                    };
                })
            );
            
            navigation.navigate('Serie', { imagen, titulo, info, link, id, seasons });
        }
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