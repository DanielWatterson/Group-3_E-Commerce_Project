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
        async postCustomer({ commit }, payload) {
            try {
                const res = await axios.post(`http://localhost:5050/customer`, payload);
                commit("postCustomer", res.data);
            } catch (error) {
                console.error("Failed to fetch postCustomer:", error);
                throw error;
            }
        },

    },
});

export default store;
