import { useState, useEffect } from "react";
import { Search, Package, AlertTriangle, TrendingDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Product {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  images: string[];
  price: number;
  isActive: boolean;
  categoryId?: { name: string };
}

const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add");
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.get<{ products: Product[] }>('/admin/products');
      setProducts(data.products || []);
    } catch (error) {
      toast({ title: "Error loading inventory", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !adjustment) return;
    
    let finalStock = selectedProduct.stock;
    const adjustValue = parseInt(adjustment);
    
    if (adjustmentType === "add") {
      finalStock = selectedProduct.stock + adjustValue;
    } else if (adjustmentType === "subtract") {
      finalStock = Math.max(0, selectedProduct.stock - adjustValue);
    } else {
      finalStock = adjustValue;
    }

    try {
      await api.put(`/admin/products/${selectedProduct._id}`, { stock: finalStock });
      setProducts(products.map(p => p._id === selectedProduct._id ? { ...p, stock: finalStock } : p));
      toast({ title: "Stock updated successfully" });
      setSelectedProduct(null);
      setAdjustment("");
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                       p.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true :
                       filter === "low" ? (p.stock > 0 && p.stock <= 10) :
                       p.stock === 0;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 10).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0)
  };

  if (isLoading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Inventory Management</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Products</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">In Stock</div>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 cursor-pointer" onClick={() => setFilter("low")}>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Low Stock</div>
                <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 cursor-pointer" onClick={() => setFilter("out")}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-sm text-muted-foreground">Out of Stock</div>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Inventory Value</div>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          <Badge 
            variant={filter === "all" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All
          </Badge>
          <Badge 
            variant={filter === "low" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("low")}
          >
            Low Stock
          </Badge>
          <Badge 
            variant={filter === "out" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("out")}
          >
            Out of Stock
          </Badge>
        </div>
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">SKU</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-right p-3 font-medium">Price</th>
              <th className="text-right p-3 font-medium">Stock</th>
              <th className="text-right p-3 font-medium">Value</th>
              <th className="text-center p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-t" data-testid={`row-product-${product._id}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <span className="font-medium truncate max-w-xs">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-sm">{product.sku}</td>
                  <td className="p-3 text-muted-foreground">{product.categoryId?.name || "-"}</td>
                  <td className="p-3 text-right">₹{product.price}</td>
                  <td className="p-3 text-right">
                    <Badge variant={
                      product.stock === 0 ? "destructive" :
                      product.stock <= 10 ? "secondary" : "default"
                    }>
                      {product.stock}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">₹{(product.stock * product.price).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedProduct(product);
                        setAdjustment("");
                        setAdjustmentType("add");
                      }}
                      data-testid={`button-adjust-${product._id}`}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1" /> Adjust
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {selectedProduct.images?.[0] && (
                  <img src={selectedProduct.images[0]} alt="" className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <p className="font-semibold">{selectedProduct.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
                  <p className="text-sm">Current Stock: <span className="font-bold">{selectedProduct.stock}</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                  <SelectTrigger data-testid="select-adjustment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="subtract">Remove Stock</SelectItem>
                    <SelectItem value="set">Set Exact Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {adjustmentType === "add" ? "Quantity to Add" :
                   adjustmentType === "subtract" ? "Quantity to Remove" :
                   "New Stock Level"}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  placeholder="Enter quantity"
                  data-testid="input-adjustment"
                />
              </div>

              {adjustment && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    New stock level will be: <span className="font-bold">
                      {adjustmentType === "add" ? selectedProduct.stock + parseInt(adjustment || "0") :
                       adjustmentType === "subtract" ? Math.max(0, selectedProduct.stock - parseInt(adjustment || "0")) :
                       parseInt(adjustment || "0")}
                    </span>
                  </p>
                </div>
              )}

              <Button 
                onClick={handleStockUpdate} 
                className="w-full"
                disabled={!adjustment}
                data-testid="button-update-stock"
              >
                Update Stock
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
