const apiKey = '46cdd28e2e3e11e156481c7a3826cfc3';

class TMDBController {
    //Obtiene la informacion de una pelicula
    async getDataMovie(title, poster) {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=es-MX`;

        try {
            //Se buscan peliculas que coincidan con el nombre
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();
            
            const info = searchData.results.find(result => poster === result.poster_path); //Se selecciona la que coincida con el poster
            const detalles = await this.getDetailsMovie(info.id); //Obtiene solo los detalles necesarios
            const creditos = await this.getCreditsMovie(info.id); //Obtiene solo los creditos necesarios
            return [detalles, creditos];
        } catch (error) {
            console.error('Error al obtener la pelicula: ', error);
        }
    }

    //Busca una serie usando la propiedad still_path de algun episodio de alguna temporada
    findSerie(title, year, season, episode, still) {
        const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}&language=es-MX`;
    
        return fetch(searchUrl)
            .then((searchResponse) => searchResponse.json())
            .then((searchData) => {
                // Iterar sobre cada resultado buscando el primer episodio de la primera temporada
                let matchPromises = searchData.results.map((result) => {
                    const matchUrl = `https://api.themoviedb.org/3/tv/${result.id}/season/${season}/episode/${episode}?api_key=${apiKey}&language=es-MX`;
                    
                    return fetch(matchUrl)
                        .then((matchResponse) => matchResponse.json())
                        .then((matchData) => {
                            if (still === matchData.still_path) {
                                const infoUrl = `https://api.themoviedb.org/3/tv/${result.id}?api_key=${apiKey}&language=es-MX`;
                                return fetch(infoUrl)
                                    .then((infoResponse) => infoResponse.json())
                                    .then((infoData) => ({
                                        id: infoData.id,
                                        poster_path: infoData.poster_path
                                    }));
                            }
                            return null; // No coincide
                        })
                        .catch((error) => {
                            console.log("Error al obtener episodio:", error);
                            return null;
                        });
                });
    
                // Retornar la primera promesa que tenga un resultado válido
                return Promise.all(matchPromises).then((results) => results.find((info) => info !== null) || null);
            })
            .catch((error) => {
                throw new Error(`Error en TMDB: ${error.message || error}`);
            });
    }
    
    async getInfoSerie(id) {
        const infoSerie = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=es-MX`;

        return fetch(infoSerie)
            .then((infoResponse) => infoResponse.json())
            .then((infoData) => ({
                name: infoData.name,
                poster_path: infoData.poster_path,
                first_air_date: infoData.first_air_date,
                genres: infoData.genres,
                vote_average: infoData.vote_average,
                overview: infoData.overview
            }));
    }

    //Se buscan los detalles de la pelicula por su id
    async getDetailsMovie(id) {
        const detailsUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=es-MX`;

        try {
            const detailsRespone = await fetch(detailsUrl);
            const detailsData = await detailsRespone.json();
            //Se guardan solo los detalles que son relevantes
            const details = {
                id: detailsData.id,
                original_title: detailsData.original_title,
                overview: detailsData.overview,
                first_air_date: detailsData.first_air_date,
                runtime: detailsData.runtime,
                vote_average: detailsData.vote_average,
                genres: detailsData.genres.map(genre => genre.name)
            };
            return details; //Se retorna el objeto con los detalles
        } catch (error) {
            console.log('Error al obtener los detallaes de la pelicula: ', error);
        }
    }

    //Se buscan los creditos de la pelicula por su id
    async getCreditsMovie(id) {
        const creditsUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=es-MX`;

        try {
            const creditsResponse = await fetch(creditsUrl);
            const creditsData = await creditsResponse.json();

            const credits = [];
            let cont = 1; // Inicializar el contador
            // Filtrar actores
            const actores = creditsData.cast
                .filter(actor => actor.known_for_department === "Acting")
                .map(actor => {
                    // Asignar imagen según la condición
                    const imagen = actor.profile_path === "null" ? null : `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actor.profile_path}`;

                    return {
                        id: cont++, // Asignar el contador y luego incrementarlo
                        nombre: actor.name,
                        imagen: imagen
                    };
                });
            // Agregar el objeto de actores al arreglo credits
            credits.push(actores);
            
            return credits; //Se retorna el arreglo de objetos con los creditos
        } catch (error) {
            console.log('Error al obtener los creditos de la pelicula: ', error);
        }
    }
}

export default TMDBController;