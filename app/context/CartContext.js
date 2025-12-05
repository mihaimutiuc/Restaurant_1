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
    if (session?.user?.id) {
      // Utilizator autentificat - salvează în DB
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId || item.id,  // Use numeric productId for DB, fallback to id
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
        console.error("Error adding to cart:", error)
      }
    } else {
      // Utilizator neautentificat - salvează local
      setCartItems((prev) => {
        const itemKey = item.productId || item.id
        const existingItem = prev.find((i) => (i.productId || i.id) === itemKey)
        if (existingItem) {
          return prev.map((i) =>
            (i.productId || i.id) === itemKey ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
        return [...prev, { ...item, id: itemKey, productId: item.productId, quantity: 1 }]
      })
    }
  }

  const removeFromCart = async (itemId) => {
    if (session?.user?.id) {
      const item = cartItems.find(i => (i.productId || i.id) === itemId || i.dbItemId === itemId)
      if (item?.dbItemId) {
        try {
          const response = await fetch(`/api/cart?itemId=${item.dbItemId}`, {
            method: "DELETE"
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
          console.error("Error removing from cart:", error)
        }
      }
    } else {
      setCartItems((prev) => prev.filter((item) => (item.productId || item.id) !== itemId))
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    if (session?.user?.id) {
      const item = cartItems.find(i => (i.productId || i.id) === itemId || i.dbItemId === itemId)
      if (item?.dbItemId) {
        try {
          const response = await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              itemId: item.dbItemId,
              quantity
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
          console.error("Error updating quantity:", error)
        }
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          (item.productId || item.id) === itemId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch("/api/cart?clearAll=true", {
          method: "DELETE"
        })
        
        if (response.ok) {
          setCartItems([])
        }
      } catch (error) {
        console.error("Error clearing cart:", error)
      }
    } else {
      setCartItems([])
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  // Calculează taxa de livrare: gratis peste 100 RON, altfel 20 RON
  const DELIVERY_FEE = 20
  const FREE_DELIVERY_THRESHOLD = 100

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
