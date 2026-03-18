"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { client } from "../sanity/client"; // <-- IMPORTED YOUR SANITY BRIDGE

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTypesOpen, setIsTypesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  // States for the Checkout Form
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
  
  // States for dynamic selections
  const [products, setProducts] = useState([]); 
  const [chosenSize, setChosenSize] = useState("");
  const [chosenColor, setChosenColor] = useState("");

  // Fetching data from Sanity
  useEffect(() => {
    async function fetchSanityProducts() {
      // UPDATED: Added currency to the GROQ query
      const query = `*[_type == "product"] {
        "id": _id,
        name,
        price,
        currency,
        "desc": description,
        "category": category->title, 
        sizes,
        colors,
        inStock, 
        "images": images[].asset->url,
        "img": coalesce(images[0].asset->url, "/cloth1.jpg") 
      }`;
      
      const sanityData = await client.fetch(query);
      setProducts(sanityData);
    }
    
    fetchSanityProducts();
  }, []);

  // Helper to show the correct currency symbol
  const getSymbol = (prod) => prod?.currency || "$";

  // <-- SMART LOGIC: Extract unique categories directly from Sanity products
  const dynamicCategories = [...new Set(products.map((product) => product.category).filter(Boolean))];

  const scrollToReviews = (e) => {
    e.preventDefault();
    setIsAboutOpen(false);
    setActiveCategory(null);
    setIsTypesOpen(false); // Close mobile menu if open
    const element = document.getElementById("reviews-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const whatsappNumber = "+923142482443"; 
  const whatsappMessage = "Hello Chikuu! I'm interested in your collection. May I know more about your products? ";

  const reviews = [
    { id: 1, name: "Sara K.", city: "Karachi", text: "The fabric quality is outstanding. It feels incredibly premium and fits perfectly!", stars: 5 },
    { id: 2, name: "Amna T.", city: "Lahore", text: "Received my order today. The Chikuu Signature piece is even better in person. 10/10!", stars: 5 },
    { id: 3, name: "Zainab R.", city: "Islamabad", text: "Fast shipping and elegant packaging. The designs are truly unique and modern.", stars: 5 },
  ];

  const addToCart = (product) => {
    const itemToAdd = {
      ...product,
      selectedSize: chosenSize || "Standard",
      selectedColor: chosenColor || "As Shown",
      cartId: Date.now() 
    };
    setCart([...cart, itemToAdd]);
    setSelectedProduct(null);
    setChosenSize(""); 
    setChosenColor("");
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  // Function to submit the final form to WhatsApp
  const handleFinalCheckout = (e) => {
    e.preventDefault();
    
    // UPDATED: Now includes database currency symbol in WhatsApp order
    const orderDetails = cart.map((item) => `• ${item.name} (${item.selectedSize} / ${item.selectedColor}) - ${getSymbol(item)}${item.price}`).join("%0A");
    
    const customerInfo = `*Customer Details:*%0A👤 Login/Name: ${formData.name}%0A✉️ Email: ${formData.email}%0A📞 Phone: ${formData.phone}%0A🏠 Address: ${formData.address}%0A📄 Agreed to send bill on WhatsApp: Yes`;
    
    const fullMessage = `*New Verified Order from Chikuu Store*%0A%0A${customerInfo}%0A%0A*Order Details:*%0A${orderDetails}%0A%0A*Total Amount:* ${getSymbol(cart[0])}${cartTotal}.00`;
    
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${fullMessage}`, "_blank");
    
    setIsCheckoutOpen(false);
    setCart([]);
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans relative">
      
      {/* 1. FIXED NAVIGATION BAR - MODIFIED FOR MOBILE ACCESSIBILITY */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center py-2 px-4 md:py-3 md:px-8 border-b border-gray-100 bg-white/90 backdrop-blur-md z-[150]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          onClick={() => { setActiveCategory(null); setIsAboutOpen(false); setIsTypesOpen(false); }}
          className="cursor-pointer"
        >
          <img 
            src="/logo.png" 
            alt="Chikuu Logo" 
            className="h-12 md:h-20 w-auto object-contain" 
          />
        </motion.div>
        
        <div className="flex items-center space-x-4 md:space-x-12">
          {/* Desktop Links - ALIGNMENT FIXED HERE */}
          <div className="hidden md:flex items-center space-x-12 text-lg font-bold tracking-wide">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsAboutOpen(true); setActiveCategory(null); }} className="hover:text-[#C5A059] transition-colors uppercase cursor-pointer">About</a>
            <div className="relative flex items-center">
              <button onClick={() => setIsTypesOpen(!isTypesOpen)} className="hover:text-[#C5A059] transition-colors uppercase flex items-center gap-2">Types {isTypesOpen ? "▴" : "▾"}</button>
              <AnimatePresence>
                {isTypesOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-4 bg-white shadow-2xl rounded-2xl p-6 w-56 border border-gray-100 flex flex-col gap-4 z-[160]">
                    {dynamicCategories.map((cat) => (
                      <button key={cat} onClick={() => { setActiveCategory(cat); setIsTypesOpen(false); setIsAboutOpen(false); }} className="text-left hover:text-[#C5A059] transition-colors py-1 border-b border-gray-50 last:border-0 uppercase text-sm tracking-widest">{cat}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a href="#reviews-section" onClick={scrollToReviews} className="hover:text-[#C5A059] transition-colors uppercase cursor-pointer">Reviews</a>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <button onClick={() => setIsTypesOpen(!isTypesOpen)} className="md:hidden text-[10px] font-bold border border-black px-3 py-1 rounded-full uppercase tracking-tighter">
            {isTypesOpen ? "Close ✕" : "Menu ☰"}
          </button>

          <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:scale-110 transition-transform flex items-center">
            <span className="text-xl md:text-2xl">👜</span>
            {cart.length > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-0 right-0 bg-[#C5A059] text-white text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </motion.span>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isTypesOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 flex flex-col p-6 gap-4 z-[140] shadow-xl">
              <button onClick={() => {setIsAboutOpen(true); setIsTypesOpen(false); setActiveCategory(null);}} className="text-left font-bold uppercase text-sm">About</button>
              <div className="flex flex-col gap-3 pl-4 border-l-2 border-[#C5A059]">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Categories</p>
                {dynamicCategories.map((cat) => (
                  <button key={cat} onClick={() => { setActiveCategory(cat); setIsTypesOpen(false); setIsAboutOpen(false); }} className="text-left text-xs uppercase font-medium">{cat}</button>
                ))}
              </div>
              <button onClick={(e) => scrollToReviews(e)} className="text-left font-bold uppercase text-sm">Reviews</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <div className="h-[70px] md:h-[105px]"></div>

      {/* ABOUT PAGE FULL SCREEN VIEW */}
      <AnimatePresence>
        {isAboutOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "-100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[140] overflow-y-auto"
          >
            <div className="fixed bottom-8 right-8 z-[150]">
              <motion.button 
                onClick={() => setIsAboutOpen(false)} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                transition={{ type: "tween", duration: 0.1 }} 
                className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl border border-[#C5A059] flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-[#C5A059] rounded-full"></span>← BACK
              </motion.button>
            </div>

            <div className="p-8 md:p-16 max-w-7xl mx-auto mt-[100px] md:mt-[130px]">
              <h2 className="text-3xl md:text-6xl font-extrabold uppercase mb-8 md:mb-16 tracking-tighter border-l-8 border-[#C5A059] pl-6">
                About Chikuu
              </h2>
              <div className="text-base md:text-xl text-gray-600 leading-relaxed max-w-3xl space-y-6 md:space-y-8">
                <p>
                  Welcome to <span className="font-bold text-black uppercase">Chikuu</span>, your premier destination for luxury women's fashion in Karachi, Pakistan.
                </p>
                <p>
                  Founded with a passion for elegance and comfort, our collections range from delicate Shafoon evening wear to breathable everyday Cotton essentials. We believe in providing premium quality fabrics paired with modern, sophisticated designs that elevate your everyday style.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CATEGORY FULL SCREEN VIEW - UPDATED FOR STAGGERED ANIMATIONS */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[140] overflow-y-auto"
          >
            <div className="fixed bottom-8 right-8 z-[150]">
              <motion.button 
                onClick={() => setActiveCategory(null)} 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                transition={{ type: "tween", duration: 0.1 }} 
                className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl border border-[#C5A059] flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-[#C5A059] rounded-full"></span>← BACK
              </motion.button>
            </div>

            <div className="p-4 md:p-16 max-w-7xl mx-auto mt-[80px] md:mt-[130px]">
              <h2 className="text-3xl md:text-6xl font-extrabold uppercase mb-8 md:mb-16 tracking-tighter border-l-8 border-[#C5A059] pl-6">
                {activeCategory}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-12">
                {products.filter((product) => product.category === activeCategory).map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedProduct(product)} 
                    className="group cursor-pointer relative"
                  >
                    {product.inStock === false && (
                       <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-500 text-white text-[8px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full z-10 uppercase shadow-md">Sold Out</div>
                    )}
                    <div className="w-full h-[200px] md:h-[400px] bg-gray-100 mb-2 md:mb-4 overflow-hidden rounded-xl md:rounded-3xl shadow-sm">
                      <img src={product.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <h4 className="text-xs md:text-xl font-bold uppercase tracking-wide truncate">{product.name}</h4>
                    {/* UPDATED: Dynamic Currency Symbol */}
                    <p className="text-[#C5A059] text-xs md:text-base font-semibold">{getSymbol(product)}{product.price}.00</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN HOME CONTENT */}
      {!activeCategory && !isAboutOpen && (
        <>
          <section className="flex flex-col items-center justify-center text-center mt-12 md:mt-24 px-6 mb-16 md:mb-32">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              whileHover={{ scale: 1.08, color: "#C5A059" }}
              transition={{ duration: 0.8 }} 
              className="text-4xl md:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 uppercase cursor-default"
            >
              Elevate <br className="md:hidden" /> Life <br className="md:hidden" /> Everyday
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-sm md:text-xl text-gray-500 mb-8 md:mb-10 max-w-xl">Premium fashion designed for elegance and comfort</motion.p>
            
            <motion.button 
              onClick={() => setIsTypesOpen(true)} 
              whileHover={{ scale: 1.05, backgroundColor: "#000000" }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto bg-[#C5A059] text-white px-12 py-4 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg transition-colors duration-300"
            >
              View Categories
            </motion.button>
          </section>

          {/* MAIN GRID - UPDATED FOR STAGGERED MOBILE ANIMATIONS */}
          <section className="px-4 md:px-8 pb-20 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-12">
            {products.map((product, index) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.1 }} 
                transition={{ 
                  duration: 0.5, 
                  delay: (index % 2) * 0.1, // Staggers items left-to-right on mobile
                  ease: "easeOut"
                }}
                onClick={() => setSelectedProduct(product)} 
                className="group cursor-pointer relative"
              >
                 {product.inStock === false && (
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-500 text-white text-[8px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full z-10 uppercase shadow-md">Sold Out</div>
                 )}
                <div className="w-full h-[200px] md:h-[400px] bg-gray-100 mb-2 md:mb-4 overflow-hidden rounded-xl md:rounded-2xl shadow-sm">
                  <img src={product.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="text-xs md:text-xl font-bold uppercase tracking-wide truncate">{product.name}</h4>
                {/* UPDATED: Dynamic Currency Symbol */}
                <p className="text-[#C5A059] text-xs md:text-base font-semibold">{getSymbol(product)}{product.price}.00</p>
              </motion.div>
            ))}
          </section>

          <section id="reviews-section" className="bg-gray-50 py-16 md:py-24 px-6 border-t border-gray-100">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-xl md:text-3xl font-bold text-center mb-10 md:mb-16 uppercase tracking-widest">Client Reviews</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
                {reviews.map((review, index) => (
                  <motion.div 
                    key={review.id} 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }} 
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-center mb-4 text-[#C5A059]">{"★".repeat(review.stars)}</div>
                    <p className="italic text-xs md:text-base text-gray-600 mb-4 md:mb-6">"{review.text}"</p>
                    <p className="font-bold uppercase text-[10px] md:text-sm">{review.name} — {review.city}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* FLOATING BUTTONS */}
      <div className="fixed bottom-20 md:bottom-24 right-4 md:right-8 z-[100]">
        <motion.a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: "tween", duration: 0.1 }} className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-white cursor-pointer">
          <svg width="20" height="20" className="md:w-[25px] md:h-[25px]" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.973L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
        </motion.a>
      </div>

      {/* SHARED PRODUCT DETAIL PANEL & CART */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="fixed inset-0 bg-black/40 z-[200] backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white z-[210] p-6 md:p-10 shadow-2xl overflow-y-auto">
              <button onClick={() => setSelectedProduct(null)} className="mb-6 font-bold text-xs hover:text-[#C5A059]">← CLOSE</button>
              
              <div className="flex flex-col gap-4 mb-6">
                <img src={selectedProduct.img} className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-md" />
                <div className="flex gap-2 overflow-x-auto pb-2">
                   {selectedProduct.images?.map((image, idx) => (
                     <img key={idx} src={image} className="w-16 h-16 object-cover rounded-lg cursor-pointer border hover:border-[#C5A059]" onClick={() => setSelectedProduct({...selectedProduct, img: image})} />
                   ))}
                </div>
              </div>

              <h2 className="text-xl md:text-3xl font-bold mb-2 uppercase">{selectedProduct.name}</h2>
              {/* UPDATED: Dynamic Currency Symbol */}
              <p className="text-[#C5A059] text-lg md:text-2xl font-bold mb-4">{getSymbol(selectedProduct)}{selectedProduct.price}.00</p>
              
              {selectedProduct.sizes && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold uppercase mb-2 text-gray-400 tracking-widest">Select Size:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button 
                        key={size} 
                        onClick={() => setChosenSize(size)}
                        className={`border px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all uppercase ${chosenSize === size ? "bg-black text-white border-black" : "border-gray-200 text-black hover:border-[#C5A059]"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SMART LOGIC: Only show color section if colors exist in DB */}
              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-bold uppercase mb-3 text-gray-400 tracking-widest">Select Color:</h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedProduct.colors.map((color) => (
                      <div key={color} className="flex flex-col items-center gap-1">
                        <button 
                          onClick={() => setChosenColor(color)}
                          style={{ backgroundColor: color.toLowerCase().replace(/\s/g, '') }}
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-all shadow-sm ${
                            chosenColor === color ? "border-black scale-110 ring-2 ring-offset-2 ring-gray-200" : "border-transparent"
                          }`}
                          title={color}
                        />
                        <span className="text-[8px] uppercase font-bold text-gray-400 mt-1">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-500 mb-8 leading-relaxed text-xs md:text-sm">{selectedProduct.desc}</p>
              
              {selectedProduct.inStock === false ? (
                <div className="flex flex-col gap-2">
                  <button disabled className="w-full bg-gray-200 text-gray-400 py-4 md:py-5 rounded-full font-bold tracking-widest uppercase cursor-not-allowed border border-gray-300 text-xs md:text-sm">
                    OUT OF STOCK
                  </button>
                </div>
              ) : (
                <button onClick={() => addToCart(selectedProduct)} className="w-full bg-black text-white py-4 md:py-5 rounded-full font-bold tracking-widest uppercase shadow-lg hover:bg-[#C5A059] transition-colors duration-200 text-xs md:text-sm">
                  ADD TO CART
                </button>
              )}

            </motion.div>
          </>
        )}

        {/* SHOPPING CART PANEL */}
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/40 z-[200] backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-[#f9f9f9] z-[210] p-6 md:p-10 shadow-2xl flex flex-col">
              <button onClick={() => setIsCartOpen(false)} className="mb-6 font-bold text-xs text-left hover:text-[#C5A059]">← SHOPPING</button>
              <h2 className="text-lg md:text-2xl font-bold mb-6 uppercase">Your Bag ({cart.length})</h2>
              <div className="flex-1 overflow-y-auto space-y-4">
                {cart.length === 0 ? <p className="text-gray-400 text-sm">Your bag is empty.</p> : cart.map((item) => (
                  <motion.div layout key={item.cartId} className="flex gap-4 bg-white p-3 rounded-xl shadow-sm relative group items-center">
                    <img src={item.img} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[10px] md:text-xs uppercase tracking-tighter">{item.name}</h4>
                      {/* UPDATED: Dynamic Currency Symbol */}
                      <p className="text-[#C5A059] text-[10px] md:text-xs font-bold">{getSymbol(item)}{item.price}.00</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-gray-400 font-bold uppercase">{item.selectedSize}</span>
                        <div className="w-2.5 h-2.5 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: item.selectedColor.toLowerCase().replace(/\s/g, '') }} />
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-gray-300 hover:text-red-500 font-bold px-2 transition-colors">✕</button>
                  </motion.div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-6 mt-auto">
                <div className="flex justify-between text-base md:text-lg font-bold mb-4">
                  <span>Total</span>
                  {/* UPDATED: Uses the symbol from the first item in cart for the total */}
                  <span>{getSymbol(cart[0])}{cartTotal}.00</span>
                </div>
                <button 
                  onClick={() => {
                    if (cart.length === 0) return alert("Your bag is empty!");
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }} 
                  className="w-full bg-[#C5A059] text-white py-4 rounded-full font-bold shadow-lg hover:bg-black transition-colors duration-200 uppercase tracking-widest text-xs md:text-sm"
                >
                  CHECKOUT NOW
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* CHECKOUT DATA FORM PANEL */}
        {isCheckoutOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCheckoutOpen(false)} className="fixed inset-0 bg-black/40 z-[220] backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white z-[230] p-6 md:p-10 shadow-2xl overflow-y-auto">
              <button onClick={() => { setIsCheckoutOpen(false); setIsCartOpen(true); }} className="mb-6 font-bold text-xs text-left hover:text-[#C5A059]">← BACK</button>
              <h2 className="text-lg md:text-2xl font-bold mb-6 uppercase">Delivery Details</h2>
              
              <form onSubmit={handleFinalCheckout} className="space-y-4">
                <input required type="text" placeholder="Full Name" className="w-full p-3 border border-gray-200 rounded-lg text-xs md:text-sm focus:border-[#C5A059] outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <input required type="email" placeholder="Email Address" className="w-full p-3 border border-gray-100 rounded-lg text-xs md:text-sm focus:border-[#C5A059] outline-none" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input required type="tel" placeholder="Phone Number" className="w-full p-3 border border-gray-200 rounded-lg text-xs md:text-sm focus:border-[#C5A059] outline-none" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                <textarea required placeholder="Delivery Address" className="w-full p-3 border border-gray-200 rounded-lg h-24 text-xs md:text-sm focus:border-[#C5A059] outline-none resize-none" onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3 mt-4">
                  <input required type="checkbox" id="billAgreement" className="mt-1 w-3.5 h-3.5 cursor-pointer accent-[#C5A059]" />
                  <label htmlFor="billAgreement" className="text-[10px] text-gray-600 font-medium cursor-pointer leading-relaxed">
                    I agree to send a picture of my electricity bill on WhatsApp to verify my address.
                  </label>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100">
                  <button type="submit" className="w-full bg-black text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#C5A059] transition-colors duration-200 uppercase tracking-widest text-xs">SUBMIT TO WHATSAPP</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="bg-gray-50 py-10 px-6 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">© 2026 CHIKUU CLOTHING LTD. KARACHI, PAKISTAN</p>
      </footer>
    </main>
  );
}