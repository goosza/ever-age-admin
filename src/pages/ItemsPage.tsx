import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getItems, updateQuantity, deleteItem, type Item } from '../api/items';
import ItemForm from '../components/ItemForm';
import '../styles/items.css';

export default function ItemsPage() {
  const { secret } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    getItems()
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: Item) => {
    if (!secret) return;
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await deleteItem(secret, item.uuid);
      load();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleQty = async (item: Item, qty: number) => {
    if (!secret) return;
    try {
      const updated = await updateQuantity(secret, item.uuid, qty);
      setItems(prev => prev.map(i => i.uuid === updated.uuid ? updated : i));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: '#10b981',
    INACTIVE: '#6b7280',
    OUT_OF_STOCK: '#ef4444',
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Items</h1>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowForm(true); }}>
          + New Item
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <ItemForm
          item={editItem}
          secret={secret!}
          onDone={() => { setShowForm(false); setEditItem(null); load(); }}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
        />
      )}

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.uuid}>
                <td>
                  {item.imageUrls[0] ? (
                    <img src={item.imageUrls[0]} alt={item.name} className="item-thumb" />
                  ) : (
                    <div className="item-thumb-empty" />
                  )}
                </td>
                <td>
                  <strong>{item.name}</strong>
                  {item.color && <div className="sub-text">{item.color}</div>}
                </td>
                <td>{Number(item.price).toFixed(2)} CZK</td>
                <td>
                  <div className="qty-control">
                    <button onClick={() => handleQty(item, item.quantity - 1)} disabled={item.quantity <= 0}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQty(item, item.quantity + 1)}>+</button>
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ background: STATUS_COLORS[item.status] ?? '#666' }}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button className="btn-sm" onClick={() => { setEditItem(item); setShowForm(true); }}>Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(item)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
