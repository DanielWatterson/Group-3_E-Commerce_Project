import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state: {
    customer: [],
    products: [],
    // Load cart from localStorage or start empty
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    token: localStorage.getItem("token") || null,
  },
  mutations: {
    getCustomer(state, payload) {
      state.customer = payload;
    },
    SET_PRODUCTS(state, payload) {
      state.products = payload;
    },
    ADD_TO_CART(state, product) {
      // Check if product already in cart
      const existingItem = state.cart.find(item => item.product_id === product.product_id);
      
      if (existingItem) {
        // Increment quantity if exists
        existingItem.cart_quantity += 1;
      } else {
        // Add new item with quantity 1
        state.cart.push({
          ...product,
          cart_quantity: 1
        });
      }
      // Save to localStorage
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
    
    async getProducts({ commit }) {
      try {
        const res = await axios.get(`http://localhost:5050/products`);
        commit("SET_PRODUCTS", res.data);
        return res.data;
      } catch (error) {
        console.error("Failed to fetch products:", error);
        throw error;
      }
    },
    
    async createProduct({ commit }, payload) {
      try {
        const res = await axios.post(`http://localhost:5050/products`, payload);
        await this.dispatch('getProducts');
        alert("Product created successfully!");
        return res.data;
      } catch (error) {
        console.error("Failed to create product:", error);
        alert(error.response?.data?.error || "Failed to create product");
        throw error;
      }
    },
    
    async updateProduct({ commit }, { id, ...payload }) {
      try {
        const res = await axios.patch(`http://localhost:5050/products/${id}`, payload);
        await this.dispatch('getProducts');
        alert("Product updated successfully!");
        return res.data;
      } catch (error) {
        console.error("Failed to update product:", error);
        alert(error.response?.data?.error || "Failed to update product");
        throw error;
      }
    },
    
    async deleteProduct({ commit }, id) {
      try {
        await axios.delete(`http://localhost:5050/products/${id}`);
        await this.dispatch('getProducts');
        alert("Product deleted successfully!");
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert(error.response?.data?.error || "Failed to delete product");
        throw error;
      }
    },
    
    // Cart actions
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
      try {
        let { data } = await axios.post(`http://localhost:5050/login`, payload);

        if (!data?.token) {
          throw new Error(data?.message || "Login failed");
        }

        commit("SET_TOKEN", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
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
      commit("CLEAR_CART");
      delete axios.defaults.headers.common["Authorization"];
      alert("Logged out successfully!");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getToken: (state) => state.token,
    cartItems: (state) => state.cart,
    cartTotal: (state) => state.cart.reduce((sum, item) => sum + (item.product_price * item.cart_quantity), 0),
    cartCount: (state) => state.cart.reduce((count, item) => count + item.cart_quantity, 0),
  },
});

export default store;