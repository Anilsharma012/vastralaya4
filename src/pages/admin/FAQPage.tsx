import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, HelpCircle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const categories = ["General", "Orders", "Shipping", "Returns", "Payments", "Account", "Products"];

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 0,
    isActive: true
  });

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const data = await api.get<{ faqs: FAQ[] }>('/admin/faqs');
      setFaqs(data.faqs || []);
    } catch (error) {
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.put(`/admin/faqs/${editingFaq._id}`, formData);
        toast({ title: "FAQ updated" });
      } else {
        await api.post('/admin/faqs', { ...formData, order: faqs.length });
        toast({ title: "FAQ created" });
      }
      loadFaqs();
      closeDialog();
    } catch (error: any) {
      toast({ title: error.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await api.delete(`/admin/faqs/${id}`);
      setFaqs(faqs.filter(f => f._id !== id));
      toast({ title: "FAQ deleted" });
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      await api.put(`/admin/faqs/${faq._id}`, { isActive: !faq.isActive });
      setFaqs(faqs.map(f => f._id === faq._id ? { ...f, isActive: !f.isActive } : f));
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "General",
      order: 0,
      isActive: true
    });
  };

  const filteredFaqs = faqs.filter(f => {
    const matchSearch = f.question.toLowerCase().includes(search.toLowerCase()) ||
                       f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || f.category === categoryFilter;
    return matchSearch && matchCategory;
  }).sort((a, b) => a.order - b.order);

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  if (isLoading) {
    return <div className="p-6">Loading FAQs...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">FAQs</h1>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-faq">
          <Plus className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedFaqs).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No FAQs found. Add your first FAQ!
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                {category}
                <Badge variant="outline">{categoryFaqs.length}</Badge>
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {categoryFaqs.map((faq) => (
                  <AccordionItem 
                    key={faq._id} 
                    value={faq._id}
                    className="border rounded-md px-4"
                    data-testid={`accordion-faq-${faq._id}`}
                  >
                    <div className="flex items-center gap-2">
                      <AccordionTrigger className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          {!faq.isActive && <Badge variant="secondary">Inactive</Badge>}
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(faq);
                          }}
                          data-testid={`button-edit-${faq._id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(faq._id);
                          }}
                          data-testid={`button-delete-${faq._id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What is your question?"
                required
                data-testid="input-question"
              />
            </div>

            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Provide the answer..."
                rows={4}
                required
                data-testid="input-answer"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger data-testid="select-category-form">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {editingFaq ? "Update FAQ" : "Create FAQ"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQPage;
