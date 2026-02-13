import { createStore } from "vuex";
const store = createStore({
    state: {
        products: [],
    },
    mutations: {
        getProducts(state, payload) {
            state.products = payload;
        },
    },
    actions: {
        async getProducts({ commit }) {
            try {
                const res = await axios.get(`http://localhost:5050/products`);
                commit("getProducts", res.data);
            } catch (error) {
                console.error("Failed to fetch getProducts:", error);
                throw error;
            }
        },
    },
});

export default store;
