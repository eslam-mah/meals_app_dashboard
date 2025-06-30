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
import { useLanguage } from '@/contexts/LanguageContext';

interface JSONBItem {
  name_ar: string;
  name_en: string;
  price: number;
}

const MenuItemsPage = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: '',
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

  const deleteImageFromStorage = async (imageUrl: string) => {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('food')
          .remove([fileName]);
      }
    } catch (error) {
      console.error('Error deleting image from storage:', error);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      let food_picture = '';
      if (imageFile) {
        food_picture = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('menu_items')
        .insert([{ ...data, price: parseFloat(data.price) || 0, food_picture }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success(t('menu_item_created'));
    },
    onError: (error) => {
      toast.error('Error creating menu item: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      let updateData = { ...data, price: parseFloat(data.price) || 0 };
      
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
      toast.success(t('menu_item_updated'));
    },
    onError: (error) => {
      toast.error('Error updating menu item: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: MenuItem) => {
      // Delete image from storage if exists
      if (item.food_picture) {
        await deleteImageFromStorage(item.food_picture);
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success(t('menu_item_deleted'));
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
      price: '',
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
      price: item.price ? item.price.toString() : '',
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
    const newFormData = {...formData};
    if (field === 'price') {
      newFormData[type][index][field] = parseFloat(value.toString()) || 0;
    } else {
      newFormData[type][index][field] = value;
    }
    setFormData(newFormData);
  };

  const removeJSONBItem = (type: 'sizes' | 'extras' | 'beverages', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const JSONBSection = ({ title, type }: { title: string; type: 'sizes' | 'extras' | 'beverages' }) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{title}</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addJSONBItem(type)}>
            <Plus className="h-4 w-4 mr-1" />
            {type === 'sizes' ? t('add_size') : type === 'extras' ? t('add_extra') : t('add_beverage')}
          </Button>
        </div>
        {formData[type].map((item, index) => (
          <Card key={index} className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={t('arabic_name')}
                  defaultValue={item.name_ar}
                  onBlur={(e) => {
                    const newItems = [...formData[type]];
                    newItems[index] = {...newItems[index], name_ar: e.target.value};
                    setFormData({...formData, [type]: newItems});
                  }}
                />
              </div>
              <div>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={t('english_name')}
                  defaultValue={item.name_en}
                  onBlur={(e) => {
                    const newItems = [...formData[type]];
                    newItems[index] = {...newItems[index], name_en: e.target.value};
                    setFormData({...formData, [type]: newItems});
                  }}
                />
              </div>
              <div>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  type="text"
                  placeholder={t('price')}
                  defaultValue={item.price === 0 ? '' : item.price}
                  onBlur={(e) => {
                    const newItems = [...formData[type]];
                    newItems[index] = {...newItems[index], price: parseFloat(e.target.value) || 0};
                    setFormData({...formData, [type]: newItems});
                  }}
                />
              </div>
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
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('menu_items')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              {t('add_menu_item')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? t('edit_menu_item') : t('add_menu_item')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_ar">{t('arabic_name')}</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_en">{t('english_name')}</Label>
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
                  <Label htmlFor="description_ar">{t('arabic_description')}</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description_en">{t('english_description')}</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t('price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder={t('price')}
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meal_type">{t('meal_type')}</Label>
                  <Select value={formData.meal_type} onValueChange={(value) => setFormData(prev => ({ ...prev, meal_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menu">{t('menu')}</SelectItem>
                      <SelectItem value="recommended">{t('recommended')}</SelectItem>
                      <SelectItem value="offer">{t('offer')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="image">{t('food_image')}</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <JSONBSection title={t('sizes')} type="sizes" />
              <JSONBSection title={t('extras')} type="extras" />
              <JSONBSection title={t('beverages')} type="beverages" />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingItem ? t('update') : t('create')}
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
                  {t(item.meal_type)}
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
                  onClick={() => deleteMutation.mutate(item)}
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
