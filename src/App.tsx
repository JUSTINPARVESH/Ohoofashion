import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Trash2, Plus, Minus, ChevronRight, LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Star, TrendingUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore, useAuthStore, Product } from './store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const { items } = useCartStore();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-serif font-bold tracking-tighter">OHOO FASHION</Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-bold tracking-widest uppercase">
            <Link to="/shop?category=Men" className="hover:text-zinc-500 transition-colors">Men</Link>
            <Link to="/shop?category=Kids" className="hover:text-zinc-500 transition-colors">Kids</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/shop" className="hover:text-zinc-500 transition-colors"><Search size={20} /></Link>
          <Link to="/cart" className="relative hover:text-zinc-500 transition-colors">
            <ShoppingCart size={20} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </Link>
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'admin' ? '/admin' : '/orders'} className="hover:text-zinc-500 transition-colors">
                  <User size={20} />
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="text-xs font-bold uppercase tracking-widest hover:text-red-500">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="text-xs font-bold uppercase tracking-widest hover:text-zinc-500">Login</Link>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(true)}><Menu size={24} /></button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 bg-white z-[60] p-8 flex flex-col"
          >
            <div className="flex justify-end mb-12">
              <button onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8 text-3xl font-serif">
              <Link to="/shop?category=Men" onClick={() => setIsMenuOpen(false)}>Men</Link>
              <Link to="/shop?category=Kids" onClick={() => setIsMenuOpen(false)}>Kids</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop All</Link>
              <hr className="border-zinc-100" />
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/orders'} onClick={() => setIsMenuOpen(false)}>My Account</Link>
                  <button onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }} className="text-left text-red-500">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login / Register</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-zinc-900 text-white py-20 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <h2 className="text-3xl font-serif font-bold mb-6">OHOO FASHION</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Redefining modern elegance with sustainable practices and timeless designs. Join our journey in crafting the future of fashion.
        </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-400 transition-colors">Instagram</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Facebook</a>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Shop</h3>
        <ul className="flex flex-col gap-4 text-zinc-400 text-sm">
          <li><Link to="/shop?category=Men">Men</Link></li>
          <li><Link to="/shop?category=Kids">Kids</Link></li>
          <li><Link to="/shop">New Arrivals</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Contact</h3>
        <ul className="flex flex-col gap-4 text-zinc-400 text-sm">
          <li>support@ohoofashion.com</li>
          <li>+1 (555) 000-1234</li>
          <li>123 Fashion Ave, NY</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-widest flex justify-between">
      <span>© 2026 Ohoo Fashion. All rights reserved.</span>
      <span>Privacy Policy | Terms of Service</span>
    </div>
  </footer>
);

const ProductCard = ({ product }: { product: Product, key?: any }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="group cursor-pointer"
  >
    <Link to={`/product/${product.id}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-4">
        <img
          src={product.images[0] || 'https://picsum.photos/seed/fashion/600/800'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {product.is_new ? (
          <span className="absolute top-4 left-4 bg-white text-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">New</span>
        ) : null}
        {product.is_trending ? (
          <span className="absolute top-4 right-4 bg-zinc-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Trending</span>
        ) : null}
      </div>
      <h3 className="text-sm font-medium mb-1">{product.name}</h3>
      <p className="text-zinc-500 text-sm">${(product.price || 0).toFixed(2)}</p>
    </Link>
  </motion.div>
);

// --- Pages ---

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, setRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/settings')
        ]);
        const prodData = await prodRes.json();
        const setData = await setRes.json();
        setProducts(prodData);
        setSettings(setData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const featured = products.filter(p => p.is_featured).slice(0, 4);
  const newArrivals = products.filter(p => p.is_new).slice(0, 4);
  const trending = products.filter(p => p.is_trending).slice(0, 4);
  const videoProduct = products.find(p => p.video);

  return (
    <div className="pt-0">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2070"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.4em] mb-6"
          >
            {settings.hero_banner_text || 'Premium Collection 2026'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif font-bold mb-10 tracking-tighter"
          >
            The Art of <br /> Dressing Well
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/shop" className="bg-white text-zinc-900 px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-zinc-100 transition-colors">
              Shop Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Curated for you</p>
            <h2 className="text-4xl font-serif font-bold">Featured Pieces</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-widest border-b border-zinc-900 pb-1">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {featured.length > 0 ? featured.map(p => <ProductCard key={p.id} product={p} />) : (
            <div className="col-span-full text-center py-20 text-zinc-400">No featured products yet.</div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-6 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Just in</p>
              <h2 className="text-4xl font-serif font-bold">New Arrivals</h2>
            </div>
            <Link to="/shop?type=new" className="text-xs font-bold uppercase tracking-widest border-b border-zinc-900 pb-1">Explore</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {newArrivals.length > 0 ? newArrivals.map(p => <ProductCard key={p.id} product={p} />) : (
              <div className="col-span-full text-center py-20 text-zinc-400">Check back soon for new arrivals.</div>
            )}
          </div>
        </div>
      </section>

      {/* Video Section */}
      {videoProduct && (
        <section className="relative h-[70vh] w-full overflow-hidden">
          <video
            src={videoProduct.video}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-6">
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 italic">Elegance in Motion</h2>
            <Link to={`/product/${videoProduct.id}`} className="text-xs font-bold uppercase tracking-widest border-b border-white pb-1">Shop the look</Link>
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Popular now</p>
            <h2 className="text-4xl font-serif font-bold">Trending Now</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trending.length > 0 ? trending.map(p => <ProductCard key={p.id} product={p} />) : (
            <div className="col-span-full text-center py-20 text-zinc-400">Trending items will appear here.</div>
          )}
        </div>
      </section>
    </div>
  );
};

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState(1000);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get('category');
  const subcategoryId = queryParams.get('subcategory_id');
  const type = queryParams.get('type');

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (category) {
        const res = await fetch(`/api/subcategories?category=${category}`);
        const data = await res.json();
        setSubcategories(data);
      } else {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (subcategoryId) params.append('subcategory_id', subcategoryId);
        if (type) params.append('type', type);
        if (search) params.append('search', search);
        params.append('maxPrice', priceRange.toString());

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, subcategoryId, type, search, priceRange]);

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-32 space-y-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find something..."
                  className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-zinc-900"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute right-0 top-2 text-zinc-400" size={16} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Price Range</h3>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                className="w-full accent-zinc-900"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-[10px] font-bold mt-2">
                <span>$0</span>
                <span>${priceRange}</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Categories</h3>
              <div className="flex flex-col gap-4 text-sm">
                <Link to="/shop" className={cn("hover:text-zinc-500", !category && "font-bold underline underline-offset-8")}>All Collections</Link>
                <Link to="/shop?category=Men" className={cn("hover:text-zinc-500", category === 'Men' && !subcategoryId && "font-bold underline underline-offset-8")}>Men</Link>
                <Link to="/shop?category=Kids" className={cn("hover:text-zinc-500", category === 'Kids' && !subcategoryId && "font-bold underline underline-offset-8")}>Kids</Link>
              </div>
            </div>

            {subcategories.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Subcategories</h3>
                <div className="flex flex-col gap-4 text-sm">
                  {subcategories.map(sub => (
                    <Link 
                      key={sub.id} 
                      to={`/shop?category=${category}&subcategory_id=${sub.id}`} 
                      className={cn("hover:text-zinc-500", subcategoryId === sub.id.toString() && "font-bold underline underline-offset-8")}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-3xl font-serif font-bold">
              {category ? `${category} Collection` : type === 'new' ? 'New Arrivals' : 'All Products'}
              {subcategoryId && subcategories.find(s => s.id.toString() === subcategoryId) && ` - ${subcategories.find(s => s.id.toString() === subcategoryId).name}`}
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{products.length} Items</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-100 mb-4" />
                  <div className="h-4 bg-zinc-100 w-3/4 mb-2" />
                  <div className="h-4 bg-zinc-100 w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-40">
              <p className="text-zinc-400 mb-6 italic">No products found matching your criteria.</p>
              <button onClick={() => { setSearch(''); setPriceRange(1000); }} className="text-xs font-bold uppercase tracking-widest border-b border-zinc-900 pb-1">Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Images & Video */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-zinc-100 overflow-hidden relative">
            <img
              src={product.images[activeImage] || 'https://picsum.photos/seed/fashion/800/1200'}
              className="w-full h-full object-cover"
              alt={product.name}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {(product.images || []).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "aspect-square bg-zinc-100 overflow-hidden border-2 transition-all",
                  activeImage === idx ? "border-zinc-900" : "border-transparent"
                )}
              >
                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
          {product.video && (
            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Product Video</h3>
              <video src={product.video} controls className="w-full aspect-video bg-black" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
              {product.category} {product.subcategory_name && `• ${product.subcategory_name}`}
            </p>
            <h1 className="text-4xl font-serif font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-2xl text-zinc-900">${(product.price || 0).toFixed(2)}</p>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-1",
                product.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Description</h3>
            <p className="text-zinc-600 leading-relaxed">{product.description}</p>
          </div>

          {Object.keys(product.attributes || {}).length > 0 && (
            <div className="mb-12">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{key}</p>
                    <p className="text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest">Select Size</h3>
              </div>
              <div className="flex gap-4 flex-wrap">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-12 h-12 px-4 flex items-center justify-center text-xs font-bold border transition-all",
                      selectedSize === size ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 hover:border-zinc-900"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto space-y-4">
            <button
              onClick={() => { addItem(product, selectedSize); navigate('/cart'); }}
              disabled={product.stock === 0 || ((product.sizes || []).length > 0 && !selectedSize)}
              className="w-full bg-zinc-900 text-white py-5 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:bg-zinc-300"
            >
              {product.stock > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}
            </button>
            <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest">Free shipping on orders over $150</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-16">Shopping Bag</h1>

      {items.length === 0 ? (
        <div className="text-center py-40">
          <p className="text-zinc-400 mb-8 italic">Your shopping bag is empty.</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-6 pb-8 border-b border-zinc-100">
                <div className="w-32 aspect-[3/4] bg-zinc-100 shrink-0">
                  <img src={item.images?.[0] || 'https://picsum.photos/seed/fashion/300/400'} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="font-medium">${((item.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Size: {item.size}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-zinc-200">
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="p-2 hover:bg-zinc-50"><Minus size={14} /></button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="p-2 hover:bg-zinc-50"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id, item.size)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-zinc-50 p-8 sticky top-32">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-8">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span>${(total() || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Shipping</span>
                  <span>{total() > 150 ? 'FREE' : '$15.00'}</span>
                </div>
                <div className="pt-4 border-t border-zinc-200 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${((total() || 0) + (total() > 150 ? 0 : 15)).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full btn-primary py-4">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage = () => {
  const { items, total, clearCart } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ address: '', city: '', zip: '' });
  const [loading, setLoading] = useState(false);

  if (items.length === 0) return <div className="pt-32 text-center">Your cart is empty</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return navigate('/login');
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items,
          total: total() + (total() > 150 ? 0 : 15),
          ...formData
        })
      });
      if (res.ok) {
        clearCart();
        navigate('/orders');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-16">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest">Shipping Information</h3>
          <div className="grid grid-cols-1 gap-6">
            <input
              required
              type="text"
              placeholder="Shipping Address"
              className="w-full border-b border-zinc-200 py-3 focus:outline-none focus:border-zinc-900"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-6">
              <input
                required
                type="text"
                placeholder="City"
                className="w-full border-b border-zinc-200 py-3 focus:outline-none focus:border-zinc-900"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
              <input
                required
                type="text"
                placeholder="ZIP Code"
                className="w-full border-b border-zinc-200 py-3 focus:outline-none focus:border-zinc-900"
                value={formData.zip}
                onChange={e => setFormData({ ...formData, zip: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest">Payment</h3>
          <p className="text-sm text-zinc-500 italic">This is a demo. No actual payment will be processed. Cash on delivery is assumed.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-5 disabled:bg-zinc-300"
        >
          {loading ? 'Processing...' : `Place Order • $${((total() || 0) + (total() > 150 ? 0 : 15)).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, data.token);
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-md mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-12 text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {!isLogin && (
          <input
            required
            type="text"
            placeholder="Full Name"
            className="w-full border-b border-zinc-200 py-3 focus:outline-none focus:border-zinc-900"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        )}
        <input
          required
          type="email"
          placeholder="Email Address"
          className="w-full border-b border-zinc-200 py-3 focus:outline-none focus:border-zinc-900"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full border-b border-zinc-200 py-3 focus:outline-none focus:border-zinc-900"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
        />
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        <button type="submit" className="w-full btn-primary py-4">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <div className="mt-12 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    };
    if (token) fetchOrders();
  }, [token]);

  return (
    <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-serif font-bold mb-16">Order History</h1>
      <div className="space-y-12">
        {orders.length === 0 ? (
          <p className="text-zinc-400 italic">No orders found.</p>
        ) : orders.map(order => (
          <div key={order.id} className="border border-zinc-100 p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b border-zinc-100">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Order ID</p>
                <p className="text-sm font-bold">#OHOO-{order.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Date</p>
                <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Status</p>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-3 py-1",
                  order.status === 'Delivered' ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-700"
                )}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Total</p>
                <p className="text-sm font-bold">${(order.total || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="space-y-6">
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-zinc-100 shrink-0">
                    <img src={item.images?.[0] || 'https://picsum.photos/seed/fashion/100/120'} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Size: {item.size} • Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Admin Components ---

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    useEffect(() => navigate('/login'), []);
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-64 bg-zinc-900 text-white p-8 hidden lg:block">
        <h2 className="text-xl font-serif font-bold mb-12 tracking-tighter">OHOO ADMIN</h2>
        <nav className="space-y-8">
          <Link to="/admin" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/products" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <Package size={18} /> Products
          </Link>
          <Link to="/admin/subcategories" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <Menu size={18} /> Subcategories
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <ShoppingBag size={18} /> Orders
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <Settings size={18} /> Settings
          </Link>
          <button onClick={() => navigate('/')} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors pt-12 border-t border-zinc-800 w-full">
            <LogOut size={18} /> Exit Admin
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-serif font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 shadow-sm border border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Total Products</p>
          <p className="text-4xl font-serif font-bold">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-8 shadow-sm border border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Total Orders</p>
          <p className="text-4xl font-serif font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-8 shadow-sm border border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Daily Sales</p>
          <p className="text-4xl font-serif font-bold">${(stats.dailySales || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-8 shadow-sm border border-zinc-100">
        <div className="flex items-center gap-4 mb-8">
          <Zap className="text-amber-500" size={20} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Low Stock Alerts</h3>
        </div>
        {(!stats.lowStock || stats.lowStock.length === 0) ? (
          <p className="text-zinc-400 text-sm italic">All items are well stocked.</p>
        ) : (
          <div className="space-y-4">
            {stats.lowStock.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <span>{p.name}</span>
                <span className="font-bold text-red-500">{p.stock} left</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { token } = useAuthStore();

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const fetchSubcategories = async () => {
    const res = await fetch('/api/subcategories');
    const data = await res.json();
    setSubcategories(data);
  };

  useEffect(() => { 
    fetchProducts(); 
    fetchSubcategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct.id ? 'PUT' : 'POST';
    const url = editingProduct.id ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editingProduct)
    });

    if (res.ok) {
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchProducts();
  };

  const addAttribute = () => {
    const key = prompt('Attribute name (e.g. Color, Material)');
    if (key) {
      setEditingProduct({
        ...editingProduct,
        attributes: { ...editingProduct.attributes, [key]: '' }
      });
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold">Products</h1>
        <button
          onClick={() => setEditingProduct({ name: '', description: '', price: 0, category: 'Men', subcategory_id: '', images: [], video: '', stock: 0, sizes: [], attributes: {}, is_new: false, is_trending: false, is_featured: false })}
          className="btn-primary"
        >
          Add Product
        </button>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-8">{editingProduct.id ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Name</label>
                  <input required type="text" className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price</label>
                  <input required type="number" step="0.01" className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description</label>
                <textarea className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900 h-24" value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</label>
                  <select className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                    <option value="Men">Men</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Subcategory</label>
                  <select className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingProduct.subcategory_id} onChange={e => setEditingProduct({ ...editingProduct, subcategory_id: e.target.value })}>
                    <option value="">None</option>
                    {subcategories.filter(s => s.category === editingProduct.category).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Stock</label>
                  <input required type="number" className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sizes (comma separated)</label>
                <input type="text" className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={(editingProduct.sizes || []).join(', ')} onChange={e => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Custom Attributes</label>
                  <button type="button" onClick={addAttribute} className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 underline">Add Attribute</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(editingProduct.attributes || {}).map(([key, value]) => (
                    <div key={key} className="flex gap-2 items-center">
                      <span className="text-xs font-bold w-24 shrink-0">{key}:</span>
                      <input 
                        type="text" 
                        className="flex-1 border border-zinc-200 p-2 text-sm focus:outline-none focus:border-zinc-900" 
                        value={value as string} 
                        onChange={e => setEditingProduct({ ...editingProduct, attributes: { ...editingProduct.attributes, [key]: e.target.value } })}
                      />
                      <button type="button" onClick={() => {
                        const newAttrs = { ...editingProduct.attributes };
                        delete newAttrs[key];
                        setEditingProduct({ ...editingProduct, attributes: newAttrs });
                      }} className="text-red-500"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Image URLs (comma separated)</label>
                <input type="text" className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={(editingProduct.images || []).join(', ')} onChange={e => setEditingProduct({ ...editingProduct, images: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Video URL</label>
                <input type="text" className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingProduct.video} onChange={e => setEditingProduct({ ...editingProduct, video: e.target.value })} />
              </div>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <input type="checkbox" checked={editingProduct.is_new} onChange={e => setEditingProduct({ ...editingProduct, is_new: e.target.checked })} /> New
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <input type="checkbox" checked={editingProduct.is_trending} onChange={e => setEditingProduct({ ...editingProduct, is_trending: e.target.checked })} /> Trending
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <input type="checkbox" checked={editingProduct.is_featured} onChange={e => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })} /> Featured
                </label>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 btn-primary">Save Product</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border border-zinc-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <th className="p-6">Product</th>
              <th className="p-6">Category</th>
              <th className="p-6">Price</th>
              <th className="p-6">Stock</th>
              <th className="p-6">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map(p => (
              <tr key={p.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={p.images?.[0] || 'https://picsum.photos/seed/fashion/100/120'} className="w-10 h-12 object-cover bg-zinc-100" alt="" referrerPolicy="no-referrer" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-6">{p.category}</td>
                <td className="p-6">${(p.price || 0).toFixed(2)}</td>
                <td className="p-6">{p.stock}</td>
                <td className="p-6">
                  <div className="flex gap-4">
                    <button onClick={() => setEditingProduct(p)} className="text-zinc-400 hover:text-zinc-900"><Settings size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminSubcategoryManagement = () => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [editingSub, setEditingSub] = useState<any>(null);
  const { token } = useAuthStore();

  const fetchSubcategories = async () => {
    const res = await fetch('/api/subcategories');
    const data = await res.json();
    setSubcategories(data);
  };

  useEffect(() => { fetchSubcategories(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingSub.id ? 'PUT' : 'POST';
    const url = editingSub.id ? `/api/admin/subcategories/${editingSub.id}` : '/api/admin/subcategories';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editingSub)
    });

    if (res.ok) {
      setEditingSub(null);
      fetchSubcategories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await fetch(`/api/admin/subcategories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchSubcategories();
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold">Subcategories</h1>
        <button
          onClick={() => setEditingSub({ name: '', category: 'Men' })}
          className="btn-primary"
        >
          Add Subcategory
        </button>
      </div>

      {editingSub && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md p-10 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-8">{editingSub.id ? 'Edit Subcategory' : 'New Subcategory'}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Name</label>
                <input required type="text" className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingSub.name} onChange={e => setEditingSub({ ...editingSub, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category</label>
                <select className="w-full border border-zinc-200 p-3 focus:outline-none focus:border-zinc-900" value={editingSub.category} onChange={e => setEditingSub({ ...editingSub, category: e.target.value })}>
                  <option value="Men">Men</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 btn-primary">Save</button>
                <button type="button" onClick={() => setEditingSub(null)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border border-zinc-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <th className="p-6">Name</th>
              <th className="p-6">Category</th>
              <th className="p-6">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {subcategories.map(s => (
              <tr key={s.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                <td className="p-6 font-medium">{s.name}</td>
                <td className="p-6">{s.category}</td>
                <td className="p-6">
                  <div className="flex gap-4">
                    <button onClick={() => setEditingSub(s)} className="text-zinc-400 hover:text-zinc-900"><Settings size={18} /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { token } = useAuthStore();

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-serif font-bold">Orders</h1>
      <div className="bg-white shadow-sm border border-zinc-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <th className="p-6">Order ID</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Total</th>
              <th className="p-6">Status</th>
              <th className="p-6">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {orders.map(o => (
              <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                <td className="p-6 font-bold">#OHOO-{o.id}</td>
                <td className="p-6">
                  <p className="font-medium">{o.user_name}</p>
                  <p className="text-xs text-zinc-400">{o.user_email}</p>
                </td>
                <td className="p-6">${(o.total || 0).toFixed(2)}</td>
                <td className="p-6">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1",
                    o.status === 'Delivered' ? "bg-green-100 text-green-700" : o.status === 'Shipped' ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {o.status}
                  </span>
                </td>
                <td className="p-6">
                  <select
                    className="text-xs border border-zinc-200 p-2 focus:outline-none focus:border-zinc-900"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const [bannerText, setBannerText] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setBannerText(data.hero_banner_text));
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ key: 'hero_banner_text', value: bannerText })
    });
    alert('Settings saved');
  };

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-serif font-bold">Settings</h1>
      <div className="bg-white p-10 shadow-sm border border-zinc-100 max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Hero Banner Offer Text</label>
            <input
              type="text"
              className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900"
              value={bannerText}
              onChange={e => setBannerText(e.target.value)}
            />
          </div>
          <button onClick={handleSave} className="btn-primary w-full">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

import { useParams } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductManagement />} />
                <Route path="subcategories" element={<AdminSubcategoryManagement />} />
                <Route path="orders" element={<AdminOrderManagement />} />
                <Route path="settings" element={<AdminSettings />} />
              </Routes>
            </AdminLayout>
          } />

          {/* User Routes */}
          <Route path="*" element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}
