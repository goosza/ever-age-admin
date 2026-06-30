import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOrders, type Order } from '../api/orders';
import '../styles/orders.css';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PAID: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444',
};

export default function OrdersPage() {
  const { secret } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!secret) return;
    setLoading(true);
    getOrders(secret, filter || undefined)
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [secret, filter]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <div className="filter-tabs">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`tab ${filter === opt.value ? 'active' : ''}`}
              onClick={() => setFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty">No orders found</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr
                key={order.uuid}
                onClick={() => navigate(`/orders/${order.uuid}`)}
                className="clickable-row"
              >
                <td><strong>{order.orderNumber}</strong></td>
                <td>
                  <div>{order.firstName} {order.lastName}</div>
                  <div className="sub-text">{order.email}</div>
                </td>
                <td>{order.items.length} item(s)</td>
                <td>{Number(order.totalAmount).toFixed(2)} CZK</td>
                <td>
                  <span
                    className="status-badge"
                    style={{ background: STATUS_COLORS[order.status] ?? '#666' }}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
