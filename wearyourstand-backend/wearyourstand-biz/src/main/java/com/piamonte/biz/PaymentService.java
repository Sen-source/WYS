package com.piamonte.biz;

import com.piamonte.biz.data.Order;
import java.math.BigDecimal;

public interface PaymentService {
    boolean processPayment(Order order, BigDecimal amount);
    void refundPayment(Order order, BigDecimal amount);
    String getPaymentStatus(Order order);
}





















