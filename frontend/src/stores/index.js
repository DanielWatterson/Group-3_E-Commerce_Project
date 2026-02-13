import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
    state: {
        customer: [],
    },
    mutations: {
        getCustomer(state, payload) {
            state.customer = payload;
        },
    },
    actions: {
        async getCustomer({ commit }) {
            try {
                const res = await axios.get(`http://localhost:5050/customer`);
                commit("getCustomer", res.data);
            } catch (error) {
                console.error("Failed to fetch getCustomer:", error);
                throw error;
            }
        },
    },
});

export default store;
