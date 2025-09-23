import Realm from 'realm';
import {
  CanalSchema,
  PeliculaSchema,
  SerieSchema,
  TemporadaSchema,
  EpisodioSchema,
  CanalAuxSchema,
  PeliculaAuxSchema,
  SerieAuxSchema,
  EpisodioAuxSchema,
  TemporadaAuxSchema
} from '../schemas/schemasStreaming';

let realmInstance;

export const getRealm = () => {
  if (!realmInstance) {
    realmInstance = new Realm({
      schema:
        [
          CanalSchema,
          CanalAuxSchema,
          PeliculaSchema,
          PeliculaAuxSchema,
          SerieSchema,
          SerieAuxSchema,
          TemporadaSchema,
          TemporadaAuxSchema,
          EpisodioSchema,
          EpisodioAuxSchema
        ],
      schemaVersion: 1,
    });
  }
  return realmInstance;
};