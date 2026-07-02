package com.example.Messenger.Components;


import com.example.Messenger.Entity.Order;
import com.example.Messenger.Record.Saga.SagaReplyEvent;
import com.example.Messenger.Repository.OrderRepository;
import com.example.Messenger.Service.Implement.GmailServiceImp;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderSagaResponseListener {

    private final OrderRepository orderRepository;
    private final GmailServiceImp gmailServiceImp;

    public OrderSagaResponseListener(OrderRepository orderRepository, GmailServiceImp gmailServiceImp) {
        this.orderRepository = orderRepository;
        this.gmailServiceImp = gmailServiceImp;
    }

    @KafkaListener(topics = "saga-replies", groupId = "order-saga-group")
    @Transactional
    public void handleSagaReply(SagaReplyEvent reply) {
        // 1. Tìm kiếm đơn hàng đang ở trạng thái PENDING
        Order order = orderRepository.findById(reply.orderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + reply.orderId()));

        if (!"PENDING".equals(order.getStatus())) {
            return;
        }
        if ("STOCK_RESERVED".equals(reply.status())) {
            order.setStatus("CONFIRMED");
            orderRepository.save(order);

            // Gửi email báo đặt hàng thành công đến khách hàng
            gmailServiceImp.sendSuccessEmail(order.getCustomerEmail(), order);

        } else if ("STOCK_RESERVATION_FAILED".equals(reply.status())) {
            order.setStatus("CANCELLED");
            orderRepository.save(order);
            gmailServiceImp.sendEmail(
                    order.getCustomerEmail(),
                    "Thông báo huỷ đơn hàng #" + order.getId(),
                    order // Sử dụng service gửi mail mặc định của Châu để thông báo hủy
            );
        }
    }
}