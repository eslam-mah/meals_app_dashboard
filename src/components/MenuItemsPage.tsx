
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, MenuItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface JSONBItem {
  name_ar: string;
  name_en: string;
  price: number;
}

const MenuItemsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: 0,
    meal_type: 'menu',
    sizes: [] as JSONBItem[],
    extras: [] as JSONBItem[],
    beverages: [] as JSONBItem[],
  });

  const queryClient = useQueryClient();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('food')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('food')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      let food_picture = '';
      if (imageFile) {
        food_picture = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('menu_items')
        .insert([{ ...data, food_picture }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Menu item created successfully!');
    },
    onError: (error) => {
      toast.error('Error creating menu item: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      let updateData = { ...data };
      
      if (imageFile) {
        const food_picture = await uploadImage(imageFile);
        updateData.food_picture = food_picture;
      }

      const { error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Menu item updated successfully!');
    },
    onError: (error) => {
      toast.error('Error updating menu item: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Menu item deleted successfully!');
    },
    onError: (error) => {
      toast.error('Error deleting menu item: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      price: 0,
      meal_type: 'menu',
      sizes: [],
      extras: [],
      beverages: [],
    });
    setEditingItem(null);
    setImageFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name_ar: item.name_ar || '',
      name_en: item.name_en || '',
      description_ar: item.description_ar || '',
      description_en: item.description_en || '',
      price: item.price || 0,
      meal_type: item.meal_type || 'menu',
      sizes: item.sizes || [],
      extras: item.extras || [],
      beverages: item.beverages || [],
    });
    setIsDialogOpen(true);
  };

  const addJSONBItem = (type: 'sizes' | 'extras' | 'beverages') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name_ar: '', name_en: '', price: 0 }]
    }));
  };

  const updateJSONBItem = (type: 'sizes' | 'extras' | 'beverages', index: number, field: keyof JSONBItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeJSONBItem = (type: 'sizes' | 'extras' | 'beverages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const JSONBSection = ({ title, type }: { title: string; type: 'sizes' | 'extras' | 'beverages' }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{title}</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => addJSONBItem(type)}>
          <Plus className="h-4 w-4 mr-1" />
          Add {title.slice(0, -1)}
        </Button>
      </div>
      {formData[type].map((item, index) => (
        <Card key={index} className="p-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input
              placeholder="Arabic Name"
              value={item.name_ar}
              onChange={(e) => updateJSONBItem(type, index, 'name_ar', e.target.value)}
            />
            <Input
              placeholder="English Name"
              value={item.name_en}
              onChange={(e) => updateJSONBItem(type, index, 'name_en', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => updateJSONBItem(type, index, 'price', parseFloat(e.target.value) || 0)}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeJSONBItem(type, index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Menu Items</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_ar">Arabic Name</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_en">English Name</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_ar">Arabic Description</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description_en">English Description</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meal_type">Meal Type</Label>
                  <Select value={formData.meal_type} onValueChange={(value) => setFormData(prev => ({ ...prev, meal_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menu">Menu</SelectItem>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="image">Food Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <JSONBSection title="Sizes" type="sizes" />
              <JSONBSection title="Extras" type="extras" />
              <JSONBSection title="Beverages" type="beverages" />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems?.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {item.food_picture && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={item.food_picture} 
                  alt={item.name_en} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name_en}</CardTitle>
                <Badge variant={item.meal_type === 'offer' ? 'destructive' : item.meal_type === 'recommended' ? 'default' : 'secondary'}>
                  {item.meal_type}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{item.name_ar}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{item.description_en}</p>
              <p className="text-lg font-bold text-orange-600 mb-4">EGP {item.price}</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuItemsPage;
