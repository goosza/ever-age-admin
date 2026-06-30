import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getOrder, shipOrder, deliverOrder, cancelOrder, type Order } from '../api/orders';
import '../styles/orders.css';

export default function OrderDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { secret } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!secret || !uuid) return;
    getOrder(secret, uuid).then(setOrder).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [secret, uuid]);

  const doAction = async (action: () => Promise<Order>) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await action();
      setOrder(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading order...</div>;
  if (!order) return <div className="error-banner">{error ?? 'Order not found'}</div>;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/orders')}>← Back</button>

      <div className="page-header">
        <h1>{order.orderNumber}</h1>
        <span className="status-badge-lg">{order.status}</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="detail-grid">
        {/* Customer */}
        <div className="detail-card">
          <h3>Customer</h3>
          <p><strong>{order.firstName} {order.lastName}</strong></p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
        </div>

        {/* Shipping */}
        {order.shipping && (
          <div className="detail-card">
            <h3>Shipping</h3>
            <p>Status: <strong>{order.shipping.status}</strong></p>
            <p>Provider: {order.shipping.provider}</p>
            {order.shipping.trackingNumber && (
              <p>
                Tracking:{' '}
                {order.shipping.trackingUrl ? (
                  <a href={order.shipping.trackingUrl} target="_blank" rel="noopener noreferrer">
                    {order.shipping.trackingNumber}
                  </a>
                ) : order.shipping.trackingNumber}
              </p>
            )}
            {order.shipping.pickupPointName && (
              <p>Pick-up: {order.shipping.pickupPointName}</p>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="detail-card">
        <h3>Items</h3>
        <table className="data-table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {order.items.map(item => (
              <tr key={item.uuid}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{Number(item.price).toFixed(2)} CZK</td>
                <td>{(Number(item.price) * item.quantity).toFixed(2)} CZK</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="total-line">Total: <strong>{Number(order.totalAmount).toFixed(2)} CZK</strong></p>
      </div>

      {/* Actions */}
      <div className="action-bar">
        {order.status === 'PAID' && (
          <button
            className="btn btn-primary"
            disabled={actionLoading}
            onClick={() => doAction(() => shipOrder(secret!, order.uuid))}
          >
            Mark as Shipped
          </button>
        )}
        {order.status === 'SHIPPED' && (
          <button
            className="btn btn-primary"
            disabled={actionLoading}
            onClick={() => doAction(() => deliverOrder(secret!, order.uuid))}
          >
            Mark as Delivered
          </button>
        )}
        {(order.status === 'PENDING' || order.status === 'PAID') && (
          <button
            className="btn btn-danger"
            disabled={actionLoading}
            onClick={() => {
              if (confirm('Cancel this order?')) doAction(() => cancelOrder(secret!, order.uuid));
            }}
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
