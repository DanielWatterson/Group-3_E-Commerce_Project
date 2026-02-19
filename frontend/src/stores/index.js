import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state: {
    customer: [],
    token: localStorage.getItem("token") || null,
  },
  mutations: {
    getCustomer(state, payload) {
      state.customer = payload;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    CLEAR_TOKEN(state) {
      state.token = null;
      localStorage.removeItem("token");
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
        commit("getCustomer", res.data);
        return res;
      } catch (error) {
        console.error("Failed to fetch postCustomer:", error);
        throw error;
      }
    },
    async login({ commit }, payload) {
      try {
        let { data } = await axios.post(`http://localhost:5050/login`, payload);
        console.log({ data });

        if (!data?.token) {
          throw new Error(data?.message || "Login failed");
        }

        commit("SET_TOKEN", data.token);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${data.token}`;
        alert(data.message || "Login successful!");
        return true;
      } catch (error) {
        console.error("Failed to fetch login:", error);
        alert(
          error.response?.data?.message ||
            error.message ||
            "Login failed. Please try again.",
        );
        throw error;
      }
    },
    logout({ commit }) {
      commit("CLEAR_TOKEN");
      // Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];
      alert("Logged out successfully!");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getToken: (state) => state.token,
  },
});

export default store;
//     localStorage.setItem("token", data.value);
//     alert(data.message);
// } catch (error) {
//     console.error("Failed to fetch login:", error);
//     throw error;
