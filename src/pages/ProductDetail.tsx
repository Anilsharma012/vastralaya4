import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, Share2, Truck, RefreshCw, Package, Minus, Plus, ChevronLeft, Instagram, Facebook, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { storeInfo } from "@/data/products";

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: { _id: string; name: string; slug: string } | null;
  subcategoryId?: { _id: string; name: string; slug: string } | null;
  images: string[];
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  variants: Array<{
    _id: string;
    size?: string;
    color?: string;
    sku: string;
    price: number;
    comparePrice?: number;
    stock: number;
    images?: string[];
  }>;
  colorVariants?: Array<{
    _id: string;
    color: string;
    images: string[];
    stock?: number;
  }>;
  attributes: Record<string, string>;
  tags: string[];
  sizeChart?: {
    fieldNames: string[];
    rows: Array<{ size: string; [key: string]: string }>;
  };
  sizeInventory?: {
    S?: number;
    M?: number;
    L?: number;
    XL?: number;
    XXL?: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  avgRating: number;
  reviewCount: number;
}

interface ReviewData {
  _id: string;
  userId: { _id: string; name: string };
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColorVariant, setSelectedColorVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as string[]
  });
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  // Size chart modal state
  const [showSizeChartModal, setShowSizeChartModal] = useState(false);

  const isWishlisted = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await api.get<{ product: ProductData; relatedProducts: ProductData[]; reviews: ReviewData[] }>(`/public/products/${productId}`);

        const productData = data.product;
        setProduct(productData);
        setRelatedProducts(data.relatedProducts || []);
        setReviews(data.reviews || []);

        // Reset image and color selection when product changes
        setSelectedImage(0);
        setSelectedColorVariant(0);

        console.log('=== PRODUCT LOADED ===', {
          name: productData.name,
          slug: productData.slug,
          hasColorVariants: !!(productData.colorVariants && Array.isArray(productData.colorVariants) && productData.colorVariants.length > 0),
          colorVariantsCount: productData.colorVariants?.length || 0,
          colorVariantsStructure: productData.colorVariants?.map((cv: any) => ({
            color: cv.color,
            imageCount: cv.images?.length || 0
          })),
          fullColorVariants: JSON.stringify(productData.colorVariants)
        });
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSelectedColorStock = () => {
    if (!product) return 0;
    if (product.colorVariants && product.colorVariants.length > 0) {
      const colorVariant = product.colorVariants[selectedColorVariant];
      return colorVariant?.stock ?? product.stock;
    }
    return product.stock;
  };

  const getSelectedColorName = () => {
    if (!product) return null;
    if (product.colorVariants && product.colorVariants.length > 0) {
      return product.colorVariants[selectedColorVariant]?.color || null;
    }
    return null;
  };

  const handleQuantityChange = (delta: number) => {
    const maxStock = getSelectedColorStock();
    setQuantity(prev => Math.max(1, Math.min(maxStock, Math.min(10, prev + delta))));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if size selection is required and enforced
    if (product.sizeInventory && Object.values(product.sizeInventory).some(val => val > 0) && !selectedSize) {
      toast({
        title: "Please select a size",
        description: "You must select a size before adding to cart",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    const colorStock = getSelectedColorStock();
    if (colorStock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${colorStock} items available for this color`,
        variant: "destructive"
      });
      return;
    }

    setAddingToCart(true);
    try {
      const variant = product.variants[selectedVariant];
      const cartSize = selectedSize || variant?.size;
      const cartColor = getSelectedColorName() || variant?.color;
      await addToCart(product._id, quantity, cartSize, cartColor);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to login to add items to wishlist",
        variant: "destructive"
      });
      return;
    }

    if (!product) return;

    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive"
      });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    // Check if size selection is required and enforced
    if (product.sizeInventory && Object.values(product.sizeInventory).some(val => val > 0) && !selectedSize) {
      toast({
        title: "Please select a size",
        description: "You must select a size before proceeding to checkout",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to login to purchase items",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    const colorStock = getSelectedColorStock();
    if (colorStock < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${colorStock} items available for this color`,
        variant: "destructive"
      });
      return;
    }

    try {
      setAddingToCart(true);
      const variant = product.variants[selectedVariant];
      const variantPrice = variant?.price || product.price;
      const colorVariant = product.colorVariants?.[selectedColorVariant];
      const variantImage = colorVariant?.images?.[0] || variant?.images?.[0] || product.images?.[0] || '/placeholder-product.jpg';
      const cartSize = selectedSize || variant?.size;
      const cartColor = getSelectedColorName() || variant?.color;

      // Pass product data directly to checkout page via state
      navigate('/checkout', {
        state: {
          buyNowProduct: {
            productId: product._id,
            name: product.name,
            price: variantPrice,
            image: variantImage,
            quantity,
            size: cartSize,
            color: cartColor,
            variantId: variant?._id
          }
        }
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to proceed to checkout",
        variant: "destructive"
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReviewImages([...reviewImages, ...files]);

    // Convert files to base64 and add to form data
    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
    setReviewFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const fetchUserOrders = async () => {
    setFetchingOrders(true);
    try {
      const response = await api.get<{ orders: any[] }>('/user/orders?limit=100');
      const ordersWithProduct = response.orders?.filter((order: any) => {
        return order.items?.some((item: any) => item.productId?.toString() === product?._id?.toString());
      }) || [];
      setUserOrders(ordersWithProduct);
      if (ordersWithProduct.length > 0) {
        setSelectedOrderId(ordersWithProduct[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast({
        title: 'Failed to load orders',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setFetchingOrders(false);
    }
  };

  const handleOpenReviewForm = () => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to login to submit a review",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    setShowReviewForm(true);
    fetchUserOrders();
  };

  const handleSubmitReview = async () => {
    if (!product) return;

    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to login to submit a review",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!selectedOrderId) {
      toast({
        title: "Select an Order",
        description: "Please select the order from which you purchased this product",
        variant: "destructive"
      });
      return;
    }

    if (!reviewFormData.title.trim() || !reviewFormData.comment.trim()) {
      toast({
        title: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/user/reviews', {
        productId: product._id,
        orderId: selectedOrderId,
        rating: reviewFormData.rating,
        title: reviewFormData.title,
        comment: reviewFormData.comment,
        images: reviewFormData.images
      });

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback. Your review will be displayed after approval."
      });

      setReviewFormData({ rating: 5, title: '', comment: '', images: [] });
      setReviewImages([]);
      setShowReviewForm(false);

      // Reload product to get updated reviews
      const data = await api.get<{ product: ProductData; relatedProducts: ProductData[]; reviews: ReviewData[] }>(`/public/products/${product._id}`);
      setReviews(data.reviews || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${product?.name} at Shree Balaji Vastralaya!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Product link copied to clipboard"
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 w-20">
                {[1,2,3,4].map((i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
              <Skeleton className="flex-1 aspect-[3/4] rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="text-product-not-found">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Link to="/" className="text-primary hover:underline" data-testid="link-back-home">
            <ChevronLeft className="inline h-4 w-4" /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasColorVariants = product && product.colorVariants && Array.isArray(product.colorVariants) && product.colorVariants.length > 0;
  const currentColorImages = hasColorVariants && selectedColorVariant < product.colorVariants!.length
    ? product.colorVariants![selectedColorVariant]?.images
    : null;

  const allImages = (currentColorImages && Array.isArray(currentColorImages) && currentColorImages.length > 0)
    ? currentColorImages
    : (product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ['/placeholder-product.jpg']);

  const currentVariant = product.variants[selectedVariant];
  const currentPrice = currentVariant?.price || product.price;
  const currentComparePrice = currentVariant?.comparePrice || product.comparePrice;
  const discount = currentComparePrice ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100) : 0;
  const categoryName = typeof product.categoryId === 'object' ? product.categoryId?.name : 'Category';

  // Check if sizeChart has valid data
  const hasSizeChart = product.sizeChart &&
    Array.isArray(product.sizeChart.fieldNames) &&
    product.sizeChart.fieldNames.length > 0 &&
    Array.isArray(product.sizeChart.rows) &&
    product.sizeChart.rows.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-secondary/30 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary" data-testid="link-breadcrumb-home">Home</Link>
            <span className="text-muted-foreground">/</span>
            {product.categoryId && typeof product.categoryId === 'object' && (
              <>
                <Link 
                  to={`/category/${product.categoryId.slug}`} 
                  className="text-muted-foreground hover:text-primary"
                  data-testid="link-breadcrumb-category"
                >
                  {product.categoryId.name}
                </Link>
                <span className="text-muted-foreground">/</span>
              </>
            )}
            <span className="text-foreground font-medium" data-testid="text-breadcrumb-product">{product.name}</span>
          </div>
        </div>
      </div>

      <section className="py-6 md:py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            
            <div className="flex gap-3 md:gap-4">
              <div className="flex flex-col gap-2 w-16 md:w-20">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? "border-primary" : "border-transparent hover:border-primary/50"
                    }`}
                    data-testid={`button-thumbnail-${index}`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              <div className="flex-1 relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
                  <img 
                    src={allImages[selectedImage]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    data-testid="img-product-main"
                  />
                </div>
                
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
                    {discount}% OFF
                  </div>
                )}
                {product.isNewArrival && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                    NEW
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-product-name">
                  {product.name}
                </h1>
                <p className="text-muted-foreground" data-testid="text-product-category">{categoryName}</p>
                {product.sku && (
                  <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-product-price">
                  {formatPrice(currentPrice)}
                </span>
                {currentComparePrice && currentComparePrice > currentPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(currentComparePrice)}
                    </span>
                    <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-sm font-medium">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {hasColorVariants && product.colorVariants && product.colorVariants.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Color</h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.colorVariants.map((colorVariant, index) => {
                      const colorStock = colorVariant.stock ?? 0;
                      const isOutOfStock = colorStock === 0;
                      return (
                        <button
                          key={`color-${index}`}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedColorVariant(index);
                              setSelectedImage(0);
                              setQuantity(1);
                            }
                          }}
                          disabled={isOutOfStock}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition-all relative ${
                            isOutOfStock
                              ? "border-muted bg-muted/50 text-muted-foreground cursor-not-allowed"
                              : selectedColorVariant === index
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:border-primary"
                          }`}
                          data-testid={`button-color-${index}`}
                        >
                          {colorVariant.color || `Color ${index + 1}`}
                          {isOutOfStock && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                              Out
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.variants.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">Size</h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((variant, index) => (
                      <button
                        key={variant._id}
                        onClick={() => {
                          setSelectedVariant(index);
                          if (variant.images?.length) setSelectedImage(0);
                        }}
                        disabled={variant.stock === 0}
                        className={`min-w-[48px] h-10 px-3 text-sm font-medium rounded border transition-all ${
                          selectedVariant === index
                            ? "border-primary bg-primary text-primary-foreground"
                            : variant.stock === 0
                              ? "border-border bg-muted text-muted-foreground cursor-not-allowed line-through"
                              : "border-border bg-background text-foreground hover:border-primary"
                        }`}
                        data-testid={`button-size-${variant.size || index}`}
                      >
                        {variant.size || variant.color || `Option ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.shortDescription && (
                <p className="text-muted-foreground">{product.shortDescription}</p>
              )}

              <div className="space-y-2 text-sm">
                {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                  <p key={key}>
                    <strong className="text-foreground capitalize">{key}:</strong>{' '}
                    <span className="text-muted-foreground">{value}</span>
                  </p>
                ))}
                <p>
                  <strong className="text-foreground">Availability:</strong>{' '}
                  <span className={getSelectedColorStock() > 0 ? "text-green-600" : "text-red-600"}>
                    {getSelectedColorStock() > 0 
                      ? `In Stock (${getSelectedColorStock()} available${getSelectedColorName() ? ` for ${getSelectedColorName()}` : ''})` 
                      : "Out of Stock"}
                  </span>
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">Express Delivery Available</span>
                <Truck className="h-8 w-8 text-primary flex-shrink-0" />
              </div>

              {hasSizeChart && (
                <button
                  onClick={() => setShowSizeChartModal(true)}
                  className="w-full px-4 py-3 border border-primary rounded-lg text-primary font-semibold hover:bg-primary/5 transition-colors"
                  data-testid="button-view-size-chart"
                >
                  📏 VIEW SIZE CHART
                </button>
              )}

              {product.sizeInventory && Object.values(product.sizeInventory).some(val => val > 0) && (
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-foreground block">SIZE *</span>
                  <div className="flex flex-wrap gap-2">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => {
                      const inventory = product.sizeInventory?.[size] || 0;
                      const isAvailable = inventory > 0;
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : isAvailable
                              ? 'border-border hover:border-primary cursor-pointer'
                              : 'border-muted bg-muted/30 text-muted-foreground cursor-not-allowed'
                          }`}
                          data-testid={`button-size-${size}`}
                          title={isAvailable ? `${size} - ${inventory} available` : `${size} - Out of stock`}
                        >
                          {size}
                          {isAvailable && <span className="text-xs ml-1">({inventory})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-sm font-semibold text-foreground block mb-2">QUANTITY</span>
                  <div className="flex items-center border border-border rounded-lg">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 hover:bg-muted transition-colors"
                      disabled={quantity <= 1 || getSelectedColorStock() === 0}
                      data-testid="button-quantity-decrease"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-semibold" data-testid="text-quantity">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 hover:bg-muted transition-colors"
                      disabled={quantity >= 10 || quantity >= getSelectedColorStock()}
                      data-testid="button-quantity-increase"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-3 flex-1">
                  <Button 
                    className="btn-primary flex-1 rounded-lg py-6 text-base font-semibold"
                    onClick={handleAddToCart}
                    disabled={addingToCart || getSelectedColorStock() === 0}
                    data-testid="button-add-to-cart"
                  >
                    {addingToCart ? <Loader2 className="h-5 w-5 animate-spin" /> : getSelectedColorStock() === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                  </Button>
                  <Button 
                    className="btn-gold flex-1 rounded-lg py-6 text-base font-semibold"
                    disabled={getSelectedColorStock() === 0}
                    onClick={handleBuyNow}
                    data-testid="button-buy-now"
                  >
                    {getSelectedColorStock() === 0 ? "OUT OF STOCK" : "BUY NOW"}
                  </Button>
                </div>
              </div>

              <button 
                onClick={handleWishlist}
                className="flex items-center gap-2 text-primary hover:underline"
                data-testid="button-wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                {isWishlisted ? "ADDED TO WISHLIST" : "ADD TO WISHLIST"}
              </button>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Pin Code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary bg-background"
                  data-testid="input-pincode"
                />
                <Button className="btn-primary px-6" data-testid="button-check-pincode">Check</Button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <a href={storeInfo.social.facebook} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-blue-600 text-white hover:opacity-90 transition-opacity" data-testid="link-product-facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href={storeInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white hover:opacity-90 transition-opacity" data-testid="link-product-instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-share"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">COD</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">7 days Exchange</p>
                  <p className="text-xs text-muted-foreground">No Return</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Free</p>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="description" className="max-w-4xl">
            <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                data-testid="tab-description"
              >
                DESCRIPTION
              </TabsTrigger>
              {hasSizeChart && (
                <TabsTrigger
                  value="sizechart"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                  data-testid="tab-sizechart"
                >
                  SIZE CHART
                </TabsTrigger>
              )}
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                data-testid="tab-reviews"
              >
                REVIEWS ({reviews.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                {product.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                ) : (
                  <p className="text-muted-foreground">No description available for this product.</p>
                )}
              </div>
            </TabsContent>

            {hasSizeChart && (
              <TabsContent value="sizechart" className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="border p-3 text-left font-semibold bg-secondary/50">Size</th>
                        {product.sizeChart?.fieldNames?.map(field => (
                          <th key={field} className="border p-3 text-left font-semibold bg-secondary/50 capitalize">{field}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizeChart?.rows?.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-secondary/30 transition-colors">
                          <td className="border p-3 font-semibold">{row.size}</td>
                          {product.sizeChart?.fieldNames?.map(field => (
                            <td key={field} className="border p-3 text-muted-foreground">{row[field] || '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}

            <TabsContent value="reviews" className="pt-6">
              <div className="space-y-6">
                {!showReviewForm && (
                  <Button
                    onClick={handleOpenReviewForm}
                    className="btn-primary"
                    data-testid="button-write-review"
                  >
                    Write a Review
                  </Button>
                )}

                {showReviewForm && (
                  <div className="bg-secondary/20 border border-border rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Share your feedback</h3>

                    {fetchingOrders ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading your orders...
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          Only verified buyers can leave reviews. Please purchase this product first.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Select Order</label>
                        <select
                          value={selectedOrderId || ''}
                          onChange={(e) => setSelectedOrderId(e.target.value)}
                          disabled={submittingReview}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                          data-testid="select-order-for-review"
                        >
                          <option value="">Select an order...</option>
                          {userOrders.map((order) => (
                            <option key={order._id} value={order._id}>
                              Order #{order.orderId} - {new Date(order.createdAt).toLocaleDateString()}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                            className="text-3xl transition-colors"
                            disabled={userOrders.length === 0 || submittingReview}
                            data-testid={`button-star-${star}`}
                          >
                            <span className={star <= reviewFormData.rating ? 'text-yellow-500' : 'text-muted-foreground'}>
                              ★
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Title</label>
                      <input
                        type="text"
                        placeholder="Summary of your experience"
                        value={reviewFormData.title}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                        disabled={submittingReview || userOrders.length === 0}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        data-testid="input-review-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Review</label>
                      <textarea
                        placeholder="Tell us about your experience with this product..."
                        value={reviewFormData.comment}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                        disabled={submittingReview || userOrders.length === 0}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
                        rows={4}
                        data-testid="textarea-review-comment"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Add Photos (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReviewImageChange}
                        disabled={submittingReview || userOrders.length === 0}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        data-testid="input-review-images"
                      />
                      {reviewFormData.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {reviewFormData.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt="Review" className="w-full h-20 object-cover rounded" />
                              <button
                                onClick={() => removeReviewImage(idx)}
                                disabled={submittingReview}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                type="button"
                                data-testid={`button-remove-image-${idx}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                        disabled={submittingReview}
                        data-testid="button-cancel-review"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={submittingReview || userOrders.length === 0 || !selectedOrderId}
                        className="btn-primary"
                        data-testid="button-submit-review"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    <>
                      <h3 className="font-semibold text-foreground">Customer Reviews</h3>
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-border pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-foreground">{review.userId?.name || 'Anonymous'}</span>
                            <span className="text-yellow-500" data-testid="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                          </div>
                          {review.title && <p className="font-medium text-foreground">{review.title}</p>}
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="py-10 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link key={p._id} to={`/product/${p.slug || p._id}`}>
                  <ProductCard product={{
                    id: p._id,
                    slug: p.slug,
                    name: p.name,
                    price: p.price,
                    originalPrice: p.comparePrice,
                    image: p.images?.[0] || '/placeholder-product.jpg',
                    category: typeof p.categoryId === 'object' ? p.categoryId?.name : 'Category',
                    discount: p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : undefined
                  }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasSizeChart && (
        <Dialog open={showSizeChartModal} onOpenChange={setShowSizeChartModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-size-chart">
            <DialogHeader>
              <DialogTitle className="text-xl">Size Chart - {product?.name}</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="border p-4 text-left font-semibold bg-secondary/50">Size</th>
                    {product?.sizeChart?.fieldNames?.map(field => (
                      <th key={field} className="border p-4 text-left font-semibold bg-secondary/50 capitalize">{field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {product?.sizeChart?.rows?.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-secondary/30 transition-colors">
                      <td className="border p-4 font-semibold">{row.size}</td>
                      {product?.sizeChart?.fieldNames?.map(field => (
                        <td key={field} className="border p-4 text-muted-foreground">{row[field] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
