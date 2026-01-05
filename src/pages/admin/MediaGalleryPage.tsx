import { useState, useEffect } from "react";
import { Upload, Trash2, Search, Image, Copy, Check, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface MediaItem {
  _id: string;
  url: string;
  filename: string;
  type: string;
  size: number;
  alt?: string;
  tags?: string[];
  usedIn?: string[];
  createdAt: string;
}

const MediaGalleryPage = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const data = await api.get<{ media: MediaItem[] }>('/admin/media');
      setMedia(data.media || []);
    } catch (error) {
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadUrl) {
      toast({ title: "Please enter an image URL", variant: "destructive" });
      return;
    }
    try {
      await api.post('/admin/media', { url: uploadUrl });
      toast({ title: "Image added to gallery" });
      loadMedia();
      setIsUploadDialogOpen(false);
      setUploadUrl("");
    } catch (error: any) {
      toast({ title: error.message || "Upload failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/admin/media/${id}`);
      setMedia(media.filter(m => m._id !== id));
      setSelectedMedia(null);
      toast({ title: "Image deleted" });
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({ title: "URL copied to clipboard" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const filteredMedia = media.filter(m =>
    m.filename?.toLowerCase().includes(search.toLowerCase()) ||
    m.alt?.toLowerCase().includes(search.toLowerCase()) ||
    m.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return <div className="p-6">Loading media...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Media Gallery</h1>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsUploadDialogOpen(true)} data-testid="button-upload">
            <Upload className="mr-2 h-4 w-4" /> Add Image
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search media..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No media found</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding images to your gallery
            </p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Add Image
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <Card 
              key={item._id} 
              className="cursor-pointer hover-elevate overflow-hidden"
              onClick={() => setSelectedMedia(item)}
              data-testid={`card-media-${item._id}`}
            >
              <div className="aspect-square relative">
                <img
                  src={item.url}
                  alt={item.alt || item.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Error";
                  }}
                />
              </div>
              <CardContent className="p-2">
                <p className="text-xs truncate">{item.filename || "Image"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Preview</th>
                <th className="text-left p-3 font-medium">Filename</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-right p-3 font-medium">Size</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map((item) => (
                <tr key={item._id} className="border-t" data-testid={`row-media-${item._id}`}>
                  <td className="p-3">
                    <img
                      src={item.url}
                      alt={item.alt || ""}
                      className="w-12 h-12 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedMedia(item)}
                    />
                  </td>
                  <td className="p-3 font-medium max-w-xs truncate">
                    {item.filename || "Unnamed"}
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{item.type || "image"}</Badge>
                  </td>
                  <td className="p-3 text-right text-muted-foreground">
                    {formatFileSize(item.size || 0)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyUrl(item.url)}
                      >
                        {copiedUrl === item.url ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || ""}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Filename</Label>
                  <p>{selectedMedia.filename || "Unnamed"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Size</Label>
                  <p>{formatFileSize(selectedMedia.size || 0)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={selectedMedia.url} readOnly className="font-mono text-xs" />
                    <Button size="icon" variant="outline" onClick={() => copyUrl(selectedMedia.url)}>
                      {copiedUrl === selectedMedia.url ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedMedia._id)}
                  data-testid="button-delete-selected"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Image to Gallery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-upload-url"
              />
              <p className="text-xs text-muted-foreground">
                Enter the URL of the image you want to add
              </p>
            </div>
            {uploadUrl && (
              <div className="border rounded-md p-2">
                <img
                  src={uploadUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Invalid+URL";
                  }}
                />
              </div>
            )}
            <Button onClick={handleUpload} className="w-full" data-testid="button-submit-upload">
              Add to Gallery
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaGalleryPage;
