import { useEffect, useState } from 'react';
import { api, Category, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, Instagram, Youtube, ExternalLink, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SocialMediaPost {
  _id: string;
  title: string;
  platform: 'instagram' | 'youtube';
  videoUrl: string;
  thumbnail: string;
  views: number;
  linkedType: 'product' | 'category' | 'external';
  linkedId?: string;
  externalUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function SocialMediaVideosPage() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    platform: 'instagram' as 'instagram' | 'youtube',
    videoUrl: '',
    thumbnail: '',
    views: 0,
    linkedType: 'product' as 'product' | 'category' | 'external',
    linkedId: '',
    externalUrl: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsData, categoriesData, productsData] = await Promise.all([
        api.get<{ posts: SocialMediaPost[] }>('/admin/social-media-posts'),
        api.get<Category[]>('/admin/categories'),
        api.get<{ products: Product[] }>('/admin/products'),
      ]);
      setPosts(postsData.posts || []);
      setCategories(categoriesData || []);
      setProducts(productsData.products || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        linkedId: formData.linkedType !== 'external' ? formData.linkedId : undefined,
        externalUrl: formData.linkedType === 'external' ? formData.externalUrl : undefined,
      };
      
      if (editingPost) {
        await api.put(`/admin/social-media-posts/${editingPost._id}`, payload);
        toast.success('Video updated successfully');
      } else {
        await api.post('/admin/social-media-posts', payload);
        toast.success('Video created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (post: SocialMediaPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      platform: post.platform,
      videoUrl: post.videoUrl,
      thumbnail: post.thumbnail,
      views: post.views,
      linkedType: post.linkedType,
      linkedId: post.linkedId || '',
      externalUrl: post.externalUrl || '',
      isActive: post.isActive,
      sortOrder: post.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/admin/social-media-posts/${id}`);
      toast.success('Video deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const handleToggle = async (post: SocialMediaPost) => {
    try {
      await api.patch(`/admin/social-media-posts/${post._id}/toggle`);
      toast.success(post.isActive ? 'Video disabled' : 'Video enabled');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Toggle failed');
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      platform: 'instagram',
      videoUrl: '',
      thumbnail: '',
      views: 0,
      linkedType: 'product',
      linkedId: '',
      externalUrl: '',
      isActive: true,
      sortOrder: 0,
    });
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-social-media-title">Social Media Videos</h1>
          <p className="text-muted-foreground">Manage Instagram/Reels-style video slider</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} data-testid="button-add-video">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Video' : 'Add New Video'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Video title"
                  required
                  data-testid="input-video-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: 'instagram' | 'youtube') => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.instagram.com/reel/..."
                  required
                  data-testid="input-video-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL *</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  required
                  data-testid="input-thumbnail"
                />
                {formData.thumbnail && (
                  <img 
                    src={formData.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-24 h-32 object-cover rounded-lg mt-2"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedType">Link Type *</Label>
                <Select
                  value={formData.linkedType}
                  onValueChange={(value: 'product' | 'category' | 'external') => 
                    setFormData({ ...formData, linkedType: value, linkedId: '', externalUrl: '' })
                  }
                >
                  <SelectTrigger data-testid="select-link-type">
                    <SelectValue placeholder="Select link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="external">External URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.linkedType === 'product' && (
                <div className="space-y-2">
                  <Label htmlFor="linkedId">Select Product *</Label>
                  <Select
                    value={formData.linkedId}
                    onValueChange={(value) => setFormData({ ...formData, linkedId: value })}
                  >
                    <SelectTrigger data-testid="select-product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.linkedType === 'category' && (
                <div className="space-y-2">
                  <Label htmlFor="linkedId">Select Category *</Label>
                  <Select
                    value={formData.linkedId}
                    onValueChange={(value) => setFormData({ ...formData, linkedId: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.linkedType === 'external' && (
                <div className="space-y-2">
                  <Label htmlFor="externalUrl">External URL *</Label>
                  <Input
                    id="externalUrl"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    placeholder="https://example.com"
                    data-testid="input-external-url"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="views">Initial Views</Label>
                  <Input
                    id="views"
                    type="number"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                    min={0}
                    data-testid="input-views"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    data-testid="input-sort-order"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit">
                  {editingPost ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Link Type</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No videos found
                </TableCell>
              </TableRow>
            ) : (
              filteredPosts.map((post) => (
                <TableRow key={post._id} data-testid={`row-video-${post._id}`}>
                  <TableCell>
                    <img 
                      src={post.thumbnail} 
                      alt={post.title}
                      className="w-16 h-20 object-cover rounded-md"
                      onError={(e) => (e.currentTarget.src = 'https://placehold.co/64x80?text=No+Image')}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{post.title}</div>
                    <a 
                      href={post.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View Video <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      {post.platform === 'instagram' ? (
                        <Instagram className="h-3 w-3" />
                      ) : (
                        <Youtube className="h-3 w-3" />
                      )}
                      {post.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {post.linkedType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {formatViews(post.views)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={post.isActive}
                      onCheckedChange={() => handleToggle(post)}
                      data-testid={`switch-status-${post._id}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post)}
                        data-testid={`button-edit-${post._id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post._id)}
                        data-testid={`button-delete-${post._id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
