import { useState } from 'react';
import { createItem, updateItem, type Item, type ItemRequest } from '../api/items';
import '../styles/items.css';

interface Props {
  item: Item | null;
  secret: string;
  onDone: () => void;
  onCancel: () => void;
}

export default function ItemForm({ item, secret, onDone, onCancel }: Props) {
  const [form, setForm] = useState<ItemRequest>({
    name: item?.name ?? '',
    description: item?.description ?? '',
    price: item?.price ?? 0,
    weight: item?.weight ?? 0.1,
    status: item?.status ?? 'ACTIVE',
    quantity: item?.quantity ?? 0,
    color: item?.color ?? '',
    existingImageUrls: item?.imageUrls ?? [],
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (item) {
        await updateItem(secret, item.uuid, form, images.length > 0 ? images : undefined);
      } else {
        await createItem(secret, form, images.length > 0 ? images : undefined);
      }
      onDone();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof ItemRequest, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h2>{item ? 'Edit Item' : 'New Item'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name *
            <input value={form.name} onChange={e => set('name', e.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
          </label>
          <div className="form-row">
            <label>
              Price (CZK) *
              <input type="number" min="0" step="0.01" value={form.price}
                onChange={e => set('price', parseFloat(e.target.value))} required />
            </label>
            <label>
              Weight (kg) *
              <input type="number" min="0.001" step="0.001" value={form.weight}
                onChange={e => set('weight', parseFloat(e.target.value))} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Quantity
              <input type="number" min="0" value={form.quantity}
                onChange={e => set('quantity', parseInt(e.target.value))} />
            </label>
            <label>
              Color
              <input value={form.color ?? ''} onChange={e => set('color', e.target.value)} />
            </label>
          </div>
          <label>
            Status
            <select value={form.status} onChange={e => set('status', e.target.value as any)}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </label>
          <label>
            Images
            <input type="file" multiple accept="image/*"
              onChange={e => setImages(Array.from(e.target.files ?? []))} />
            {images.length > 0 && <span className="sub-text">{images.length} file(s) selected</span>}
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn" onClick={onCancel} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
