import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    catsLive: [],
    catsVod: [],
    catsSeries: [],
    live: [],
    vod: [],
    series: [],
    episodes: [],
};

const streamingSlice = createSlice({
    name: 'streaming',
    initialState,
    reducers: {
        setCatsLive: (state, action) => {
            state.catsLive = action.payload;
        },
        setCatsVod: (state, action) => {
            state.catsVod = action.payload;
        },
        setCatsSeries: (state, action) => {
            state.catsSeries = action.payload;
        },
        setLive: (state, action) => {
            state.live = action.payload;
        },
        setVod: (state, action) => {
            state.vod = action.payload;
        },
        setSeries: (state, action) => {
            state.series = action.payload;
        },
        setEpisodes: (state, action) => {
            state.episodes = action.payload;
        },
        changeContentProperties: (state, action) => {
            const { type, contentId, changes } = action.payload;
            const typeContent = type === 'live' ? state.live : (type === 'vod' ? state.vod : (type === 'series' ? state.series : state.episodes));
            const content = typeContent.find(contenido => (type === 'series' ? contenido.series_id : (type === 'episodes' ? contenido.id : contenido.stream_id)) === contentId);
            if (content) {
                Object.assign(content, changes);
            }
        },
        changeCategoryProperties: (state, action) => {
            const { type, categoryId, changes } = action.payload;
            const typeContent = type === 'live' ? state.catsLive : (type === 'vod' ? state.catsVod : state.catsSeries);
            const categoria = typeContent.find(category => category.category_id === categoryId);
            if (categoria) {
                Object.assign(categoria, changes);
            }
        },
    },
});

export const { setCatsLive, setCatsVod, setCatsSeries, setLive, setVod, setSeries, setEpisodes, changeContentProperties, changeCategoryProperties } = streamingSlice.actions;

export default streamingSlice.reducer;