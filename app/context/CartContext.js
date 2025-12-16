"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()

  // Încarcă coșul din baza de date pentru utilizatorii autentificați
  const loadCartFromDB = useCallback(async () => {
    if (status === "loading") return
    
    if (session?.user?.id) {
      setIsLoading(true)
      try {
        const response = await fetch("/api/cart")
        if (response.ok) {
          const data = await response.json()
          const dbItems = data.cart?.items?.map(item => ({
            id: item.productId,
            productId: item.productId,
            dbItemId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity
          })) || []
          setCartItems(dbItems)
        }
      } catch (error) {
        console.error("Error loading cart from DB:", error)
      } finally {
        setIsLoading(false)
        setIsLoaded(true)
      }
    } else {
      // Utilizator neautentificat - folosește localStorage
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
      setIsLoaded(true)
    }
  }, [session?.user?.id, status])

  // Încarcă coșul la montare și când se schimbă sesiunea
  useEffect(() => {
    loadCartFromDB()
  }, [loadCartFromDB])

  // Salvează în localStorage pentru utilizatorii neautentificați
  useEffect(() => {
    if (isLoaded && !session?.user?.id) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded, session?.user?.id])

  const addToCart = async (item) => {
    const itemKey = item.productId || item.id
    
    // OPTIMISTIC UI: Actualizare instant în UI
    setCartItems((prev) => {
      const existingItem = prev.find((i) => (i.productId || i.id) === itemKey)
      if (existingItem) {
        return prev.map((i) =>
          (i.productId || i.id) === itemKey ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, id: itemKey, productId: item.productId || item.id, quantity: 1 }]
    })
    
    if (session?.user?.id) {
      // Sincronizare cu DB în background
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId || item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          const dbItems = data.cart?.items?.map(dbItem => ({
            id: dbItem.productId,
            productId: dbItem.productId,
            dbItemId: dbItem.id,
            name: dbItem.name,
            price: dbItem.price,
            image: dbItem.image,
            quantity: dbItem.quantity
          })) || []
          setCartItems(dbItems)
        }
      } catch (error) {
        console.error("Error syncing cart to DB:", error)
        // Revert în caz de eroare - reîncarcă din DB
        loadCartFromDB()
      }
    }
  }

  const removeFromCart = async (itemId) => {
    // OPTIMISTIC UI: Șterge instant din UI
    const itemToRemove = cartItems.find(i => (i.productId || i.id) === itemId || i.dbItemId === itemId)
    setCartItems((prev) => prev.filter((item) => 
      (item.productId || item.id) !== itemId && item.dbItemId !== itemId
    ))
    
    if (session?.user?.id && itemToRemove?.dbItemId) {
      // Sincronizare cu DB în background
      try {
        const response = await fetch(`/api/cart?itemId=${itemToRemove.dbItemId}`, {
          method: "DELETE"
        })
        
        if (!response.ok) {
          // Revert în caz de eroare
          loadCartFromDB()
        }
      } catch (error) {
        console.error("Error removing from cart:", error)
        loadCartFromDB()
      }
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    // OPTIMISTIC UI: Actualizare instant în UI
    const itemToUpdate = cartItems.find(i => (i.productId || i.id) === itemId || i.dbItemId === itemId)
    setCartItems((prev) =>
      prev.map((item) =>
        (item.productId || item.id) === itemId || item.dbItemId === itemId 
          ? { ...item, quantity } 
          : item
      )
    )

    if (session?.user?.id && itemToUpdate?.dbItemId) {
      // Sincronizare cu DB în background
      try {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId: itemToUpdate.dbItemId,
            quantity
          })
        })
        
        if (!response.ok) {
          // Revert în caz de eroare
          loadCartFromDB()
        }
      } catch (error) {
        console.error("Error updating quantity:", error)
        loadCartFromDB()
      }
    }
  }

  const clearCart = async () => {
    // OPTIMISTIC UI: Golește instant
    setCartItems([])
    
    if (session?.user?.id) {
      try {
        await fetch("/api/cart?clearAll=true", {
          method: "DELETE"
        })
      } catch (error) {
        console.error("Error clearing cart:", error)
        loadCartFromDB()
      }
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  // Calculează taxa de livrare: gratis peste 20 EUR, altfel 4 EUR
  const DELIVERY_FEE = 4
  const FREE_DELIVERY_THRESHOLD = 20

  const getDeliveryFee = () => {
    const subtotal = getCartTotal()
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  }

  const getOrderTotal = () => {
    return getCartTotal() + getDeliveryFee()
  }

  const getAmountUntilFreeDelivery = () => {
    const subtotal = getCartTotal()
    if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
    return FREE_DELIVERY_THRESHOLD - subtotal
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        getDeliveryFee,
        getOrderTotal,
        getAmountUntilFreeDelivery,
        DELIVERY_FEE,
        FREE_DELIVERY_THRESHOLD,
        isLoading,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
