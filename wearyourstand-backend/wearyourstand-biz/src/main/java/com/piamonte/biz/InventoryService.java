package com.piamonte.biz;

public interface InventoryService {
    boolean checkStock(Long productId, Integer quantity);
    void reserveStock(Long productId, Integer quantity);
    void releaseStock(Long productId, Integer quantity);
    void updateStock(Long productId, Integer quantity);
    Integer getAvailableStock(Long productId);
}





















