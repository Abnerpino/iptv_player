import Realm from 'realm';
import { CanalSchema, PeliculaSchema, SerieSchema, TemporadaSchema, EpisodioSchema } from '../schemas/schemasStreaming';

let realmInstance;

export const getRealm = () => {
  if (!realmInstance) {
    realmInstance = new Realm({
      schema: [ CanalSchema, PeliculaSchema, SerieSchema, TemporadaSchema, EpisodioSchema ],
      schemaVersion: 1,
    });
  }
  return realmInstance;
};