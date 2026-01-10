import { useEffect, useState } from 'react';
import { api, Banner } from '@/lib/api';
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

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    targetLink: '',
    buttonText: '',
    placement: 'hero' as 'hero' | 'promo' | 'sidebar',
    priority: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await api.get<Banner[]>('/admin/banners');
      setBanners(data);
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value.toString());
    });
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      if (editingBanner) {
        await api.put(`/admin/banners/${editingBanner._id}`, formDataToSend);
        toast.success('Banner updated successfully');
      } else {
        await api.post('/admin/banners', formDataToSend);
        toast.success('Banner created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      loadBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setImageFile(null);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      targetLink: banner.targetLink || '',
      buttonText: banner.buttonText || '',
      placement: banner.placement,
      priority: banner.priority,
      isActive: banner.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      toast.success('Banner deleted successfully');
      loadBanners();
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setEditingBanner(null);
    setImageFile(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      targetLink: '',
      buttonText: '',
      placement: 'hero',
      priority: 0,
      isActive: true,
    });
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-banners-title">Banners</h1>
          <p className="text-muted-foreground">Manage your promotional banners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} data-testid="button-add-banner">
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  data-testid="input-banner-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  data-testid="input-banner-subtitle"
                />
              </div>
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="h-40 w-full rounded-md border bg-muted overflow-hidden flex items-center justify-center">
                  {(imageFile || formData.imageUrl) ? (
                    <img 
                      src={imageFile ? URL.createObjectURL(imageFile) : (formData.imageUrl.startsWith('http') ? formData.imageUrl : `${import.meta.env.VITE_API_URL || ''}${formData.imageUrl}`)} 
                      alt="Preview" 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-muted-foreground">No image selected</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  data-testid="input-banner-upload"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Or Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  required={!imageFile}
                  data-testid="input-banner-image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLink">Target Link</Label>
                <Input
                  id="targetLink"
                  value={formData.targetLink}
                  onChange={(e) => setFormData({ ...formData, targetLink: e.target.value })}
                  placeholder="/category/sarees"
                  data-testid="input-banner-link"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Shop Now"
                  data-testid="input-banner-button"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placement">Placement</Label>
                  <Select value={formData.placement} onValueChange={(value: 'hero' | 'promo' | 'sidebar') => setFormData({ ...formData, placement: value })}>
                    <SelectTrigger data-testid="select-banner-placement">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="promo">Promo</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    data-testid="input-banner-priority"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-banner-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button type="submit" className="w-full" data-testid="button-save-banner">
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : banners.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No banners found. Create your first banner!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner._id} data-testid={`row-banner-${banner._id}`}>
                    <TableCell>
                      <div className="h-12 w-20 rounded overflow-hidden bg-muted">
                        <img 
                          src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `${import.meta.env.VITE_API_URL || ''}${banner.imageUrl}`} 
                          alt={banner.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell className="capitalize">{banner.placement}</TableCell>
                    <TableCell>{banner.priority}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${banner.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)} data-testid={`button-edit-banner-${banner._id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(banner._id)} data-testid={`button-delete-banner-${banner._id}`}>
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