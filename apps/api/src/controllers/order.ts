import { Request, Response } from 'express';
import Order from '../models/Order';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(__dirname, '../../data/orders.json');

const readLocalOrders = (): any[] => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local orders', err);
  }
  return [];
};

const writeLocalOrders = (orders: any[]) => {
  try {
    const dir = path.dirname(ORDERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local orders', err);
  }
};

const normalizeOrder = (o: any): any => {
  if (!o) return o;
  const rawObj = typeof o.toObject === 'function' ? o.toObject({ getters: false, virtuals: false }) : { ...o };
  const orderObj = JSON.parse(JSON.stringify(rawObj));

  let cleanOrderId = orderObj.orderId;
  if (!cleanOrderId || !String(cleanOrderId).startsWith('PKM-')) {
    if (orderObj._id && String(orderObj._id).startsWith('PKM-')) {
      cleanOrderId = String(orderObj._id);
    } else {
      const date = orderObj.createdAt ? new Date(orderObj.createdAt) : new Date();
      const yy = String(date.getFullYear()).slice(-2);
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      let seq = '001';
      if (orderObj._id) {
        const idStr = String(orderObj._id);
        if (idStr.length >= 24) {
          const num = (parseInt(idStr.slice(-4), 16) % 900) + 100;
          seq = String(num);
        }
      }
      cleanOrderId = `PKM-${yy}${mm}-${seq}`;
    }
  }

  return {
    ...orderObj,
    _id: cleanOrderId,
    orderId: cleanOrderId,
    id: cleanOrderId,
    mongoId: String(orderObj._id || '')
  };
};

const getOrderFingerprint = (item: any): string => {
  const norm = normalizeOrder(item);
  const name = String(norm.shippingAddress?.fullName || norm.shippingAddress?.email || norm.user || '').toLowerCase().trim();
  const price = String(norm.totalPrice || 0);
  const firstItem = norm.orderItems && norm.orderItems[0] ? String(norm.orderItems[0].title || '').toLowerCase().trim() : '';
  const dateStr = norm.createdAt ? new Date(norm.createdAt).toISOString().slice(0, 10) : '';
  return `${name}_${price}_${firstItem}_${dateStr}`;
};

const mergeOrdersDeduplicated = (primaryOrders: any[], secondaryOrders: any[]): any[] => {
  const seenIds = new Set<string>();
  const seenFingerprints = new Set<string>();
  const result: any[] = [];

  const processOrder = (o: any) => {
    if (!o) return;
    const norm = normalizeOrder(o);
    const id1 = String(o._id || '').toLowerCase();
    const id2 = String(o.orderId || '').toLowerCase();
    const id3 = String(norm._id || '').toLowerCase();
    const id4 = String(norm.orderId || '').toLowerCase();
    const fp = getOrderFingerprint(o);

    const isIdDuplicate = (id1 && seenIds.has(id1)) || (id2 && seenIds.has(id2)) || (id3 && seenIds.has(id3)) || (id4 && seenIds.has(id4));
    const isFpDuplicate = fp.trim() !== '' && seenFingerprints.has(fp);

    if (!isIdDuplicate && !isFpDuplicate) {
      if (id1) seenIds.add(id1);
      if (id2) seenIds.add(id2);
      if (id3) seenIds.add(id3);
      if (id4) seenIds.add(id4);
      if (fp.trim()) seenFingerprints.add(fp);
      result.push(norm);
    }
  };

  for (const o of primaryOrders) {
    processOrder(o);
  }

  for (const o of secondaryOrders) {
    processOrder(o);
  }

  return result;
};

const generateNextOrderId = (orders: any[] = []): string => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const monthPrefix = `PKM-${yy}${mm}-`;
  
  let maxSeq = 0;
  for (const o of orders) {
    const idStr = String(o.orderId || o._id || o.id || '').trim();
    if (idStr.toUpperCase().startsWith(monthPrefix)) {
      const parts = idStr.split('-');
      if (parts.length >= 3) {
        const seqNum = parseInt(parts[2], 10);
        if (!isNaN(seqNum) && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      }
    }
  }
  const nextNum = maxSeq + 1;
  const nextSeq = nextNum < 1000 ? String(nextNum).padStart(3, '0') : String(nextNum);
  return `${monthPrefix}${nextSeq}`;
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, user: reqUserId, sessionId } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, error: 'No order items' });
      return;
    }

    const userId = (req as any).user 
      ? ((req as any).user._id || (req as any).user.id) 
      : (reqUserId || undefined);

    const localOrders = readLocalOrders();
    const newOrderId = generateNextOrderId(localOrders);

    const newOrderObj = {
      _id: newOrderId,
      orderId: newOrderId,
      user: userId || 'guest-user',
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: false,
      createdAt: new Date(),
    };

    // Save to persistent local file storage
    localOrders.unshift(newOrderObj);
    writeLocalOrders(localOrders);

    const validUserId = (userId && mongoose.isValidObjectId(userId)) ? userId : undefined;
    const sanitizedOrderItems = orderItems.map((item: any) => ({
      ...item,
      product: (item.product && mongoose.isValidObjectId(item.product)) ? item.product : new mongoose.Types.ObjectId()
    }));

    if (mongoose.connection.readyState !== 1) {
      res.status(201).json({ 
        success: true, 
        data: normalizeOrder(newOrderObj)
      });
      return;
    }

    const order = new Order({
      orderId: newOrderId,
      orderItems: sanitizedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      ...(validUserId ? { user: validUserId } : {})
    });

    const createdOrder = await order.save();

    // Automatically decrement product stock count based on ordered items
    try {
      const Product = mongoose.model('Product');
      for (const item of sanitizedOrderItems) {
        if (item.product && mongoose.isValidObjectId(item.product)) {
          const qty = parseInt(item.quantity as any, 10) || 1;
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -Math.abs(qty) } }
          );
        }
      }
    } catch (stockError) {
      console.error('Error reducing stock count on order:', stockError);
    }

    // Mark visitor session as purchased
    if (sessionId) {
      try {
        const Visitor = mongoose.model('Visitor');
        await Visitor.findOneAndUpdate({ sessionId }, { hasPurchased: true });
      } catch (visitorErr) {
        console.error('Error updating visitor status on checkout:', visitorErr);
      }
    }

    res.status(201).json({ success: true, data: normalizeOrder(createdOrder) });
  } catch (error: any) {
    console.error('CREATE ORDER ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchId = String(req.params.id || '').trim().toLowerCase();
    const localOrders = readLocalOrders();
    const localMatch = localOrders.find(o => 
      String(o.orderId || '').toLowerCase() === searchId || 
      String(o._id || '').toLowerCase() === searchId || 
      String(o.id || '').toLowerCase() === searchId
    );

    if (mongoose.connection.readyState !== 1) {
      if (localMatch) {
        res.status(200).json({ success: true, data: normalizeOrder(localMatch) });
        return;
      }
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    let order: any = null;
    try {
      if (mongoose.isValidObjectId(req.params.id)) {
        order = await Order.findById(req.params.id).populate('user', 'email').lean();
      }
      if (!order) {
        order = await Order.findOne({
          $or: [
            { orderId: req.params.id },
            { _id: req.params.id },
            { 'shippingAddress.phone': req.params.id },
            { 'shippingAddress.email': req.params.id }
          ]
        }).populate('user', 'email').lean();
      }
    } catch (dbErr) {
      console.warn('DB order search warning:', dbErr);
    }

    if (!order) {
      if (localMatch) {
        res.status(200).json({ success: true, data: normalizeOrder(localMatch) });
        return;
      }
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, data: normalizeOrder(order) });
  } catch (error: any) {
    const fallbackMatch = readLocalOrders().find(o => String(o.orderId || o._id || '').toLowerCase() === String(req.params.id || '').toLowerCase());
    res.status(200).json({ success: true, data: fallbackMatch ? normalizeOrder(fallbackMatch) : null });
  }
};

export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userObj = (req as any).user;
    if (!userObj) {
      res.status(401).json({ success: false, error: 'Not authorized' });
      return;
    }

    const userId = String(userObj._id || userObj.id || '');
    const userEmail = userObj.email ? String(userObj.email).toLowerCase() : '';
    const userPhone = userObj.phone ? String(userObj.phone) : '';
    const isAdmin = userObj.role === 'ADMIN' || userObj.role === 'SUPER_ADMIN';

    const localOrders = readLocalOrders();
    const filteredLocal = localOrders.filter((o: any) => {
      if (isAdmin) return true;
      const matchUser = userId && o.user && (String(o.user) === userId || String(o.user._id || o.user.id) === userId);
      const matchEmail = userEmail && o.shippingAddress?.email && String(o.shippingAddress.email).toLowerCase() === userEmail;
      const matchPhone = userPhone && o.shippingAddress?.phone && String(o.shippingAddress.phone) === userPhone;
      return matchUser || matchEmail || matchPhone || (!userId && !userEmail && !userPhone) || o.user === 'guest-user';
    });

    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: filteredLocal.map(normalizeOrder) });
      return;
    }

    let dbOrders: any[] = [];
    try {
      if (isAdmin) {
        dbOrders = await Order.find({}).populate('user', 'email').lean().sort({ createdAt: -1 });
      } else {
        const queryConditions: any[] = [];
        if (userId && mongoose.isValidObjectId(userId)) {
          queryConditions.push({ user: userId });
        }
        if (userEmail) queryConditions.push({ 'shippingAddress.email': userEmail });
        if (userPhone) queryConditions.push({ 'shippingAddress.phone': userPhone });

        if (queryConditions.length > 0) {
          dbOrders = await Order.find({ $or: queryConditions }).populate('user', 'email').lean().sort({ createdAt: -1 });
        }
      }
    } catch (dbErr) {
      console.warn('DB getMyOrders warning:', dbErr);
    }

    res.status(200).json({ success: true, data: dbOrders.map(normalizeOrder) });
  } catch (error: any) {
    res.status(200).json({ success: true, data: readLocalOrders().map(normalizeOrder) });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbOrders = await Order.find({}).populate('user', 'email').lean().sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: dbOrders.map(normalizeOrder) });
      return;
    }
    const localOrders = readLocalOrders();
    res.status(200).json({ success: true, data: localOrders.map(normalizeOrder) });
  } catch (error: any) {
    console.error('getAllOrders ERROR:', error);
    res.status(200).json({ success: true, data: readLocalOrders().map(normalizeOrder) });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isDelivered, status, proofMedia, reason, notes, adminRejectionReason, adminReason, expectedReplacementDate, expectedDeliveryDate } = req.body;
    const finalAdminReason = adminRejectionReason || adminReason;
    const finalExpectedReplacementDate = expectedReplacementDate || expectedDeliveryDate;
    const localOrders = readLocalOrders();
    const orderIdx = localOrders.findIndex((o: any) => String(o.orderId || o._id) === String(req.params.id));
    
    const isReturnOrReplaceRequest = status === 'RETURN_REQUESTED' || status === 'REPLACEMENT_REQUESTED' || status === 'EXCHANGE_REQUESTED';
    
    if (isReturnOrReplaceRequest && orderIdx !== -1) {
      const isAlreadyDelivered = Boolean(localOrders[orderIdx].isDelivered || String(localOrders[orderIdx].status || '').toUpperCase() === 'DELIVERED');
      if (!isAlreadyDelivered) {
        res.status(400).json({ success: false, error: 'Return or Replace / Exchange can only be enabled/requested after successful delivery of the product.' });
        return;
      }
    }

    if (orderIdx !== -1) {
      if (isDelivered !== undefined) {
        localOrders[orderIdx].isDelivered = isDelivered;
        if (isDelivered) localOrders[orderIdx].deliveredAt = new Date();
      }
      if (status !== undefined) {
        localOrders[orderIdx].status = status;
        if (isReturnOrReplaceRequest) {
          localOrders[orderIdx].actionRequestedAt = new Date();
        }
        if (status === 'RETURNED' || status === 'Return Accepted' || status === 'RETURN_ACCEPTED') {
          localOrders[orderIdx].isReturned = true;
          localOrders[orderIdx].returnedAt = new Date();
        }
        if (status === 'RETURN_REJECTED' || status === 'Return Rejected') {
          localOrders[orderIdx].isDelivered = true;
        }
        if (status === 'CANCELLED' || status === 'Cancelled') {
          localOrders[orderIdx].cancelledAt = localOrders[orderIdx].cancelledAt || new Date();
        }
      }
      if (proofMedia !== undefined) localOrders[orderIdx].proofMedia = proofMedia;
      if (reason !== undefined) localOrders[orderIdx].actionReason = reason;
      if (notes !== undefined) localOrders[orderIdx].actionNotes = notes;
      if (finalAdminReason !== undefined) localOrders[orderIdx].adminRejectionReason = finalAdminReason;
      if (finalExpectedReplacementDate !== undefined) localOrders[orderIdx].expectedReplacementDate = finalExpectedReplacementDate;
      writeLocalOrders(localOrders);
    }

    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: orderIdx !== -1 ? normalizeOrder(localOrders[orderIdx]) : normalizeOrder({ _id: req.params.id, status }) });
      return;
    }

    let order = await Order.findOne({ $or: [{ orderId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }] });
    if (!order) {
      if (orderIdx !== -1) {
        res.status(200).json({ success: true, data: normalizeOrder(localOrders[orderIdx]) });
        return;
      }
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (isReturnOrReplaceRequest) {
      const dbIsDelivered = Boolean(order.isDelivered || String(order.status || '').toUpperCase() === 'DELIVERED');
      if (!dbIsDelivered) {
        res.status(400).json({ success: false, error: 'Return or Replace / Exchange can only be enabled/requested after successful delivery of the product.' });
        return;
      }
    }

    if (isDelivered !== undefined) {
      order.isDelivered = isDelivered;
      if (isDelivered) order.deliveredAt = new Date();
    }
    if (status !== undefined) {
      order.status = status;
      if (isReturnOrReplaceRequest) {
        order.actionRequestedAt = new Date();
      }
      if (status === 'RETURNED' || status === 'Return Accepted' || status === 'RETURN_ACCEPTED') {
        order.isReturned = true;
        order.returnedAt = new Date();
      }
      if (status === 'RETURN_REJECTED' || status === 'Return Rejected') {
        order.isDelivered = true;
      }
      if (status === 'CANCELLED' || status === 'Cancelled') {
        order.cancelledAt = order.cancelledAt || new Date();
      }
    }
    if (proofMedia !== undefined) order.proofMedia = proofMedia;
    if (reason !== undefined) order.actionReason = reason;
    if (notes !== undefined) order.actionNotes = notes;
    if (finalAdminReason !== undefined) order.adminRejectionReason = finalAdminReason;
    if (finalExpectedReplacementDate !== undefined) order.expectedReplacementDate = finalExpectedReplacementDate;

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: normalizeOrder(updatedOrder) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateOrderToReturned = async (req: Request, res: Response): Promise<void> => {
  try {
    const localOrders = readLocalOrders();
    const orderIdx = localOrders.findIndex((o: any) => String(o.orderId || o._id) === String(req.params.id));
    if (orderIdx !== -1) {
      localOrders[orderIdx].isReturned = true;
      localOrders[orderIdx].returnedAt = new Date();
      writeLocalOrders(localOrders);
    }

    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: orderIdx !== -1 ? normalizeOrder(localOrders[orderIdx]) : normalizeOrder({ _id: req.params.id, isReturned: true }) });
      return;
    }

    let order = await Order.findOne({ $or: [{ orderId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }] });
    if (!order) {
      if (orderIdx !== -1) {
        res.status(200).json({ success: true, data: normalizeOrder(localOrders[orderIdx]) });
        return;
      }
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    order.isReturned = true;
    order.returnedAt = new Date();

    const updatedOrder = await order.save();
    res.status(200).json({ success: true, data: normalizeOrder(updatedOrder) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawTargetId = String(req.params.id || '').trim();
    const targetId = rawTargetId.toLowerCase();

    let localOrders = readLocalOrders();
    const updatedLocal = localOrders.filter((o: any) => {
      const normalized = normalizeOrder(o);
      const oid = String(o.orderId || '').toLowerCase();
      const id = String(o._id || '').toLowerCase();
      const nid = String(normalized.orderId || '').toLowerCase();
      const mid = String(o.mongoId || o.rawId || '').toLowerCase();
      return oid !== targetId && id !== targetId && nid !== targetId && mid !== targetId;
    });
    writeLocalOrders(updatedLocal);

    if (mongoose.connection.readyState === 1) {
      try {
        const allDbOrders = await Order.find();
        const idsToDelete: any[] = [];
        for (const doc of allDbOrders) {
          const norm = normalizeOrder(doc);
          const docId = String(doc._id).toLowerCase();
          const docOrderId = String(doc.orderId || '').toLowerCase();
          const normOrderId = String(norm.orderId || '').toLowerCase();
          if (
            docId === targetId ||
            docOrderId === targetId ||
            normOrderId === targetId ||
            (mongoose.isValidObjectId(rawTargetId) && String(doc._id) === rawTargetId)
          ) {
            idsToDelete.push(doc._id);
          }
        }
        if (idsToDelete.length > 0) {
          await Order.deleteMany({ _id: { $in: idsToDelete } });
        }
      } catch (dbErr) {
        console.warn('DB delete order warning:', dbErr);
      }
    }
    
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateOrderCustomization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemIndex = 0, userImage } = req.body;
    const targetId = String(req.params.id || '').trim();

    if (!userImage) {
      res.status(400).json({ success: false, error: 'Custom photo image is required' });
      return;
    }

    const localOrders = readLocalOrders();
    const orderIdx = localOrders.findIndex((o: any) => {
      const norm = normalizeOrder(o);
      return String(o.orderId || o._id) === targetId || String(norm.orderId || norm._id) === targetId;
    });

    let currentStatus = 'PENDING';
    if (orderIdx !== -1) {
      currentStatus = String(localOrders[orderIdx].status || 'PENDING').toUpperCase().replace(/\s+/g, '_');
    }

    if (currentStatus === 'PROCESSING' || currentStatus === 'SHIPPED' || currentStatus === 'OUT_FOR_DELIVERY' || currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
      res.status(400).json({ success: false, error: 'Customization cannot be updated once the order is in Processing, Shipped, or Delivered status.' });
      return;
    }

    let updatedLocalOrder: any = null;
    if (orderIdx !== -1) {
      if (!localOrders[orderIdx].orderItems) localOrders[orderIdx].orderItems = [];
      if (localOrders[orderIdx].orderItems[itemIndex]) {
        localOrders[orderIdx].orderItems[itemIndex].userImage = userImage;
      }
      writeLocalOrders(localOrders);
      updatedLocalOrder = normalizeOrder(localOrders[orderIdx]);
    }

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ $or: [{ orderId: targetId }, { _id: mongoose.isValidObjectId(targetId) ? targetId : null }] });
      if (order) {
        const dbStatus = String(order.status || 'PENDING').toUpperCase().replace(/\s+/g, '_');
        if (dbStatus === 'PROCESSING' || dbStatus === 'SHIPPED' || dbStatus === 'OUT_FOR_DELIVERY' || dbStatus === 'DELIVERED' || dbStatus === 'CANCELLED') {
          res.status(400).json({ success: false, error: 'Customization cannot be updated once the order is in Processing, Shipped, or Delivered status.' });
          return;
        }
        if (order.orderItems && order.orderItems[itemIndex]) {
          order.orderItems[itemIndex].userImage = userImage;
          await order.save();
          res.status(200).json({ success: true, data: normalizeOrder(order) });
          return;
        }
      }
    }

    if (updatedLocalOrder) {
      res.status(200).json({ success: true, data: updatedLocalOrder });
      return;
    }

    res.status(404).json({ success: false, error: 'Order not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
