import { useEffect, useState } from 'react';
import { api, Category, Subcategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    image: '',
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subcatsData, catsData] = await Promise.all([
        api.get<Subcategory[]>('/admin/subcategories'),
        api.get<Category[]>('/admin/categories'),
      ]);
      setSubcategories(subcatsData);
      setCategories(catsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubcategory) {
        await api.put(`/admin/subcategories/${editingSubcategory._id}`, formData);
        toast.success('Subcategory updated successfully');
      } else {
        await api.post('/admin/subcategories', formData);
        toast.success('Subcategory created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      categoryId: typeof subcategory.categoryId === 'string' ? subcategory.categoryId : subcategory.categoryId._id,
      name: subcategory.name,
      description: subcategory.description || '',
      image: subcategory.image || '',
      sortOrder: subcategory.sortOrder,
      isActive: subcategory.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await api.delete(`/admin/subcategories/${id}`);
      toast.success('Subcategory deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setEditingSubcategory(null);
    setFormData({ categoryId: '', name: '', description: '', image: '', sortOrder: 0, isActive: true });
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getCategoryName = (categoryId: string | Category) => {
    if (typeof categoryId === 'object') return categoryId.name;
    const cat = categories.find(c => c._id === categoryId);
    return cat?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-subcategories-title">Subcategories</h1>
          <p className="text-muted-foreground">Manage your product subcategories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} data-testid="button-add-subcategory">
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Parent Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger data-testid="select-parent-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-subcategory-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="input-subcategory-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-subcategory-image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  data-testid="input-subcategory-sort"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-subcategory-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button type="submit" className="w-full" data-testid="button-save-subcategory">
                {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subcategories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : subcategories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No subcategories found. Create your first subcategory!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent Category</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategories.map((subcategory) => (
                  <TableRow key={subcategory._id} data-testid={`row-subcategory-${subcategory._id}`}>
                    <TableCell className="font-medium">{subcategory.name}</TableCell>
                    <TableCell>{getCategoryName(subcategory.categoryId)}</TableCell>
                    <TableCell>{subcategory.sortOrder}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${subcategory.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                        {subcategory.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(subcategory)} data-testid={`button-edit-subcategory-${subcategory._id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(subcategory._id)} data-testid={`button-delete-subcategory-${subcategory._id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}