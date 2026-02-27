import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state: {
    customer: [],
    products: [],
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    userRole: localStorage.getItem("userRole") || 'guest',
  },
  
  mutations: {
    SET_CUSTOMER(state, payload) {
      state.customer = payload;
    },
    SET_PRODUCTS(state, payload) {
      state.products = payload;
    },
    ADD_TO_CART(state, product) {
      const existingItem = state.cart.find(item => item.product_id === product.product_id);
      if (existingItem) {
        existingItem.cart_quantity += 1;
      } else {
        state.cart.push({ ...product, cart_quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    REMOVE_FROM_CART(state, productId) {
      state.cart = state.cart.filter(item => item.product_id !== productId);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    UPDATE_CART_QUANTITY(state, { productId, quantity }) {
      const item = state.cart.find(item => item.product_id === productId);
      if (item) {
        item.cart_quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },
    CLEAR_CART(state) {
      state.cart = [];
      localStorage.removeItem("cart");
    },
    SET_TOKEN(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },
    CLEAR_TOKEN(state) {
      state.token = null;
      state.user = null;
      state.userRole = 'guest';
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      delete axios.defaults.headers.common["Authorization"];
    },
    SET_USER(state, user) {
      state.user = user;
      state.userRole = user?.isAdmin ? 'admin' : 'user';
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", state.userRole);
    },
  },
  
  actions: {
    async getCustomer({ commit }) {
      const res = await axios.get(`http://localhost:5050/customer`);
      commit("SET_CUSTOMER", res.data);
    },
    async postCustomer({ commit }, payload) {
      const res = await axios.post(`http://localhost:5050/customer`, payload);
      return res;
    },
    async getProducts({ commit }) {
      const res = await axios.get(`http://localhost:5050/products`);
      commit("SET_PRODUCTS", res.data);
      return res.data;
    },
    addToCart({ commit }, product) {
      commit('ADD_TO_CART', product);
    },
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId);
    },
    updateCartQuantity({ commit }, payload) {
      commit('UPDATE_CART_QUANTITY', payload);
    },
    clearCart({ commit }) {
      commit('CLEAR_CART');
    },
    async login({ commit }, payload) {
      const { data } = await axios.post(`http://localhost:5050/login`, payload);
      if (!data?.token) throw new Error("Login failed");
      
      commit("SET_TOKEN", data.token);
      commit("SET_USER", {
        id: data.userId,
        name: payload.email.split('@')[0],
        email: payload.email,
        isAdmin: false
      });
      return true;
    },
    logout({ commit }) {
      commit("CLEAR_TOKEN");
      commit("CLEAR_CART");
    },
  },
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    cartItems: (state) => state.cart,
    cartTotal: (state) => state.cart.reduce((sum, item) => sum + (item.product_price * item.cart_quantity), 0),
    cartCount: (state) => state.cart.reduce((count, item) => count + item.cart_quantity, 0),
    
    // Access control
    userRole: (state) => state.userRole,
    isGuest: (state) => state.userRole === 'guest',
    isUser: (state) => state.userRole === 'user',
    canAddToCart: (state) => state.userRole !== 'guest',
    canCheckout: (state) => state.userRole !== 'guest',
    maxPriceView: () => 1000,
    
    visibleProducts: (state, getters) => (products) => {
      if (!getters.isGuest) return products;
      return products.filter(p => p.product_price <= getters.maxPriceView);
    }
  },
});

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export default store;