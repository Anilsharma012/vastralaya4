import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Package, Eye, X, ImagePlus, Upload, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  _id: string;
  name: string;
  categoryId: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: Category;
  subcategoryId?: Subcategory;
  images: string[];
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  sizeChart?: {
    fieldNames: string[];
    rows: any[];
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
  createdAt: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    images: "",
    price: "",
    comparePrice: "",
    sku: "",
    stock: "",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false
  });

  const [sizeChartFieldNames, setSizeChartFieldNames] = useState<string[]>([]);
  const [sizeChartRows, setSizeChartRows] = useState<any[]>([]);
  const [showSizeChartForm, setShowSizeChartForm] = useState(false);

  const [sizeInventory, setSizeInventory] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      loadSubcategories(formData.categoryId);
    }
  }, [formData.categoryId]);

  const loadProducts = async () => {
    try {
      const data = await api.get<{ products: Product[] }>('/admin/products');
      setProducts(data.products);
    } catch (error) {
      toast({ title: "Error loading products", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.get<Category[]>('/admin/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const data = await api.get<Subcategory[]>(`/admin/subcategories?categoryId=${categoryId}`);
      setSubcategories(data);
    } catch (error) {
      console.error('Failed to load subcategories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto-generate slug if empty
      const slug = formData.slug.trim() || generateSlug(formData.name);

      // Build size chart only if it has valid data (non-empty rows with actual values)
      const validRows = sizeChartRows.filter(row => {
        if (!row.size || !row.size.trim()) return false;
        return Object.values(row).some((val: any) => val && val.toString().trim());
      });

      const sizeChart = sizeChartFieldNames.length > 0 && validRows.length > 0 ? {
        fieldNames: sizeChartFieldNames,
        rows: validRows
      } : undefined;

      // Check if any size inventory is set
      const hasSizeInventory = Object.values(sizeInventory).some(val => val > 0);

      const payload = {
        ...formData,
        slug,
        images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        stock: parseInt(formData.stock) || 0,
        subcategoryId: formData.subcategoryId || undefined,
        sizeChart,
        sizeInventory: hasSizeInventory ? sizeInventory : undefined
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
        toast({ title: "Product updated successfully" });
      } else {
        await api.post('/admin/products', payload);
        toast({ title: "Product created successfully" });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      toast({ title: error.message || "Error saving product", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast({ title: "Product deleted successfully" });
      loadProducts();
    } catch (error) {
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setSizeInventory({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
    setFormData({
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      subcategoryId: "",
      images: "",
      price: "",
      comparePrice: "",
      sku: "",
      stock: "",
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false
    });
    setSizeChartFieldNames([]);
    setSizeChartRows([]);
    setShowSizeChartForm(false);
    setEditingProduct(null);
  };

  const openEditDialog = async (product: Product) => {
    try {
      // Fetch full product details to ensure we have all data including sizeChart
      const fullProduct = await api.get<Product>(`/admin/products/${product._id}`);

      setEditingProduct(fullProduct);
      setFormData({
        name: fullProduct.name,
        slug: fullProduct.slug,
        description: fullProduct.description || "",
        categoryId: typeof fullProduct.categoryId === 'object' ? fullProduct.categoryId._id : fullProduct.categoryId,
        subcategoryId: fullProduct.subcategoryId ? (typeof fullProduct.subcategoryId === 'object' ? fullProduct.subcategoryId._id : fullProduct.subcategoryId) : "",
        images: fullProduct.images.join(', '),
        price: fullProduct.price.toString(),
        comparePrice: fullProduct.comparePrice?.toString() || "",
        sku: fullProduct.sku,
        stock: fullProduct.stock.toString(),
        isActive: fullProduct.isActive,
        isFeatured: fullProduct.isFeatured,
        isNewArrival: fullProduct.isNewArrival,
        isBestSeller: fullProduct.isBestSeller
      });

      if (fullProduct.sizeChart && fullProduct.sizeChart.fieldNames && fullProduct.sizeChart.fieldNames.length > 0) {
        setSizeChartFieldNames([...fullProduct.sizeChart.fieldNames]);
        setSizeChartRows([...fullProduct.sizeChart.rows]);
        setShowSizeChartForm(true);
      } else {
        setSizeChartFieldNames([]);
        setSizeChartRows([]);
        setShowSizeChartForm(false);
      }

      // Load size inventory if available
      if (fullProduct.sizeInventory) {
        setSizeInventory({
          S: fullProduct.sizeInventory.S || 0,
          M: fullProduct.sizeInventory.M || 0,
          L: fullProduct.sizeInventory.L || 0,
          XL: fullProduct.sizeInventory.XL || 0,
          XXL: fullProduct.sizeInventory.XXL || 0
        });
      } else {
        setSizeInventory({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
      }

      setIsDialogOpen(true);
    } catch (error) {
      toast({ title: "Error loading product details", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({
                        ...formData,
                        name: newName,
                        slug: !editingProduct ? generateSlug(newName) : formData.slug
                      });
                    }}
                    required
                    data-testid="input-product-name"
                  />
                </div>
                <div className="col-span-2">
                  <Label>URL Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="product-url-slug"
                    required
                    data-testid="input-product-slug"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used in product URLs. Auto-generated from name, can be customized.</p>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="input-product-description" />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v, subcategoryId: "" })}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subcategory</Label>
                  <Select value={formData.subcategoryId} onValueChange={(v) => setFormData({ ...formData, subcategoryId: v })}>
                    <SelectTrigger data-testid="select-subcategory">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(sub => (
                        <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price (INR) *</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required data-testid="input-product-price" />
                </div>
                <div>
                  <Label>Compare Price (MRP)</Label>
                  <Input type="number" step="0.01" value={formData.comparePrice} onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })} data-testid="input-compare-price" />
                </div>
                <div>
                  <Label>SKU *</Label>
                  <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} required data-testid="input-product-sku" />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} data-testid="input-product-stock" />
                </div>
                <div className="col-span-2 space-y-3">
                  <Label>Product Images</Label>
                  <div className="flex gap-2 mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.multiple = true;
                        input.onchange = (e: any) => {
                          const files = Array.from(e.target.files as FileList);
                          const maxFileSize = 2 * 1024 * 1024; // 2MB per file
                          const validFiles: File[] = [];
                          const currentUrls = formData.images.split(',').filter(u => u.trim());

                          // Validate files first
                          for (const file of files) {
                            if (file.size > maxFileSize) {
                              toast({
                                title: "File too large",
                                description: `${file.name} is larger than 2MB. Please compress and try again.`,
                                variant: "destructive"
                              });
                              continue;
                            }
                            if (!file.type.startsWith('image/')) {
                              toast({
                                title: "Invalid file type",
                                description: `${file.name} is not a valid image file.`,
                                variant: "destructive"
                              });
                              continue;
                            }
                            validFiles.push(file);
                          }

                          if (validFiles.length === 0) return;

                          // Read all files and update state once
                          let filesRead = 0;
                          const newUrls = [...currentUrls];

                          validFiles.forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (event: any) => {
                              newUrls.push(event.target.result);
                              filesRead++;
                              if (filesRead === validFiles.length) {
                                setFormData({ ...formData, images: newUrls.join(', ') });
                                toast({
                                  title: "Success",
                                  description: `${validFiles.length} image(s) uploaded successfully`
                                });
                              }
                            };
                            reader.onerror = () => {
                              toast({
                                title: "Error reading file",
                                description: `Failed to read ${file.name}`,
                                variant: "destructive"
                              });
                              filesRead++;
                              if (filesRead === validFiles.length) {
                                setFormData({ ...formData, images: newUrls.join(', ') });
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        };
                        input.click();
                      }}
                      className="gap-2"
                      data-testid="button-upload-images"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Images
                    </Button>
                    <span className="text-xs text-muted-foreground self-center">Or add image URLs below (recommended)</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {formData.images.split(',').filter(url => url.trim()).map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="w-24 h-24 rounded-lg border-2 border-border bg-muted flex items-center justify-center overflow-hidden relative">
                          <img
                            src={url.trim()}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const parent = img.parentElement;
                              if (parent && !parent.querySelector('[data-error]')) {
                                const errorEl = document.createElement('div');
                                errorEl.setAttribute('data-error', 'true');
                                errorEl.className = 'text-xs text-center text-muted-foreground absolute inset-0 flex flex-col items-center justify-center px-1 bg-red-50 dark:bg-red-950/20';
                                errorEl.textContent = '⚠️ Load Failed';
                                parent.appendChild(errorEl);
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const urls = formData.images.split(',').filter(u => u.trim());
                            urls.splice(index, 1);
                            setFormData({ ...formData, images: urls.join(', ') });
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          data-testid={`button-remove-image-${index}`}
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[11px] text-center py-1 rounded-b-lg font-semibold">Main</span>
                        )}
                      </div>
                    ))}
                    <div
                      className="w-24 h-24 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url && url.trim()) {
                          const urls = formData.images.split(',').filter(u => u.trim());
                          urls.push(url.trim());
                          setFormData({ ...formData, images: urls.join(', ') });
                          toast({
                            title: "Image URL added",
                            description: "Image preview will appear once loaded"
                          });
                        }
                      }}
                      data-testid="button-add-image"
                      title="Add image URL"
                    >
                      <div className="text-center">
                        <ImagePlus className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">Add URL</span>
                      </div>
                    </div>
                  </div>
                  <Input 
                    value={formData.images} 
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })} 
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                    className="text-xs"
                    data-testid="input-product-images" 
                  />
                  <div className="text-xs text-muted-foreground space-y-1 bg-blue-50 dark:bg-blue-950/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">💡 Tip: Use external image URLs for best results</p>
                    <p>First image will be used as the main product image. Separate multiple URLs with commas.</p>
                    <p className="text-[11px]">Example: https://example.com/image1.jpg, https://example.com/image2.jpg</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!showSizeChartForm && sizeChartFieldNames.length === 0) {
                        // Initialize with default fields when first opening
                        setSizeChartFieldNames(['chest', 'waist', 'length']);
                        setSizeChartRows([{ size: 'S', chest: '', waist: '', length: '' }]);
                      }
                      setShowSizeChartForm(!showSizeChartForm);
                    }}
                    className="w-full gap-2"
                  >
                    <Settings2 className="h-4 w-4" />
                    {showSizeChartForm ? 'Hide Size Chart' : 'Add/Edit Size Chart'}
                  </Button>
                </div>

                {showSizeChartForm && (
                  <div className="col-span-2 border rounded-lg p-4 space-y-4 bg-secondary/30">
                    <h4 className="font-semibold text-foreground">Size Chart Configuration</h4>

                    <div className="space-y-2">
                      <Label>Field Names (e.g., chest, waist, length)</Label>
                      <div className="flex flex-wrap gap-2">
                        {sizeChartFieldNames.map((field, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-background border rounded-md px-2 py-1">
                            <Input
                              type="text"
                              value={field}
                              onChange={(e) => {
                                const newFields = [...sizeChartFieldNames];
                                newFields[idx] = e.target.value.toLowerCase().replace(/\s+/g, '');
                                setSizeChartFieldNames(newFields);
                                // Update rows with new field names
                                const newRows = sizeChartRows.map(row => {
                                  const oldValue = row[field];
                                  const newRow = { ...row };
                                  delete newRow[field];
                                  newRow[e.target.value.toLowerCase().replace(/\s+/g, '')] = oldValue || '';
                                  return newRow;
                                });
                                setSizeChartRows(newRows);
                              }}
                              className="h-6 w-24 text-xs"
                              placeholder="field name"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFields = sizeChartFieldNames.filter((_, i) => i !== idx);
                                setSizeChartFieldNames(newFields);
                                const newRows = sizeChartRows.map(row => {
                                  const newRow = { ...row };
                                  delete newRow[field];
                                  return newRow;
                                });
                                setSizeChartRows(newRows);
                              }}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSizeChartFieldNames([...sizeChartFieldNames, 'field'])}
                        >
                          + Add Field
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Size Measurements</Label>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="border p-2 text-left font-semibold">Size</th>
                              {sizeChartFieldNames.map(field => (
                                <th key={field} className="border p-2 text-left font-semibold capitalize">{field}</th>
                              ))}
                              <th className="border p-2 text-left font-semibold">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sizeChartRows.map((row, rowIdx) => (
                              <tr key={rowIdx} className="border-b">
                                <td className="border p-2">
                                  <Input
                                    type="text"
                                    value={row.size}
                                    onChange={(e) => {
                                      const newRows = [...sizeChartRows];
                                      newRows[rowIdx].size = e.target.value;
                                      setSizeChartRows(newRows);
                                    }}
                                    placeholder="Size (e.g., S, M, L)"
                                    className="h-8"
                                  />
                                </td>
                                {sizeChartFieldNames.map(field => (
                                  <td key={field} className="border p-2">
                                    <Input
                                      type="text"
                                      value={row[field] || ''}
                                      onChange={(e) => {
                                        const newRows = [...sizeChartRows];
                                        newRows[rowIdx][field] = e.target.value;
                                        setSizeChartRows(newRows);
                                      }}
                                      placeholder="Value"
                                      className="h-8"
                                    />
                                  </td>
                                ))}
                                <td className="border p-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newRows = sizeChartRows.filter((_, i) => i !== rowIdx);
                                      setSizeChartRows(newRows);
                                    }}
                                    className="text-destructive hover:text-destructive/80"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newRow = { size: '' };
                          sizeChartFieldNames.forEach(field => {
                            newRow[field] = '';
                          });
                          setSizeChartRows([...sizeChartRows, newRow]);
                        }}
                      >
                        + Add Size Row
                      </Button>
                    </div>
                  </div>
                )}

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({ ...formData, isActive: c })} data-testid="switch-active" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Featured</Label>
                    <Switch checked={formData.isFeatured} onCheckedChange={(c) => setFormData({ ...formData, isFeatured: c })} data-testid="switch-featured" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>New Arrival</Label>
                    <Switch checked={formData.isNewArrival} onCheckedChange={(c) => setFormData({ ...formData, isNewArrival: c })} data-testid="switch-new-arrival" />
                  </div>
                  <div className="flex items-center justify-between">
                  <Label>Best Seller</Label>
                  <Switch checked={formData.isBestSeller} onCheckedChange={(c) => setFormData({ ...formData, isBestSeller: c })} data-testid="switch-best-seller" />
                </div>
              </div>

              <div className="col-span-2 border-t pt-4 mt-4">
                <h4 className="font-semibold text-foreground mb-4">Size Inventory Management</h4>
                <p className="text-sm text-muted-foreground mb-4">Set inventory for each size (S, M, L, XL, XXL)</p>
                <div className="grid grid-cols-5 gap-3">
                  {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => (
                    <div key={size}>
                      <Label className="text-sm">{size}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={sizeInventory[size]}
                        onChange={(e) => setSizeInventory({ ...sizeInventory, [size]: parseInt(e.target.value) || 0 })}
                        data-testid={`input-size-${size}`}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="button-save-product">{editingProduct ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-products" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-40 bg-muted animate-pulse rounded mb-4" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first product</p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-product">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product._id} data-testid={`card-product-${product._id}`}>
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-md mb-3 overflow-hidden">
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium line-clamp-2">{product.name}</h3>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Rs. {product.price.toLocaleString()}</span>
                    {product.comparePrice && (
                      <span className="text-sm text-muted-foreground line-through">Rs. {product.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-sm">Stock: <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>{product.stock}</span></p>
                  <div className="flex flex-wrap gap-1">
                    {product.isFeatured && <Badge variant="outline">Featured</Badge>}
                    {product.isNewArrival && <Badge variant="outline">New</Badge>}
                    {product.isBestSeller && <Badge variant="outline">Best Seller</Badge>}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} data-testid={`button-edit-${product._id}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(product._id)} data-testid={`button-delete-${product._id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
