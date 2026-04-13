import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { 
  Package, 
  Clock, 
  MessageSquare,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';


const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [newOrderType, setNewOrderType] = useState('service');
  const [serviceId, setServiceId] = useState('');
  const [jobId, setJobId] = useState('');
  const [amount, setAmount] = useState('');
  const [packageType, setPackageType] = useState('basic');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'delivered': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreatingOrder(true);
    try {
      const orderData = {
        orderType: newOrderType,
        amount: parseFloat(amount),
        ...(newOrderType === 'service' ? { serviceId, packageType } : { jobId }),
      };
      await api.post('/orders', orderData);
      alert('Order created successfully!');
      setShowNewOrderModal(false);
      // Refresh orders
      const res = await api.get('/orders');
      setOrders(res.data.data);
      // Reset form
      setNewOrderType('service');
      setServiceId('');
      setJobId('');
      setAmount('');
      setPackageType('basic');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create order');
    } finally {
      setCreatingOrder(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewOrder) return;
    setSubmittingReview(true);
    
    // Determine the reviewee (the other party)
    const revieweeId = user.role === 'customer' ? reviewOrder.provider?._id : reviewOrder.customer?._id;

    try {
      await api.post('/reviews', {
        reviewee: revieweeId,
        order: reviewOrder._id,
        overallRating: rating,
        comment: comment
      });
      alert('Review submitted successfully!');
      setReviewOrder(null);
      setRating(5);
      setComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review. You may have already reviewed this order.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Please log in to view your orders.</h2>
        <Link to="/login" className="mt-4 inline-block"><Button>Login</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 sm:px-8 space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
          <p className="text-muted-foreground mt-1">Track and manage your service orders and job hires.</p>
        </div>
        {user?.role === 'customer' && (
          <Button onClick={() => setShowNewOrderModal(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto shadow-lg">
            <Package className="mr-2 h-4 w-4" />
            New Order
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {orders.length === 0 && !loading ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed rounded-2xl">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Explore the marketplace to find services or post a job.</p>
            <Link to="/services"><Button>Browse Services</Button></Link>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order._id} className="hover:shadow-medium transition-shadow overflow-hidden group">
              <div className="flex flex-col md:flex-row h-full">
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">{order.orderNumber}</Badge>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold truncate">
                        {order.service?.title || order.job?.title || 'Custom Order'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Order from {user?.role === 'customer' ? order.provider?.firstName : order.customer?.firstName}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3 w-3" />
                      {order.deliveryDate ? `Due ${new Date(order.deliveryDate).toLocaleDateString()}` : 'No deadline'}
                      </div>
                      <div className="flex items-center gap-1 text-secondary font-bold">
                        PKR {order.totalAmount}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 md:w-64 border-t md:border-t-0 md:border-l p-6 flex flex-col justify-center gap-3">
                  {user?.role === 'provider' && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Update Status</p>
                       <div className="grid grid-cols-2 gap-2">
                         {order.status === 'pending' && (
                           <Button size="sm" variant="secondary" className="text-[10px] h-8" onClick={() => handleUpdateStatus(order._id, 'accepted')}>Accept</Button>
                         )}
                         {order.status === 'accepted' && (
                           <Button size="sm" variant="secondary" className="text-[10px] h-8" onClick={() => handleUpdateStatus(order._id, 'in-progress')}>Start</Button>
                         )}
                         {order.status === 'in-progress' && (
                           <Button size="sm" variant="secondary" className="text-[10px] h-8" onClick={() => handleUpdateStatus(order._id, 'delivered')}>Deliver</Button>
                         )}
                         {(order.status === 'delivered' || order.status === 'in-progress') && (
                           <Button size="sm" variant="default" className="text-[10px] h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(order._id, 'completed')}>Complete</Button>
                         )}
                       </div>
                    </div>
                  )}

{order.status === 'completed' && user.role === 'customer' && (
                    <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => setReviewOrder(order)}>
                      <Star className="mr-2 h-4 w-4" /> Leave Review
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/messages" state={{ provider: user.role === 'customer' ? order.provider : order.customer }}>
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-heavy animate-in zoom-in-95">
            <CardHeader>
              <CardTitle>Create New Order</CardTitle>
              <CardDescription>Place a new order for a service or job.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select 
                    value={newOrderType} 
                    onChange={(e) => setNewOrderType(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="service">Service</option>
                    <option value="job">Job</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>ID ({newOrderType})</Label>
                  <Input
                    placeholder={`Enter ${newOrderType} ID`}
                    value={newOrderType === 'service' ? serviceId : jobId}
                    onChange={(e) => newOrderType === 'service' ? setServiceId(e.target.value) : setJobId(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (PKR)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full"
                    required
                    min="0"
                  />
                </div>
                {newOrderType === 'service' && (
                  <div className="space-y-2">
                    <Label>Package Type</Label>
                    <select 
                      value={packageType} 
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowNewOrderModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingOrder} className="flex-1">
                    {creatingOrder ? 'Creating...' : 'Create Order'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-heavy animate-in zoom-in-95">
            <CardHeader>
              <CardTitle>Rate this Order</CardTitle>
              <CardDescription>Share your experience with {user.role === 'customer' ? reviewOrder.provider?.firstName : reviewOrder.customer?.firstName}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitReview} className="space-y-6">
                <div className="space-y-2">
                  <Label>Overall Rating</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                      >
                        <Star className="h-8 w-8 fill-current" />
                      </button>
                    ))}
                    <span className="ml-3 font-bold text-lg">{rating}.0</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Your Review</Label>
                  <Textarea 
                    id="comment" 
                    placeholder="What was it like working with them?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="ghost" onClick={() => setReviewOrder(null)}>Cancel</Button>
                  <Button type="submit" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
