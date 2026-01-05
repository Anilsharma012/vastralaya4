import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Megaphone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "promo";
  target: "all" | "users" | "influencers";
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "success" | "promo",
    target: "all" as "all" | "users" | "influencers",
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: ""
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await api.get<{ announcements: Announcement[] }>('/admin/announcements');
      setAnnouncements(data.announcements || []);
    } catch (error) {
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        endDate: formData.endDate || undefined
      };

      if (editingAnnouncement) {
        await api.put(`/admin/announcements/${editingAnnouncement._id}`, payload);
        toast({ title: "Announcement updated" });
      } else {
        await api.post('/admin/announcements', payload);
        toast({ title: "Announcement created" });
      }
      loadAnnouncements();
      closeDialog();
    } catch (error: any) {
      toast({ title: error.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a._id !== id));
      toast({ title: "Announcement deleted" });
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleToggle = async (announcement: Announcement) => {
    try {
      await api.put(`/admin/announcements/${announcement._id}`, { isActive: !announcement.isActive });
      setAnnouncements(announcements.map(a => a._id === announcement._id ? { ...a, isActive: !a.isActive } : a));
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      target: announcement.target,
      isActive: announcement.isActive,
      startDate: announcement.startDate?.split('T')[0] || "",
      endDate: announcement.endDate?.split('T')[0] || ""
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      message: "",
      type: "info",
      target: "all",
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: ""
    });
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case "success": return "default";
      case "warning": return "secondary";
      case "promo": return "outline";
      default: return "secondary";
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.message.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading announcements...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Announcements</h1>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-announcement">
          <Plus className="mr-2 h-4 w-4" /> Add Announcement
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="grid gap-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No announcements found
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement._id} data-testid={`card-announcement-${announcement._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <Badge variant={getTypeColor(announcement.type)}>
                          {announcement.type}
                        </Badge>
                        <Badge variant="outline">{announcement.target}</Badge>
                        {!announcement.isActive && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(announcement.startDate).toLocaleDateString()}
                          {announcement.endDate && ` - ${new Date(announcement.endDate).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={announcement.isActive}
                      onCheckedChange={() => handleToggle(announcement)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(announcement)}
                      data-testid={`button-edit-${announcement._id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(announcement._id)}
                      data-testid={`button-delete-${announcement._id}`}
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

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Add Announcement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
                required
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Announcement message"
                rows={3}
                required
                data-testid="input-message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={formData.target}
                  onValueChange={(v: any) => setFormData({ ...formData, target: v })}
                >
                  <SelectTrigger data-testid="select-target">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Customers Only</SelectItem>
                    <SelectItem value="influencers">Influencers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  data-testid="input-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  data-testid="input-end-date"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-active"
              />
              <Label>Active</Label>
            </div>

            <Button type="submit" className="w-full" data-testid="button-submit">
              {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsPage;
