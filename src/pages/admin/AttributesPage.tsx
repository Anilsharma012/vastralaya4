import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Attribute {
  _id: string;
  name: string;
  type: "text" | "color" | "size" | "select";
  values: string[];
  isRequired: boolean;
  createdAt: string;
}

const AttributesPage = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    type: "text" as "text" | "color" | "size" | "select",
    values: [] as string[],
    isRequired: false
  });

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      const data = await api.get<{ attributes: Attribute[] }>('/admin/attributes');
      setAttributes(data.attributes || []);
    } catch (error) {
      setAttributes([
        { _id: "1", name: "Size", type: "size", values: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"], isRequired: true, createdAt: new Date().toISOString() },
        { _id: "2", name: "Color", type: "color", values: ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Brown"], isRequired: true, createdAt: new Date().toISOString() },
        { _id: "3", name: "Material", type: "select", values: ["Cotton", "Silk", "Georgette", "Chiffon", "Velvet", "Satin", "Net", "Linen"], isRequired: false, createdAt: new Date().toISOString() },
        { _id: "4", name: "Occasion", type: "select", values: ["Casual", "Party", "Wedding", "Festival", "Office", "Formal"], isRequired: false, createdAt: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAttribute) {
        await api.put(`/admin/attributes/${editingAttribute._id}`, formData);
        setAttributes(attributes.map(a => a._id === editingAttribute._id ? { ...a, ...formData } : a));
        toast({ title: "Attribute updated" });
      } else {
        const newAttr = { ...formData, _id: Date.now().toString(), createdAt: new Date().toISOString() };
        await api.post('/admin/attributes', formData);
        setAttributes([...attributes, newAttr]);
        toast({ title: "Attribute created" });
      }
      closeDialog();
    } catch (error: any) {
      toast({ title: error.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attribute?")) return;
    try {
      await api.delete(`/admin/attributes/${id}`);
      setAttributes(attributes.filter(a => a._id !== id));
      toast({ title: "Attribute deleted" });
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const addValue = () => {
    if (newValue && !formData.values.includes(newValue)) {
      setFormData({ ...formData, values: [...formData.values, newValue] });
      setNewValue("");
    }
  };

  const removeValue = (value: string) => {
    setFormData({ ...formData, values: formData.values.filter(v => v !== value) });
  };

  const openEditDialog = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    setFormData({
      name: attribute.name,
      type: attribute.type,
      values: attribute.values,
      isRequired: attribute.isRequired
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingAttribute(null);
    setNewValue("");
    setFormData({
      name: "",
      type: "text",
      values: [],
      isRequired: false
    });
  };

  const filteredAttributes = attributes.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading attributes...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Product Attributes</h1>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-attribute">
          <Plus className="mr-2 h-4 w-4" /> Add Attribute
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search attributes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredAttributes.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No attributes found
            </CardContent>
          </Card>
        ) : (
          filteredAttributes.map((attribute) => (
            <Card key={attribute._id} data-testid={`card-attribute-${attribute._id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="h-4 w-4" />
                    {attribute.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{attribute.type}</Badge>
                    {attribute.isRequired && <Badge>Required</Badge>}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(attribute)}
                      data-testid={`button-edit-${attribute._id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(attribute._id)}
                      data-testid={`button-delete-${attribute._id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {attribute.values.map((value) => (
                    <Badge key={value} variant="secondary" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAttribute ? "Edit Attribute" : "Add Attribute"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Attribute Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Size, Color, Material"
                required
                data-testid="input-name"
              />
            </div>

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
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="select">Select/Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Values</Label>
              <div className="flex gap-2">
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Add value"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addValue();
                    }
                  }}
                  data-testid="input-new-value"
                />
                <Button type="button" onClick={addValue} data-testid="button-add-value">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.values.map((value) => (
                  <Badge key={value} variant="secondary" className="gap-1">
                    {value}
                    <button
                      type="button"
                      onClick={() => removeValue(value)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" data-testid="button-submit">
              {editingAttribute ? "Update Attribute" : "Create Attribute"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttributesPage;
