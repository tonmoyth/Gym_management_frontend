'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { equipmentApi, CreateEquipmentInput } from '@/lib/api/equipment.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  AlertCircle 
} from 'lucide-react';
import { Equipment, EquipmentCondition } from '@/types/api.types';

export default function OwnerEquipmentPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<EquipmentCondition>('GOOD');
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState('');

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch equipment inventory
  const { data: equipmentRes, isLoading: isEquipmentLoading } = useQuery({
    queryKey: ['business-equipment', businessId],
    queryFn: () => equipmentApi.listByBusiness(businessId!),
    enabled: !!businessId,
  });

  const items = equipmentRes?.data?.data || [];

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setQuantity('1');
    setCondition('GOOD');
    setLastMaintenanceDate('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Equipment) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.quantity.toString());
    setCondition(item.condition);
    setLastMaintenanceDate(item.lastMaintenanceDate ? item.lastMaintenanceDate.slice(0, 10) : '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEquipmentInput) => equipmentApi.create(businessId!, data),
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['business-equipment', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to add equipment.');
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateEquipmentInput>) =>
      equipmentApi.update(businessId!, editingItem!.id, data),
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['business-equipment', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update equipment.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => equipmentApi.delete(businessId!, id),
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['business-equipment', businessId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const payload: CreateEquipmentInput = {
      name,
      quantity: parseInt(quantity, 10),
      condition,
      lastMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate).toISOString() : undefined,
    };

    if (editingItem) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const getConditionBadge = (c: EquipmentCondition) => {
    switch (c) {
      case 'GOOD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Good Condition
          </span>
        );
      case 'NEEDS_REPAIR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Needs Repair
          </span>
        );
      case 'OUT_OF_SERVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Out of Service
          </span>
        );
      default:
        return null;
    }
  };

  if (isBusinessLoading || isEquipmentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Equipment Inventory</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Track condition status, quantities, and service maintenance schedules for gym machinery.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Equipment
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No Equipment Logged"
          description="Catalog your treadmills, cable machines, dumbbells, and racks to manage maintenance."
          actionLabel="Add First Machine"
          onAction={openCreateModal}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Machine / Asset Name</th>
                  <th className="py-4 px-6 text-center">Quantity</th>
                  <th className="py-4 px-6">Current Condition</th>
                  <th className="py-4 px-6">Last Serviced</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {items.map((item: Equipment) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white">{item.name}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-200">
                        {item.quantity} Units
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {getConditionBadge(item.condition)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {item.lastMaintenanceDate ? new Date(item.lastMaintenanceDate).toLocaleDateString() : 'Never logged'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Equipment"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Delete Equipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Equipment' : 'Add New Equipment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Equipment / Machine Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Commercial Treadmill T80, Cable Crossover Station"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity *"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <Select
              label="Operational Status *"
              value={condition}
              onChange={(e) => setCondition(e.target.value as EquipmentCondition)}
              options={[
                { value: 'GOOD', label: 'Good (Operational)' },
                { value: 'NEEDS_REPAIR', label: 'Needs Repair' },
                { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
              ]}
            />
          </div>

          <Input
            label="Last Serviced / Inspection Date"
            type="date"
            value={lastMaintenanceDate}
            onChange={(e) => setLastMaintenanceDate(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Equipment Record?"
        description="This will permanently delete this equipment record from your gym's inventory."
        confirmLabel="Delete Item"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
