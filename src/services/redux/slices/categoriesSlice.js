import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  catsTv: [],
  catsMovies: [],
  catsSeries: [],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCatsTV: (state, action) => {
      state.catsTv = action.payload;
    },
    setCatsMovies: (state, action) => {
      state.catsMovies = action.payload;
    },
    setCatFavoriteMovies: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.catsMovies.findIndex(categorie => categorie.id === id);
      if (index !== -1) {
        state.catsMovies[index] = { ...state.catsMovies[index], ...changes };
      }
    },
    setCatsSeries: (state, action) => {
      state.catsSeries = action.payload;
    },
    setCatFavoriteSeries: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.catsSeries.findIndex(categorie => categorie.id === id);
      if (index !== -1) {
        state.catsSeries[index] = { ...state.catsSeries[index], ...changes };
      }
    },
  },
});

export const { setCatsTV, setCatsMovies, setCatFavoriteMovies, setCatsSeries, setCatFavoriteSeries } = categoriesSlice.actions;

export default categoriesSlice.reducer;
