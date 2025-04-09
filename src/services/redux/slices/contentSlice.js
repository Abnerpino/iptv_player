import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tv: [],
  movies: [],
  series: [],
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setTV: (state, action) => {
      state.tv = action.payload;
    },
    setMovies: (state, action) => {
      state.movies = action.payload;
    },
    setFavoriteMovie: (state, action) => {
        const { title, changes } = action.payload;
        const index = state.movies.findIndex(movie => movie['tvg-name'] === title);
        if (index !== -1) {
          state.movies[index] = { ...state.movies[index], ...changes };
        }
    },
    setSeries: (state, action) => {
      state.series = action.payload;
    },
  },
});

export const { setTV, setMovies, setFavoriteMovie, setSeries } = contentSlice.actions;

export default contentSlice.reducer;
