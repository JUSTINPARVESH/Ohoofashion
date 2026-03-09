import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Trash2, Plus, Minus, ChevronRight, LayoutDashboard, Package, ShoppingBag, Settings, LogOut, Star, TrendingUp, Zap, Upload, Camera, Check, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore, useAuthStore, Product } from './store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

// --- Components ---

const Navbar = () => {
  const { items, clearCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user && items.length > 0) {
      clearCart();
    }
  }, [user, items.length, clearCart]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3 text-zinc-900" : "bg-transparent text-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-3xl font-serif font-bold tracking-tighter">OHOO FASHION</Link>
          <div className="hidden md:flex items-center gap-6 text-xs font-bold tracking-widest uppercase">
            <Link to="/men" className="hover:text-zinc-500 transition-colors py-2 px-1">Men</Link>
            <Link to="/kids" className="hover:text-zinc-500 transition-colors py-2 px-1">Kids</Link>
            <Link to="/accessories" className="hover:text-zinc-500 transition-colors py-2 px-1">Accessories</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/shop" className="hover:text-zinc-500 transition-colors"><Search size={20} /></Link>
          <Link to="/cart" className="relative hover:text-zinc-500 transition-colors">
            <ShoppingCart size={20} />
            {(user && items.length > 0) && (
              <span className={cn(
                "absolute -top-2 -right-2 text-[10px] w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                isScrolled ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
              )}>
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </Link>

          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-6">
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 hover:bg-zinc-800 transition-colors">Admin Dashboard</Link>
                )}
                <div className="flex items-center gap-4">
                  <Link to={user.role === 'admin' ? '/admin' : '/orders'} className="hover:text-zinc-500 transition-colors">
                    <User size={20} />
                  </Link>
                  <button onClick={() => { logout(); clearCart(); navigate('/'); }} className="text-xs font-bold uppercase tracking-widest hover:text-red-500">Logout</button>
                </div>
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
            className="fixed inset-0 bg-white z-[60] p-8 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-end mb-12">
              <button onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8 text-3xl font-serif">
              <Link to="/men" onClick={() => setIsMenuOpen(false)} className="font-bold border-b border-zinc-100 pb-2">Men</Link>
              <Link to="/kids" onClick={() => setIsMenuOpen(false)} className="font-bold border-b border-zinc-100 pb-2">Kids</Link>
              <Link to="/accessories" onClick={() => setIsMenuOpen(false)} className="font-bold border-b border-zinc-100 pb-2">Accessories</Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop All</Link>
              <hr className="border-zinc-100" />
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/orders'} onClick={() => setIsMenuOpen(false)}>My Account</Link>
                  <button onClick={() => { logout(); clearCart(); navigate('/'); setIsMenuOpen(false); }} className="text-left text-red-500">Logout</button>
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
          <a href="https://www.instagram.com/ohoofashion23?igsh=c2lrY2NvNDd1dTNv" className="hover:text-zinc-400 transition-colors">Instagram</a>
          <a href="https://chat.whatsapp.com/D8YtGr3DMdyGCtACx32iSn?mode=gi_t" className="hover:text-zinc-400 transition-colors">Whatsapp</a>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Shop</h3>
        <ul className="flex flex-col gap-4 text-zinc-400 text-sm">
          <li><Link to="/men">Men</Link></li>
          <li><Link to="/kids">Kids</Link></li>
          <li><Link to="/accessories">Accessories</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Contact</h3>
        <ul className="flex flex-col gap-4 text-zinc-400 text-sm">
          <li><a href="mailto:ohoofashion@gmail.com" className="hover:text-white transition-colors">ohoofashion@gmail.com</a></li>
          <li><a href="tel:+919442548292" className="hover:text-white transition-colors">+91 9442548292</a></li>
          <li><a href="tel:+914273583771" className="hover:text-white transition-colors">+91 427 358 3771</a></li>
          <li>
            <a
              href="https://maps.app.goo.gl/T3A7fsodyyhK6JJ36"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              685, Trichy Main Road, Gugai, Salem - 6.
            </a>
          </li>
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
          src={Array.isArray(product.images) ? product.images[0] : product.images || 'https://picsum.photos/seed/fashion/600/800'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.is_new ? (
          <span className="absolute top-4 left-4 bg-white text-zinc-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">New</span>
        ) : null}
        {product.is_trending ? (
          <span className="absolute top-4 right-4 bg-zinc-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Trending</span>
        ) : null}
      </div>
      <h3 className="text-sm font-medium mb-1">{product.name}</h3>
      <p className="text-zinc-500 text-sm">₹{(product.price || 0).toFixed(2)}</p>
    </Link>
  </motion.div>
);

// --- Pages ---

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, setRes, reelsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/settings'),
          fetch('/api/reels')
        ]);
        const prodData = await prodRes.json();
        const setData = await setRes.json();
        const reelsData = await reelsRes.json();
        setProducts(prodData);
        setSettings(setData);
        setReels(reelsData);
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
          src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&q=80&w=2070"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero Men's Fashion"
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

      {/* Reels Section */}
      {reels.length > 0 && (
        <section className="py-24 px-6 bg-zinc-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Social Feed</p>
                <h2 className="text-4xl font-serif font-bold">Latest Reels</h2>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
              {reels.map(reel => (
                <div key={reel.id} className="min-w-[280px] md:min-w-[320px] aspect-[9/16] bg-black rounded-xl overflow-hidden snap-start relative group shadow-lg">
                  <video
                    src={reel.url}
                    className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    controlsList="nodownload"
                    controls
                    loop
                    playsInline
                    preload="metadata"
                    onError={(e) => console.error('Video load error:', e)}
                  />
                  {reel.description && (
                    <div className="absolute bottom-12 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                      <p className="text-sm font-medium">{reel.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState(10000); // Max ₹10000

  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  let categoryId = queryParams.get('category_id');

  if (location.pathname === '/men') categoryId = '1';
  if (location.pathname === '/kids') categoryId = '2';
  if (location.pathname === '/accessories') categoryId = '3';

  const subcategoryId = queryParams.get('subcategory_id');
  const type = queryParams.get('type');

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => {
      const unique = data.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.name === v.name) === i);
      setCategories(unique);
      if (categoryId) setOpenCategoryId(parseInt(categoryId));
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryId) params.append('category_id', categoryId);
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
  }, [categoryId, subcategoryId, type, search, priceRange]);

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-12">
          <div className="space-y-8">
            {/* Price Range */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Price Range</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-100 appearance-none cursor-pointer accent-zinc-900"
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  <span>₹0</span>
                  <span>₹10,000</span>
                </div>
                <p className="text-sm font-medium">Under ₹{priceRange.toLocaleString()}</p>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Categories</h3>
              <div className="flex flex-col gap-2">
                <Link
                  to="/shop"
                  className={cn(
                    "text-sm hover:text-zinc-500 py-3 block transition-colors",
                    !categoryId && "font-bold text-zinc-900"
                  )}
                >
                  All Collections
                </Link>
                {categories.map(cat => (
                  <div key={cat.id} className="border-t border-zinc-50">
                    <button
                      onClick={() => setOpenCategoryId(openCategoryId === cat.id ? null : cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between py-4 text-sm hover:text-zinc-500 transition-colors uppercase tracking-tight",
                        categoryId === cat.id.toString() && "font-bold text-zinc-900"
                      )}
                    >
                      <Link to={`/shop?category_id=${cat.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-zinc-500">{cat.name}</Link>
                      <ChevronRight size={14} className={cn("transition-transform duration-300", openCategoryId === cat.id && "rotate-90")} />
                    </button>

                    <AnimatePresence>
                      {openCategoryId === cat.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-zinc-50/50 rounded-lg"
                        >
                          <div className="py-2 px-4 flex flex-col gap-2">
                            <SubcategoryList categoryId={cat.id} currentSubId={subcategoryId} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-3xl font-serif font-bold">
              {categoryId ? `${categories.find(c => c.id.toString() === categoryId)?.name || ''} Collection` : type === 'new' ? 'New Arrivals' : 'All Products'}
              {subcategoryId && <SubcategoryTitle subId={subcategoryId} />}
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{products.length} Items</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-zinc-100" />
                  <div className="h-4 bg-zinc-100 w-2/3" />
                  <div className="h-4 bg-zinc-100 w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
                  <p className="text-zinc-400 font-serif italic text-xl">No products found for this selection.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const SubcategoryList = ({ categoryId, currentSubId }: { categoryId: number, currentSubId: string | null }) => {
  const [subs, setSubs] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/subcategories?category_id=${categoryId}`).then(res => res.json()).then(data => {
      // Deduplicate by name
      const unique = data.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.name === v.name) === i);
      setSubs(unique);
    });
  }, [categoryId]);

  return (
    <>
      {subs.map(sub => (
        <Link
          key={sub.id}
          to={`/shop?category_id=${categoryId}&subcategory_id=${sub.id}`}
          className={cn(
            "text-xs py-2 hover:text-zinc-600 transition-colors",
            currentSubId === sub.id.toString() ? "text-zinc-900 font-bold" : "text-zinc-400"
          )}
        >
          {sub.name}
        </Link>
      ))}
    </>
  );
};

const SubcategoryTitle = ({ subId }: { subId: string }) => {
  const [name, setName] = useState('');
  useEffect(() => {
    fetch('/api/subcategories').then(res => res.json()).then(data => {
      const sub = data.find((s: any) => s.id.toString() === subId);
      if (sub) setName(sub.name);
    });
  }, [subId]);

  return name ? ` - ${name}` : null;
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
              src={Array.isArray(product.images) ? product.images[activeImage] : product.images || 'https://picsum.photos/seed/fashion/800/1200'}
              className="w-full h-full object-cover"
              alt={product.name}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.isArray(product.images) ? product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "aspect-square bg-zinc-100 overflow-hidden border-2 transition-all",
                  activeImage === idx ? "border-zinc-900" : "border-transparent"
                )}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            )) : (
              <button
                onClick={() => setActiveImage(0)}
                className="aspect-square bg-zinc-100 overflow-hidden border-2 border-zinc-900"
              >
                <img src={product.images} className="w-full h-full object-cover" alt="" />
              </button>
            )}
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
              {product.category_name}
            </p>
            <h1 className="text-4xl font-serif font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-2xl text-zinc-900">₹{(product.price || 0).toFixed(2)}</p>
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
            <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest">Free shipping on orders over ₹150</p>
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
                    <p className="font-medium">₹{((item.price || 0) * item.quantity).toFixed(2)}</p>
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
                  <span>₹{(total() || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Shipping</span>
                  <span>{total() > 150 ? 'FREE' : '₹15.00'}</span>
                </div>
                <div className="pt-4 border-t border-zinc-200 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{((total() || 0) + (total() > 150 ? 0 : 15)).toFixed(2)}</span>
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
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
  const [onlinePaid, setOnlinePaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>({});
  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data));
  }, []);

  useEffect(() => {
    if (paymentMethod === 'Online') {
      const timer = setTimeout(() => setOnlinePaid(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentMethod]);

  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  if (items.length === 0 && !showOrderSuccess) return <div className="pt-32 text-center">Your cart is empty</div>;

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
          paymentMethod,
          ...formData
        })
      });
      if (res.ok) {
        clearCart();
        setShowOrderSuccess(true);
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
                placeholder="Pincode"
                className="w-full border-b border-zinc-200 py-3 focus:outline-none focus:border-zinc-900"
                value={formData.zip}
                onChange={e => setFormData({ ...formData, zip: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest">Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={cn(
                "p-4 border text-xs font-bold uppercase tracking-widest transition-all",
                paymentMethod === 'COD' ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-400 hover:border-zinc-900"
              )}
            >
              Cash on Delivery
            </button>
            <button
              type="button"
              onClick={() => { setPaymentMethod('Online'); setOnlinePaid(false); }}
              className={cn(
                "p-4 border text-xs font-bold uppercase tracking-widest transition-all",
                paymentMethod === 'Online' ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-400 hover:border-zinc-900"
              )}
            >
              Online Transaction
            </button>
          </div>

          {paymentMethod === 'Online' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 border border-zinc-200 bg-zinc-50 flex flex-col items-center gap-6"
            >
              <div className="w-48 h-48 bg-white p-2 border border-zinc-100 flex items-center justify-center text-center">
                <div className="space-y-2 w-full h-full">
                  {settings.payment_qr_code ? (
                    <img src={settings.payment_qr_code} className="w-full h-full object-contain" alt="Payment QR" />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                      <Zap size={48} className="text-zinc-300" />
                    </div>
                  )}
                  {!settings.payment_qr_code && <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Scan to Pay UPI</p>}
                </div>
              </div>
              <div className="text-center space-y-2">
                {onlinePaid ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Check size={24} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-green-600">Payment Verified Automatically</p>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest">Verifying Payment...</p>
                    <p className="text-[10px] text-zinc-400">Please complete the transaction in your app.</p>
                    <div className="w-full bg-zinc-100 h-1 overflow-hidden mt-4">
                      <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '0%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className="bg-zinc-900 h-full w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          <p className="text-xs text-zinc-400 italic">
            {paymentMethod === 'COD' ? "Pay with cash at your doorstep." : "Secure online transaction via UPI or Net Banking."}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || (paymentMethod === 'Online' && !onlinePaid)}
          className="w-full btn-primary py-5 disabled:bg-zinc-300"
        >
          {loading ? 'Processing...' : (paymentMethod === 'Online' && !onlinePaid) ? 'Waiting for Verification...' : `Place Order • ₹${((total() || 0) + (total() > 150 ? 0 : 15)).toFixed(2)}`}
        </button>
      </form>

      <AnimatePresence>
        {showOrderSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white border border-zinc-100 shadow-2xl p-12 max-w-lg w-full text-center space-y-8"
            >
              <div className="relative w-24 h-24 mx-auto mb-12">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-t-2 border-zinc-900 rounded-full"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute inset-0 flex items-center justify-center bg-zinc-900 rounded-full text-white"
                >
                  <Check size={40} />
                </motion.div>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-serif font-bold tracking-tighter">Order Confirmed!</h2>
                <p className="text-sm text-zinc-500 font-medium">Thank you for choosing Ohoo Fashion. Your premium pieces are being prepared for shipment.</p>
              </div>

              <div className="pt-8 border-t border-zinc-50 flex flex-col gap-4">
                <button
                  onClick={() => navigate('/orders')}
                  className="btn-primary py-4 w-full"
                >
                  View Order History
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
      <div className="mt-12 text-center space-y-4 border-t border-zinc-100 pt-8">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Payment</p>
                <p className="text-sm font-bold">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Total</p>
                <p className="text-sm font-bold">₹{(order.total || 0).toFixed(2)}</p>
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
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleExitAdmin = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-64 bg-zinc-900 text-white p-8 hidden lg:block">
        <h2 className="text-xl font-serif font-bold mb-12 tracking-tighter">OHOO ADMIN</h2>
        <nav className="space-y-8">
          <Link to="/admin" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <Menu size={18} /> Categories
          </Link>
          <Link to="/admin/products" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <Package size={18} /> Products
          </Link>
          <Link to="/admin/reels" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <Film size={18} /> Reels
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <ShoppingBag size={18} /> Orders
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">
            <Settings size={18} /> Settings
          </Link>
          <button onClick={handleExitAdmin} className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors pt-12 border-t border-zinc-800 w-full">
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
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, categories: 0 });
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      const [p, o, c] = await Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
        fetch('/api/categories').then(res => res.json())
      ]);
      setStats({
        products: p.length,
        orders: o.length,
        revenue: o.reduce((acc: number, order: any) => acc + order.total, 0),
        categories: c.length
      });
    };
    fetchStats();
  }, [token]);

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-serif font-bold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <TrendingUp className="text-blue-500" /> },
          { label: 'Total Orders', value: stats.orders, icon: <ShoppingBag className="text-purple-500" /> },
          { label: 'Total Products', value: stats.products, icon: <Package className="text-orange-500" /> },
          { label: 'Categories', value: stats.categories, icon: <Menu className="text-green-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-serif font-bold underline underline-offset-8">{stat.value}</p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-2xl">{stat.icon}</div>
          </div>
        ))}
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
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { token } = useAuthStore();

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchSubcategories = async () => {
    const res = await fetch('/api/subcategories');
    const data = await res.json();
    setSubcategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files) as File[]) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ image: reader.result, fileName: file.name, fileType: file.type })
        });
        const data = await res.json();
        if (data.url) {
          setEditingProduct((prev: any) => ({
            ...prev,
            images: [...(prev.images || []), data.url]
          }));
        }
      };
      reader.readAsDataURL(file);
    }
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
          onClick={() => setEditingProduct({ name: '', description: '', price: 0, category_id: categories[0]?.id || '', subcategory_id: '', images: [], video: '', stock: 0, sizes: [], attributes: {}, is_new: false, is_trending: false, is_featured: false })}
          className="btn-primary"
        >
          Add Product
        </button>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold mb-8">{editingProduct.id ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Product Name</label>
                    <input required type="text" className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900 font-medium" placeholder="e.g. Premium Silk Shirt" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price (₹)</label>
                      <input required type="number" className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Inventory (Stock)</label>
                      <input required type="number" className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900" placeholder="0" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Main Category</label>
                      <select required className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900 appearance-none bg-white" value={editingProduct.category_id} onChange={e => setEditingProduct({ ...editingProduct, category_id: parseInt(e.target.value), subcategory_id: '' })}>
                        <option value="">Choose Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Subcategory</label>
                      <select className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900 appearance-none bg-white" value={editingProduct.subcategory_id} onChange={e => setEditingProduct({ ...editingProduct, subcategory_id: e.target.value })}>
                        <option value="">Choose Subcategory</option>
                        {subcategories.filter(s => s.category_id === parseInt(editingProduct.category_id)).map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Product Information</label>
                    <textarea className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900 h-32 resize-none" placeholder="Describe the product details, material, fit, etc." value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Product Images</label>
                    <div className="grid grid-cols-3 gap-2">
                      {editingProduct.images.map((url: string, index: number) => (
                        <div key={index} className="relative aspect-square bg-zinc-100 group">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, images: editingProduct.images.filter((_: any, i: number) => i !== index) })}
                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-zinc-900 hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900">
                        <Camera size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add Image</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Specifications</label>
                      <button type="button" onClick={addAttribute} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-900 hover:underline">
                        <Plus size={12} /> Add Spec
                      </button>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(editingProduct.attributes || {}).map(([key, value]) => (
                        <div key={key} className="flex gap-2 items-center">
                          <div className="flex-1 flex border border-zinc-200 focus-within:border-zinc-900 transition-colors">
                            <span className="bg-zinc-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-r border-zinc-200 flex items-center min-w-[80px]">{key}</span>
                            <input
                              type="text"
                              className="flex-1 p-2 text-sm focus:outline-none"
                              value={value as string}
                              onChange={e => setEditingProduct({ ...editingProduct, attributes: { ...editingProduct.attributes, [key]: e.target.value } })}
                            />
                          </div>
                          <button type="button" onClick={() => {
                            const newAttrs = { ...editingProduct.attributes };
                            delete newAttrs[key];
                            setEditingProduct({ ...editingProduct, attributes: newAttrs });
                          }} className="text-zinc-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Available Sizes (comma separated)</label>
                    <input type="text" className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900" placeholder="S, M, L, XL" value={(editingProduct.sizes || []).join(', ')} onChange={e => setEditingProduct({ ...editingProduct, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s) })} />
                  </div>

                  <div className="bg-zinc-50 p-6 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Badges & Visibility</p>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn("w-5 h-5 border flex items-center justify-center transition-colors", editingProduct.is_new ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-900")}>
                          {editingProduct.is_new && <Check size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={editingProduct.is_new} onChange={e => setEditingProduct({ ...editingProduct, is_new: e.target.checked })} />
                        <span className="text-xs font-bold uppercase tracking-widest">New</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn("w-5 h-5 border flex items-center justify-center transition-colors", editingProduct.is_trending ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-900")}>
                          {editingProduct.is_trending && <Check size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={editingProduct.is_trending} onChange={e => setEditingProduct({ ...editingProduct, is_trending: e.target.checked })} />
                        <span className="text-xs font-bold uppercase tracking-widest">Trending</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn("w-5 h-5 border flex items-center justify-center transition-colors", editingProduct.is_featured ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 group-hover:border-zinc-900")}>
                          {editingProduct.is_featured && <Check size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={editingProduct.is_featured} onChange={e => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })} />
                        <span className="text-xs font-bold uppercase tracking-widest">Featured</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8 border-t border-zinc-100">
                <button type="submit" className="flex-2 btn-primary py-4">
                  {editingProduct.id ? 'Update Product' : 'Publish Product'}
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 btn-secondary py-4">
                  Discard
                </button>
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
              <th className="p-6">Subcategory</th>
              <th className="p-6">Price</th>
              <th className="p-6">Payment</th>
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
                <td className="p-6">{p.category_name}</td>
                <td className="p-6">{p.subcategory_name || '-'}</td>
                <td className="p-6">₹{(p.price || 0).toLocaleString()}</td>
                <td className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Fixed</span>
                </td>
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

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [newSubName, setNewSubName] = useState('');
  const { token } = useAuthStore();

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchSubcategories = async () => {
    const res = await fetch('/api/subcategories');
    const data = await res.json();
    setSubcategories(data);
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCat.id ? 'PUT' : 'POST';
    const url = editingCat.id ? `/api/admin/categories/${editingCat.id}` : '/api/admin/categories';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(editingCat)
    });

    if (res.ok) {
      setEditingCat(null);
      fetchCategories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure? This will affect products in this category.')) return;
    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchCategories();
  };

  const handleAddSub = async () => {
    if (!newSubName) return;
    const res = await fetch('/api/admin/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: newSubName, category_id: editingCat.id })
    });
    if (res.ok) {
      setNewSubName('');
      fetchSubcategories();
    }
  };

  const handleDeleteSub = async (id: number) => {
    if (!confirm('Delete this subcategory?')) return;
    const res = await fetch(`/api/admin/subcategories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      fetchSubcategories();
    } else {
      alert('Failed to delete subcategory. It might be in use.');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-serif font-bold">Category Management</h1>
        <button
          onClick={() => setEditingCat({ name: '' })}
          className="btn-primary"
        >
          Add Category
        </button>
      </div>

      {editingCat && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl p-10 shadow-2xl space-y-8">
            <div>
              <h2 className="text-2xl font-serif font-bold mb-6">{editingCat.id ? 'Edit Category' : 'New Category'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Category Name</label>
                  <input required type="text" className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900 font-medium" value={editingCat.name} onChange={e => setEditingCat({ ...editingCat, name: e.target.value })} />
                </div>
                <button type="submit" className="w-full btn-primary py-4">Save Category</button>
              </form>
            </div>

            {editingCat.id && (
              <div className="pt-8 border-t border-zinc-100">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Manage Subcategories</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New Subcategory (e.g. Shirts)"
                      className="flex-1 border border-zinc-200 px-4 py-2 text-sm focus:outline-none focus:border-zinc-900"
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                    />
                    <button onClick={handleAddSub} className="bg-zinc-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800">Add</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {subcategories.filter(s => s.category_id === editingCat.id).map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 group">
                        <span className="text-sm font-medium">{sub.name}</span>
                        <button onClick={() => handleDeleteSub(sub.id)} className="text-zinc-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => setEditingCat(null)} className="w-full text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 pt-4 border-t border-zinc-50">Close</button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border border-zinc-100 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <th className="p-6">Name</th>
              <th className="p-6">Subcategories</th>
              <th className="p-6">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {categories.map(c => (
              <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                <td className="p-6 font-medium">{c.name}</td>
                <td className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {subcategories.filter(s => s.category_id === c.id).map(s => (
                      <span key={s.id} className="text-[10px] bg-zinc-100 px-2 py-1 uppercase tracking-tight font-bold">{s.name}</span>
                    ))}
                    {subcategories.filter(s => s.category_id === c.id).length === 0 && <span className="text-zinc-300 italic text-xs">No subcategories</span>}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex gap-4">
                    <button onClick={() => setEditingCat(c)} className="text-zinc-400 hover:text-zinc-900"><Settings size={18} /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-zinc-400 hover:text-red-500"><Trash2 size={18} /></button>
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



const AdminReelsManagement = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuthStore();

  const fetchReels = async () => {
    const res = await fetch('/api/reels');
    const data = await res.json();
    setReels(data);
  };

  useEffect(() => { fetchReels(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ image: reader.result, fileName: file.name, fileType: file.type })
        });
        const data = await res.json();
        if (data.url) {
          setUrl(data.url);
          alert('Video uploaded successfully!');
        } else {
          alert('Upload failed: ' + (data.error || 'Unknown error'));
        }
      } catch (error) {
        alert('Upload error: ' + error.message);
      }
      setLoading(false);
    };
    reader.onerror = () => {
      alert('File reading error');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return alert('Please provide a video URL or upload one');

    await fetch('/api/admin/reels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ url, description })
    });
    setUrl('');
    setDescription('');
    fetchReels();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    await fetch(`/api/admin/reels/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchReels();
  };

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-serif font-bold">Reels Management</h1>
      <div className="bg-white p-10 shadow-sm border border-zinc-100 flex flex-col md:flex-row gap-12">
        <form onSubmit={handleSave} className="flex-1 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest pb-4 border-b border-zinc-50">Upload New Reel</h3>
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Video Source</label>
            <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4">
              <label className="btn-secondary px-6 py-4 cursor-pointer text-xs flex-shrink-0 w-full xl:w-auto text-center">
                {loading ? 'Uploading...' : 'Upload Video File'}
                <input type="file" className="hidden" accept="video/*" onChange={handleUpload} disabled={loading} />
              </label>
              <span className="text-xs text-zinc-400 uppercase font-bold tracking-widest">OR</span>
              <input type="text" placeholder="Paste URL (Instagram/YouTube/MP4)" className="w-full xl:flex-1 border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Description / Caption</label>
            <textarea className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900 resize-none h-24" placeholder="Trendy summer styles..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <button type="submit" disabled={loading || !url} className="w-full btn-primary py-4 disabled:bg-zinc-300">Add Reel</button>
        </form>
        {url && (
          <div className="w-full md:w-64 aspect-[9/16] bg-black shrink-0 relative flex items-center justify-center">
            <video src={url} className="w-full h-full object-contain" controls playsInline />
            <div className="absolute inset-0 border-4 border-dashed border-zinc-100/50 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {reels.map(reel => (
          <div key={reel.id} className="relative aspect-[9/16] bg-black group overflow-hidden shadow-sm flex items-center justify-center">
            <video src={reel.url} className="w-full h-full object-contain" controls controlsList="nodownload" playsInline />
            <button onClick={() => handleDelete(reel.id)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Trash2 size={16} />
            </button>
            <div className="absolute bottom-12 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
              <p className="text-xs text-white line-clamp-2">{reel.description}</p>
            </div>
          </div>
        ))}
        {reels.length === 0 && <div className="col-span-full py-12 text-center text-zinc-400 italic">No reels uploaded yet.</div>}
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

  const updatePaymentStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/orders/${id}/payment-status`, {
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
              <th className="p-6">Method</th>
              <th className="p-6">Payment</th>
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
                <td className="p-6">₹{(o.total || 0).toFixed(2)}</td>
                <td className="p-6 text-[10px] font-bold uppercase tracking-widest">{o.payment_method}</td>
                <td className="p-6">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1",
                    o.payment_status === 'Paid' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {o.payment_status || 'Unpaid'}
                  </span>
                </td>
                <td className="p-6">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1",
                    o.status === 'Delivered' ? "bg-green-100 text-green-700" : o.status === 'Shipped' ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-700"
                  )}>
                    {o.status}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-2">
                    <select
                      className="text-xs border border-zinc-200 p-2 focus:outline-none focus:border-zinc-900"
                      value={o.payment_status || 'Unpaid'}
                      onChange={(e) => updatePaymentStatus(o.id, e.target.value)}
                    >
                      <option value="Unpaid">Mark Unpaid</option>
                      <option value="Paid">Mark Paid</option>
                    </select>
                    <select
                      className="text-xs border border-zinc-200 p-2 focus:outline-none focus:border-zinc-900"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
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

const AdminSettings = () => {
  const [settings, setSettings] = useState<any>({ hero_banner_text: '', payment_qr_code: '' });
  const { token } = useAuthStore();

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(prev => ({ ...prev, ...data })));
  }, []);

  const handleSave = async () => {
    for (const [key, value] of Object.entries(settings)) {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ key, value })
      });
    }
    alert('Settings saved');
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ image: reader.result, fileName: file.name, fileType: file.type })
        });
        const data = await res.json();
        if (data.url) setSettings({ ...settings, payment_qr_code: data.url });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-serif font-bold">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-10 shadow-sm border border-zinc-100 space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-widest pb-4 border-b border-zinc-50">Visual Customization</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Hero Banner Offer Text</label>
              <input
                type="text"
                className="w-full border border-zinc-200 p-4 focus:outline-none focus:border-zinc-900"
                value={settings.hero_banner_text}
                onChange={e => setSettings({ ...settings, hero_banner_text: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-10 shadow-sm border border-zinc-100 space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-widest pb-4 border-b border-zinc-50">Payment Settings</h3>
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Payment QR Code</label>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
                  {settings.payment_qr_code ? (
                    <img src={settings.payment_qr_code} className="w-full h-full object-contain" alt="QR Preview" />
                  ) : (
                    <Camera className="text-zinc-200" size={32} />
                  )}
                </div>
                <label className="btn-secondary py-3 px-6 cursor-pointer text-xs">
                  {settings.payment_qr_code ? 'Change QR Code' : 'Upload QR Code'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
                </label>
              </div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">This QR code will be displayed to customers during checkout when they select "Online Transaction".</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-12 py-4">Save All Settings</button>
      </div>
    </div>
  );
};

// --- Main App ---



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
                <Route path="categories" element={<AdminCategoryManagement />} />
                <Route path="products" element={<AdminProductManagement />} />
                <Route path="reels" element={<AdminReelsManagement />} />
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
                  <Route path="/men" element={<ShopPage />} />
                  <Route path="/kids" element={<ShopPage />} />
                  <Route path="/accessories" element={<ShopPage />} />
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
