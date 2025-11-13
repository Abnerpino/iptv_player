export const UsuarioSchema = {
    name: 'Usuario',
    primaryKey: 'device_id',
    properties: {
        id: 'string?',
        device_id: 'string',
        client_name: 'string?',
        username: 'string?',
        user: 'string?',
        password: 'string?',
        host: 'string?',
        is_registered: 'bool',
        is_active: 'bool',
        expiration_date: 'string?',
        purchased_package: 'string?',
        device_model: 'string?',
        android_version: 'string?',
    }
};

export const NotificacionSchema = {
    name: 'Notificacion',
    primaryKey: 'id',
    properties: {
        id: 'string',
        message: 'string',
        visto: 'bool',
        fecha: 'date',
    },
};

export const CanalSchema = {
    name: 'Canal',
    primaryKey: 'stream_id',
    properties: {
        num: 'string',
        name: 'string',
        stream_id: 'string',
        stream_icon: 'string?',
        category_id: 'string',
        category_ids: 'string[]',
        link: 'string',
        aux_link: 'string',
        favorito: 'bool',
        visto: 'bool',
        fecha_visto: 'date?',
    },
};

export const CatsLiveSchema = {
    name: 'CatsLive',
    primaryKey: 'category_id',
    properties: {
        category_id: 'string',
        category_name: 'string',
        total: 'int',
        canales: { type: 'list', objectType: 'Canal' }
    },
};

export const PeliculaSchema = {
    name: 'Pelicula',
    primaryKey: 'stream_id',
    properties: {
        num: 'string',
        name: 'string',
        title: 'string?',
        year: 'string?',
        stream_id: 'string',
        stream_icon: 'string?',
        rating: 'string',
        plot: 'string?',
        genre: 'string?',
        release_date: 'string?',
        episode_run_time: 'string?',
        category_id: 'string',
        category_ids: 'string[]',
        tmdb_id: 'string?',
        backdrop_path: 'string?',
        original_title: 'string?',
        overview: 'string?',
        poster_path: 'string?',
        runtime: 'string?',
        genres: 'string?',
        vote_average: 'string?',
        cast: 'string?',
        link: 'string',
        aux_link: 'string',
        favorito: 'bool',
        visto: 'bool',
        fecha_visto: 'date?',
        playback_time: 'string',
    },
};

export const CatsVodSchema = {
    name: 'CatsVod',
    primaryKey: 'category_id',
    properties: {
        category_id: 'string',
        category_name: 'string',
        total: 'int',
        peliculas: { type: 'list', objectType: 'Pelicula' }
    },
};

export const EpisodioSchema = {
    name: 'Episodio',
    embedded: true,
    properties: {
        id: 'string',
        episode_num: 'string',
        title: 'string',
        plot: 'string?',
        duration_secs: 'string',
        movie_image: 'string?',
        rating: 'string',
        season: 'string',
        id_serie: 'string',
        link: 'string',
        aux_link: 'string',
        visto: 'bool',
        playback_time: 'string',
    },
};

export const TemporadaSchema = {
    name: 'Temporada',
    embedded: true,
    properties: {
        numero: 'string',
        idx_last_ep_played: 'int',
        episodios: { type: 'list', objectType: 'Episodio' },
    },
};

export const SerieSchema = {
    name: 'Serie',
    primaryKey: 'series_id',
    properties: {
        num: 'string',
        name: 'string',
        title: 'string?',
        year: 'string?',
        series_id: 'string',
        cover: 'string?',
        plot: 'string?',
        genre: 'string?',
        release_date: 'string?',
        rating: 'string?',
        backdrop_path: 'string?',
        category_id: 'string',
        category_ids: 'string[]',
        tmdb_id: 'string?',
        original_name: 'string?',
        backdrop_path_aux: 'string?',
        vote_average: 'string?',
        poster_path: 'string?',
        genres: 'string?',
        overview: 'string?',
        cast: 'string?',
        temporadas: { type: 'list', objectType: 'Temporada' },
        favorito: 'bool',
        visto: 'bool',
        fecha_visto: 'date?',
        saga: 'bool',
        last_ep_played: 'int[]',
    },
};

export const CatsSerieSchema = {
    name: 'CatsSerie',
    primaryKey: 'category_id',
    properties: {
        category_id: 'string',
        category_name: 'string',
        total: 'int',
        series: { type: 'list', objectType: 'Serie' }
    },
};