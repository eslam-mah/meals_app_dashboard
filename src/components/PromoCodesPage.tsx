
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, PromoCode } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

const PromoCodesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: '',
    percentage: 0,
    starts_at: '',
    expires_at: '',
  });

  const queryClient = useQueryClient();

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['promoCodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PromoCode[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('promo_codes')
        .insert([{ ...data, usage_limit: 1 }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Promo code created successfully!');
    },
    onError: (error) => {
      toast.error('Error creating promo code: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from('promo_codes')
        .update({ ...data, usage_limit: 1 })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Promo code updated successfully!');
    },
    onError: (error) => {
      toast.error('Error updating promo code: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Promo code deleted successfully!');
    },
    onError: (error) => {
      toast.error('Error deleting promo code: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: '',
      percentage: 0,
      starts_at: '',
      expires_at: '',
    });
    setEditingCode(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCode) {
      updateMutation.mutate({ id: editingCode.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code || '',
      type: code.type || '',
      percentage: code.percentage || 0,
      starts_at: code.starts_at ? new Date(code.starts_at).toISOString().split('T')[0] : '',
      expires_at: code.expires_at ? new Date(code.expires_at).toISOString().split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isActive = (startsAt: string, expiresAt: string) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = new Date(expiresAt);
    return now >= start && now <= end;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Promo Codes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Edit Promo Code' : 'Add New Promo Code'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="SAVE20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Description</Label>
                <Textarea
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="Special discount for new customers"
                  required
                />
              </div>

              <div>
                <Label htmlFor="percentage">Percentage (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  value={formData.percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="starts_at">Start Date</Label>
                <Input
                  id="starts_at"
                  type="date"
                  value={formData.starts_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="expires_at">Expiry Date</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCode ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promoCodes?.map((code) => (
          <Card key={code.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-mono">{code.code}</CardTitle>
                <Badge 
                  variant={
                    isExpired(code.expires_at) ? 'destructive' : 
                    isActive(code.starts_at, code.expires_at) ? 'default' : 
                    'secondary'
                  }
                >
                  {isExpired(code.expires_at) ? 'Expired' : 
                   isActive(code.starts_at, code.expires_at) ? 'Active' : 
                   'Scheduled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-orange-600">
                  {code.percentage}% OFF
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Description:</strong> {code.type}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Starts:</strong> {new Date(code.starts_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Expires:</strong> {new Date(code.expires_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(code)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteMutation.mutate(code.id)}
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

export default PromoCodesPage;
