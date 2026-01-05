import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Search, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Review {
  _id: string;
  userId: { _id: string; name: string; email: string };
  productId: { _id: string; name: string; images: string[] };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [adminImages, setAdminImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.get<{ reviews: Review[] }>('/admin/reviews');
      setReviews(data.reviews || []);
    } catch (error) {
      toast({ title: "Error loading reviews", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      await api.put(`/admin/reviews/${id}`, { isApproved: approve });
      setReviews(reviews.map(r => r._id === id ? { ...r, isApproved: approve } : r));
      toast({ title: approve ? "Review approved" : "Review rejected" });
    } catch (error) {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
      toast({ title: "Review deleted" });
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleAdminImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAdminImage = (index: number) => {
    setAdminImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAdminImages = async () => {
    if (!selectedReview || adminImages.length === 0) return;

    setUploadingImages(true);
    try {
      const updatedImages = [...(selectedReview.images || []), ...adminImages];
      await api.put(`/admin/reviews/${selectedReview._id}`, { images: updatedImages });

      setReviews(reviews.map(r =>
        r._id === selectedReview._id
          ? { ...r, images: updatedImages }
          : r
      ));

      setSelectedReview(prev => prev ? { ...prev, images: updatedImages } : null);
      setAdminImages([]);

      toast({ title: "Images added successfully" });
    } catch (error) {
      toast({ title: "Failed to upload images", variant: "destructive" });
    } finally {
      setUploadingImages(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase()) ||
                       r.comment?.toLowerCase().includes(search.toLowerCase()) ||
                       r.productId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true :
                       filter === "approved" ? r.isApproved :
                       !r.isApproved;
    return matchSearch && matchFilter;
  });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  if (isLoading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Reviews Management</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={filter === "all" ? "default" : "outline"} 
            className="cursor-pointer"
            onClick={() => setFilter("all")}
            data-testid="filter-all"
          >
            All ({reviews.length})
          </Badge>
          <Badge 
            variant={filter === "pending" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("pending")}
            data-testid="filter-pending"
          >
            Pending ({reviews.filter(r => !r.isApproved).length})
          </Badge>
          <Badge 
            variant={filter === "approved" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("approved")}
            data-testid="filter-approved"
          >
            Approved ({reviews.filter(r => r.isApproved).length})
          </Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="grid gap-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No reviews found
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review._id} data-testid={`card-review-${review._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1">
                    {review.productId?.images?.[0] && (
                      <img 
                        src={review.productId.images[0]} 
                        alt={review.productId.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <Badge variant={review.isApproved ? "default" : "secondary"}>
                          {review.isApproved ? "Approved" : "Pending"}
                        </Badge>
                        {review.isVerifiedPurchase && (
                          <Badge variant="outline">Verified Purchase</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold truncate">{review.title || "No title"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        <span>By: {review.userId?.name || review.userId?.email}</span>
                        <span>Product: {review.productId?.name}</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedReview(review)}
                      data-testid={`button-view-${review._id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!review.isApproved && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleApprove(review._id, true)}
                        data-testid={`button-approve-${review._id}`}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {review.isApproved && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleApprove(review._id, false)}
                        data-testid={`button-reject-${review._id}`}
                      >
                        <X className="h-4 w-4 text-orange-600" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(review._id)}
                      data-testid={`button-delete-${review._id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedReview} onOpenChange={(open) => {
        if (!open) {
          setSelectedReview(null);
          setAdminImages([]);
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(selectedReview.rating)}</div>
                <span className="text-sm text-muted-foreground">
                  {selectedReview.rating}/5
                </span>
              </div>
              <div>
                <p className="font-semibold">{selectedReview.title}</p>
                <p className="text-muted-foreground mt-2">{selectedReview.comment}</p>
              </div>
              {selectedReview.images?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Review Images</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedReview.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-semibold">Add Photos (Admin)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdminImageChange}
                  disabled={uploadingImages}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-sm"
                />

                {adminImages.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Preview ({adminImages.length} new)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {adminImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="Admin upload" className="w-full h-20 object-cover rounded border border-border" />
                          <button
                            onClick={() => removeAdminImage(idx)}
                            disabled={uploadingImages}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleUploadAdminImages}
                      disabled={uploadingImages || adminImages.length === 0}
                      className="w-full mt-3"
                    >
                      {uploadingImages ? "Uploading..." : `Upload ${adminImages.length} Image${adminImages.length !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 text-sm text-muted-foreground space-y-1">
                <p>Customer: {selectedReview.userId?.name} ({selectedReview.userId?.email})</p>
                <p>Product: {selectedReview.productId?.name}</p>
                <p>Date: {new Date(selectedReview.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsPage;
