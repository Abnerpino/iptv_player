import { getRealm } from './index';

const realm = getRealm();

export const saveItems = (type, data) => {
  let idContenido = -1;
  const model = getModelName(type);
  realm.write(() => {
    // Limpia primero para evitar duplicados
    const old = realm.objects(model);
    realm.delete(old);

    try {
      data.forEach(item => {
        const id = type === 'series' ? item.series_id : item.stream_id;
        if (id !== idContenido) {
          realm.create(model, item);
          idContenido = id;
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

export const getItems = (type) => {
  const model = getModelName(type);
  return realm.objects(model).sorted('num');
};

export const getItemById = (type, id) => {
  const model = getModelName(type);
  return realm.objectForPrimaryKey(model, id);
};

export const updateItem = (type, idKey, idValue, changes) => {
  const model = getModelName(type);
  realm.write(() => {
    const item = realm.objectForPrimaryKey(model, idValue);
    if (item) {
      Object.entries(changes).forEach(([key, value]) => {
        item[key] = value;
      });
    }
  });
};

export const marckEpisodeAsWatched = (serieId, numSeason, episodioId) => {
  const serie = realm.objectForPrimaryKey('Serie', serieId);
  if (!serie) {
    console.log('No se encontró la serie');
    return;
  } else console.log('Serie encontrada');

  const temporada = serie.temporadas.find(t => t.numero === numSeason);
  if (!temporada) {
    console.log('No se encontró la temporada');
    return;
  } else console.log('Temporada encontrada');

  realm.write(() => {
    const episodio = temporada.episodios.find(e => e.id === episodioId);
    if (episodio) {
      episodio.visto = true;
    }
  });
};

export const getModelName = (type) => {
  if (type === 'live') return 'Canal';
  if (type === 'vod') return 'Pelicula';
  return 'Serie';
};