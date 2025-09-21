const apiKey = 'Aquí tu Key de la API TMDB';

class TMDBController {
    //Obtiene la informacion de una pelicula
    async getDataMovie(title, year, release) {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}&language=es-MX`;

        try {
            //Se buscan peliculas que coincidan con el nombre y año
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            const movie = searchData.results.find(result => release === result.release_date); //Selecciona la que coincida con la fecha de estreno
            if (movie) {
                const info = await this.getDataMovieById(movie.id);
                return info;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error al obtener la pelicula: ', error);
        }
    }

    async getDataMovieById(tmdbID) {
        try {
            const detalles = await this.getDetailsMovie(tmdbID); //Obtiene solo los detalles necesarios
            const creditos = await this.getCreditsMovie(tmdbID); //Obtiene solo los creditos necesarios
            return {
                tmdb_id: detalles.tmdb_id,
                backdrop_path: detalles.backdrop_path,
                original_title: detalles.original_title,
                overview: detalles.overview,
                poster_path: detalles.poster_path,
                runtime: detalles.runtime,
                genres: detalles.genres.map(genre => genre.name).join(', '),
                vote_average: detalles.vote_average,
                cast: JSON.stringify(creditos)
            };
        } catch (error) {
            console.error('Error al obtener la pelicula: ', error);
        }
    }

    //Obtiene la informacion de una serie
    async getDataSerie(title, year, release) {
        const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}&language=es-MX`;

        try {
            //Se buscan series que coincidan con el nombre y año
            const searchResponse = await fetch(searchUrl);
            const searchData = await searchResponse.json();

            const serie = searchData.results.find(result => release === result.first_air_date); //Selecciona la que coincida con la fecha de estreno
            if (serie) {
                const info = await this.getDataSerieById(serie.id);
                return info;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error al obtener la Serie: ', error);
        }
    }

    async getDataSerieById(tmdbID) {
        try {
            const detalles = await this.getDetailsSerie(tmdbID); //Obtiene solo los detalles necesarios
            const creditos = await this.getCreditsSerie(tmdbID); //Obtiene solo los creditos necesarios
            return {
                tmdb_id: detalles.tmdb_id,
                original_name: detalles.original_name,
                backdrop_path: detalles.backdrop_path,
                poster_path: detalles.poster_path,
                vote_average: detalles.vote_average,
                genres: detalles.genres.map(genre => genre.name).join(', '),
                overview: detalles.overview,
                cast: JSON.stringify(creditos)
            };
        } catch (error) {
            console.error('Error al obtener la Serie: ', error);
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

    //Se busca la información de la serie por su id
    async getInfoSerie(id) {
        const infoSerie = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=es-MX`;

        return fetch(infoSerie)
            .then((infoResponse) => infoResponse.json())
            .then((infoData) => ({
                original_name: infoData.original_name,
                poster_path: infoData.poster_path,
                backdrop_path: infoData.backdrop_path,
                first_air_date: infoData.first_air_date,
                genres: infoData.genres,
                vote_average: infoData.vote_average,
                overview: infoData.overview
            }));
    }

    //Se busca la información de los capitulos por su id de serie y el numero de temporada
    async getInfoChapters(id, season) {
        const infoChapters = `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${apiKey}&language=es-MX`;

        return fetch(infoChapters)
            .then((infoResponse) => infoResponse.json())
            .then((infoData) => ({
                episodes: infoData.episodes.map(episode => ({
                    episode_number: episode.episode_number,
                    name: episode.name,
                    overview: episode.overview,
                    vote_average: episode.vote_average,
                    runtime: episode.runtime || 0
                }))
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
                tmdb_id: detailsData.id,
                backdrop_path: detailsData.backdrop_path,
                original_title: detailsData.original_title,
                overview: detailsData.overview,
                poster_path: detailsData.poster_path,
                runtime: detailsData.runtime,
                vote_average: detailsData.vote_average,
                genres: detailsData.genres
            };
            return details; //Se retorna el objeto con los detalles
        } catch (error) {
            console.log('Error al obtener los detallaes de la pelicula: ', error);
        }
    }

    //Se buscan los detalles de la serie por su id
    async getDetailsSerie(id) {
        const detailsUrl = `https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=es-MX`;

        try {
            const detailsRespone = await fetch(detailsUrl);
            const detailsData = await detailsRespone.json();
            //Se guardan solo los detalles que son relevantes
            const details = {
                tmdb_id: detailsData.id,
                original_name: detailsData.original_name,
                backdrop_path: detailsData.backdrop_path,
                vote_average: detailsData.vote_average,
                poster_path: detailsData.poster_path,
                genres: detailsData.genres,
                overview: detailsData.overview
            };
            return details; //Se retorna el objeto con los detalles
        } catch (error) {
            console.log('Error al obtener los detallaes de la serie: ', error);
        }
    }

    //Se buscan los creditos de la pelicula por su id
    async getCreditsMovie(id) {
        const creditsUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}&language=es-MX`;

        try {
            const creditsResponse = await fetch(creditsUrl);
            const creditsData = await creditsResponse.json();

            const credits = creditsData.cast
                .filter(actor => actor.known_for_department === "Acting")
                .map(actor => {
                    // Asignar imagen según la condición
                    const imagen = actor.profile_path === "null" ? null : `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actor.profile_path}`;

                    return {
                        nombre: actor.name,
                        imagen: imagen
                    };
                });

            return credits; //Se retorna el arreglo de objetos con los creditos
        } catch (error) {
            console.log('Error al obtener los creditos de la pelicula: ', error);
        }
    }

    //Se buscan los creditos de la serie por su id
    async getCreditsSerie(id) {
        const creditsUrl = `https://api.themoviedb.org/3/tv/${id}/credits?api_key=${apiKey}&language=es-MX`;

        try {
            const creditsResponse = await fetch(creditsUrl);
            const creditsData = await creditsResponse.json();

            const actores = creditsData.cast
                .filter(actor => actor.known_for_department === "Acting")
                .map(actor => {
                    // Asignar imagen según la condición
                    const imagen = actor.profile_path === "null" ? null : `https://image.tmdb.org/t/p/w600_and_h900_bestv2${actor.profile_path}`;

                    return {
                        nombre: actor.name,
                        imagen: imagen
                    };
                });

            return actores; //Se retorna el arreglo de objetos con los creditos
        } catch (error) {
            console.log('Error al obtener los creditos de la serie: ', error);
        }
    }
}

export default TMDBController;