package com.piamonte.biz;

import com.piamonte.biz.data.Order;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order createOrder(Long userId, CheckoutRequest request);
    Order processOrder(Long orderId);
    Order updateOrderStatus(Long orderId, Order.OrderStatus status);
    Order updatePaymentStatus(Long orderId, Order.PaymentStatus status);
    List<Order> getUserOrders(Long userId);
    List<Order> getAllOrders();
    Optional<Order> getOrderById(Long id);
    Optional<Order> getOrderByNumber(String orderNumber);
    void cancelOrder(Long orderId);
    void deleteOrder(Long orderId);
}





















