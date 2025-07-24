// @/stores/cartStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// --- Product Interface (Aligned with Product.vue) ---
export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image?: string;
  image1?: string;
  image2?: string;
  media?: string[];
  price: number; // Original base price from product table (cost price)
  stock: number; // Total available stock for the product
  store_id: number;
  created_at: string;
  updated_at: string;
  quantityToAdd: number; // Quantity chosen on the product card
  baseSellingPriceFromStock: number; // Price from stock table for display on product card
  cashierInputSellingPrice: number; // Price entered/adjusted by cashier on product card
  stock_id: number | null; // The specific stock record ID
}

// --- CartItem Interface ---
export interface CartItem {
  product: Product; // The full product object
  quantity: number; // Quantity of this product in the cart
  priceAtSale: number; // The selling price recorded when added to cart
  stockRecordIdAtSale: number | null; // The specific stock record ID associated with this cart item
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<CartItem[]>([]);

  // --- Getters ---
  const cartTotal = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity * item.priceAtSale, 0);
  });

  const totalQuantityInCart = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0);
  });

  // --- Actions ---

  /**
   * Adds a product to the cart or updates its quantity if already present.
   * @param product The product to add.
   * @param quantity The quantity to add.
   * @param sellingPrice The selling price determined at the time of adding.
   * @param stockId The stock record ID associated with this product.
   */
  function addToCart(product: Product, quantity: number, sellingPrice: number, stockId: number | null) {
    // Attempt to find an existing item with the same product ID AND the same stockRecordIdAtSale
    // This is important if different batches of the same product have different selling prices or stock IDs
    const existingItem = cartItems.value.find(
      (item) => item.product.id === product.id && item.stockRecordIdAtSale === stockId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      // If the price could change when adding more, you might update it here.
      // For now, we'll assume the priceAtSale for an existing item doesn't change unless explicitly modified.
      // existingItem.priceAtSale = sellingPrice; // Uncomment if adding more changes the effective price
    } else {
      cartItems.value.push({
        product: product,
        quantity: quantity,
        priceAtSale: sellingPrice, // Store the price specified at the moment of adding to cart
        stockRecordIdAtSale: stockId,
      });
    }
  }

  function incrementQuantity(item: CartItem) {
    item.quantity++;
  }

  function decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      removeFromCart(item);
    }
  }

  function removeFromCart(itemToRemove: CartItem) {
    cartItems.value = cartItems.value.filter(item =>
      !(item.product.id === itemToRemove.product.id && item.stockRecordIdAtSale === itemToRemove.stockRecordIdAtSale)
    );
  }

  function clearCart() {
    cartItems.value = [];
  }

  // A helper action to replace cart items (useful after partial checkout)
  function setCartItems(items: CartItem[]) {
    cartItems.value = items;
  }

  return {
    cartItems,
    cartTotal,
    totalQuantityInCart,
    addToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    setCartItems,
  };
});