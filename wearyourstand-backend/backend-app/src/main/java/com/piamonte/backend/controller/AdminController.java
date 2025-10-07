package com.piamonte.backend.controller;

import com.piamonte.biz.ProductService;
import com.piamonte.biz.OrderService;
import com.piamonte.biz.data.Product;
import com.piamonte.biz.data.Order;
import com.piamonte.biz.ProductDto;
import com.piamonte.biz.OrderDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // Product CRUD operations
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        try {
            System.out.println("=== ADMIN CONTROLLER GET ALL PRODUCTS START ===");
            List<Product> products = productService.getAllProducts();
            List<ProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            System.out.println("Retrieved " + products.size() + " products");
            System.out.println("=== ADMIN CONTROLLER GET ALL PRODUCTS SUCCESS ===");
            return ResponseEntity.ok(productDtos);
        } catch (Exception e) {
            System.out.println("=== ADMIN CONTROLLER GET ALL PRODUCTS ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        try {
            System.out.println("=== ADMIN CONTROLLER GET PRODUCT BY ID START ===");
            System.out.println("Product ID: " + id);
            
            Optional<Product> productOpt = productService.getProductById(id);
            if (productOpt.isPresent()) {
                ProductDto productDto = convertToDto(productOpt.get());
                System.out.println("Product found: " + productDto.getName());
                System.out.println("=== ADMIN CONTROLLER GET PRODUCT BY ID SUCCESS ===");
                return ResponseEntity.ok(productDto);
            } else {
                System.out.println("Product not found with ID: " + id);
                System.out.println("=== ADMIN CONTROLLER GET PRODUCT BY ID NOT FOUND ===");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("=== ADMIN CONTROLLER GET PRODUCT BY ID ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    @PostMapping("/products")
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto productDto) {
        try {
            System.out.println("=== ADMIN CONTROLLER CREATE START ===");
            System.out.println("Product DTO: " + productDto);
            
            // Initialize imageUrls if null
            if (productDto.getImageUrls() == null) {
                productDto.setImageUrls(new ArrayList<>());
            }
            
            Product product = convertToEntity(productDto);
            Product savedProduct = productService.createProduct(product);
            
            System.out.println("Product created successfully with ID: " + savedProduct.getId());
            System.out.println("=== ADMIN CONTROLLER CREATE SUCCESS ===");
            
            return ResponseEntity.ok(convertToDto(savedProduct));
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // Product creation with multipart support (for forms with images)
    @PostMapping(value = "/products/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProductWithImages(
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            System.out.println("=== MULTIPART PRODUCT CREATION START ===");
            
            // Deserialize JSON string to ProductDto
            ProductDto productDto = objectMapper.readValue(productJson, ProductDto.class);
            System.out.println("Product name: " + productDto.getName());
            System.out.println("Images count: " + (images != null ? images.size() : 0));
            
            // Handle image uploads if provided
            if (images != null && !images.isEmpty()) {
                List<String> imageUrls = new ArrayList<>();
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String imageUrl = uploadSingleFile(image);
                        if (imageUrl != null) {
                            imageUrls.add(imageUrl);
                        }
                    }
                }
                productDto.setImageUrls(imageUrls);
                System.out.println("Uploaded " + imageUrls.size() + " images");
            } else {
                // Initialize empty imageUrls list if no images provided
                productDto.setImageUrls(new ArrayList<>());
                System.out.println("No images provided, setting empty imageUrls list");
            }
            
            Product product = convertToEntity(productDto);
            Product savedProduct = productService.createProduct(product);
            System.out.println("Product created successfully with ID: " + savedProduct.getId());
            System.out.println("=== MULTIPART PRODUCT CREATION SUCCESS ===");
            
            return ResponseEntity.ok(convertToDto(savedProduct));
        } catch (IllegalArgumentException e) {
            System.out.println("=== MULTIPART PRODUCT CREATION VALIDATION ERROR ===");
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("=== MULTIPART PRODUCT CREATION ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto productDto) {
        try {
            System.out.println("=== SIMPLE UPDATE START ===");
            System.out.println("Product ID: " + id);
            System.out.println("Product name: " + productDto.getName());
            System.out.println("Product price: " + productDto.getPrice());
            
            // Get existing product
            Optional<Product> existingProductOpt = productService.getProductById(id);
            if (!existingProductOpt.isPresent()) {
                System.out.println("Product not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            Product existingProduct = existingProductOpt.get();
            
            // Update only non-null fields, keep existing images
            if (productDto.getName() != null && !productDto.getName().trim().isEmpty()) {
                existingProduct.setName(productDto.getName());
            }
            if (productDto.getDescription() != null && !productDto.getDescription().trim().isEmpty()) {
                existingProduct.setDescription(productDto.getDescription());
            }
            if (productDto.getPrice() != null && productDto.getPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
                existingProduct.setPrice(productDto.getPrice());
            }
            if (productDto.getStockQuantity() != null && productDto.getStockQuantity() >= 0) {
                existingProduct.setStockQuantity(productDto.getStockQuantity());
            }
            if (productDto.getCategory() != null && !productDto.getCategory().trim().isEmpty()) {
                existingProduct.setCategory(productDto.getCategory());
            }
            if (productDto.getBrand() != null) {
                existingProduct.setBrand(productDto.getBrand());
            }
            
            // Convert String to enum values safely
            if (productDto.getSize() != null && !productDto.getSize().trim().isEmpty()) {
                try {
                    existingProduct.setSize(Product.Size.valueOf(productDto.getSize()));
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid size value: " + productDto.getSize());
                }
            }
            if (productDto.getColor() != null && !productDto.getColor().trim().isEmpty()) {
                try {
                    existingProduct.setColor(Product.Color.valueOf(productDto.getColor()));
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid color value: " + productDto.getColor());
                }
            }
            if (productDto.getStatus() != null && !productDto.getStatus().trim().isEmpty()) {
                try {
                    existingProduct.setStatus(Product.ProductStatus.valueOf(productDto.getStatus()));
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid status value: " + productDto.getStatus());
                }
            }
            
            // Keep existing imageUrls - don't touch them
            System.out.println("Keeping existing imageUrls: " + existingProduct.getImageUrls());
            
            // Save the updated product
            Product updatedProduct = productService.updateProduct(existingProduct);
            System.out.println("Product updated successfully");
            
            ProductDto responseDto = convertToDto(updatedProduct);
            System.out.println("=== SIMPLE UPDATE SUCCESS ===");
            
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            System.out.println("=== SIMPLE UPDATE ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // Product editing with multipart support (for forms with images)
    @PutMapping(value = "/products/{id}/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> updateProductWithImages(
            @PathVariable Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            System.out.println("=== ADMIN CONTROLLER MULTIPART UPDATE START ===");
            System.out.println("Product ID: " + id);
            
            // Deserialize JSON string to ProductDto
            ProductDto productDto = objectMapper.readValue(productJson, ProductDto.class);
            System.out.println("Product name: " + productDto.getName());
            System.out.println("Images count: " + (images != null ? images.size() : 0));
            
            // Set the ID from path variable
            productDto.setId(id);
            
            // Handle image uploads if provided
            if (images != null && !images.isEmpty()) {
                List<String> newImageUrls = new ArrayList<>();
                for (MultipartFile image : images) {
                    if (!image.isEmpty()) {
                        String imageUrl = uploadSingleFile(image);
                        if (imageUrl != null) {
                            newImageUrls.add(imageUrl);
                        }
                    }
                }
                
                // Combine existing imageUrls with new ones
                List<String> existingImageUrls = productDto.getImageUrls() != null ? productDto.getImageUrls() : new ArrayList<>();
                existingImageUrls.addAll(newImageUrls);
                productDto.setImageUrls(existingImageUrls);
                System.out.println("Uploaded " + newImageUrls.size() + " new images, total images: " + existingImageUrls.size());
            } else {
                System.out.println("No new images provided, keeping existing imageUrls: " + productDto.getImageUrls());
                // Keep existing imageUrls if no new images provided
                if (productDto.getImageUrls() == null) {
                    productDto.setImageUrls(new ArrayList<>());
                }
            }
            
            Product product = convertToEntity(productDto);
            Product updatedProduct = productService.updateProduct(product);
            System.out.println("Product updated successfully with ID: " + updatedProduct.getId());
            System.out.println("=== ADMIN CONTROLLER MULTIPART UPDATE SUCCESS ===");
            
            return ResponseEntity.ok(convertToDto(updatedProduct));
        } catch (IllegalArgumentException e) {
            System.out.println("=== ADMIN CONTROLLER MULTIPART UPDATE VALIDATION ERROR ===");
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            System.out.println("Runtime error: " + e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("=== ADMIN CONTROLLER MULTIPART UPDATE ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            System.out.println("=== ADMIN CONTROLLER DELETE START ===");
            System.out.println("Product ID to delete: " + id);
            
            // Validate input
            if (id == null) {
                System.out.println("ERROR: Product ID is null");
                return ResponseEntity.badRequest().build();
            }
            
            System.out.println("Calling productService.deleteProduct...");
            productService.deleteProduct(id);
            System.out.println("Product deleted successfully");
            System.out.println("=== ADMIN CONTROLLER DELETE SUCCESS ===");
            
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            System.out.println("Runtime error: " + e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage() != null && (e.getMessage().contains("existing") || e.getMessage().contains("constraint") || e.getMessage().contains("order items") || e.getMessage().contains("cart items") || e.getMessage().contains("Cannot delete product"))) {
                return ResponseEntity.status(409).build(); // Conflict
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("=== ADMIN CONTROLLER DELETE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @PutMapping("/products/{id}/discontinue")
    public ResponseEntity<Void> discontinueProduct(@PathVariable Long id) {
        try {
            System.out.println("=== ADMIN CONTROLLER DISCONTINUE START ===");
            System.out.println("Product ID to discontinue: " + id);
            
            // Validate input
            if (id == null) {
                System.out.println("ERROR: Product ID is null");
                return ResponseEntity.badRequest().build();
            }
            
            System.out.println("Calling productService.markProductAsDiscontinued...");
            productService.markProductAsDiscontinued(id);
            System.out.println("Product discontinued successfully");
            System.out.println("=== ADMIN CONTROLLER DISCONTINUE SUCCESS ===");
            
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            System.out.println("Runtime error: " + e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("=== ADMIN CONTROLLER DISCONTINUE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    // Order management
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            List<OrderDto> orderDtos = orders.stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(orderDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusUpdate statusUpdate) {
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusUpdate.getStatus());
            Order updatedOrder = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(convertOrderToDto(updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            System.out.println("=== ADMIN DELETE ORDER REQUEST ===");
            System.out.println("Order ID to delete: " + id);
            
            // Check if order exists
            Optional<Order> orderOpt = orderService.getOrderById(id);
            if (!orderOpt.isPresent()) {
                System.out.println("Order not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            System.out.println("Found order to delete: " + order.getOrderNumber());
            
            // Delete the order (this will also delete order items due to cascade)
            orderService.deleteOrder(id);
            System.out.println("Order deleted successfully: " + order.getOrderNumber());
            
            return ResponseEntity.ok().body("{\"message\": \"Order deleted successfully\", \"orderNumber\": \"" + order.getOrderNumber() + "\"}");
        } catch (Exception e) {
            System.err.println("Error deleting order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to delete order: " + e.getMessage());
        }
    }
    
    // File upload
    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== FILE UPLOAD START ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            if (file.isEmpty()) {
                System.out.println("ERROR: File is empty");
                return ResponseEntity.badRequest().body(new UploadResponse("File is empty"));
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.out.println("ERROR: Invalid file type: " + contentType);
                return ResponseEntity.badRequest().body(new UploadResponse("Only image files are allowed"));
            }
            
            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.contains(".")) {
                System.out.println("ERROR: Invalid filename: " + originalFilename);
                return ResponseEntity.badRequest().body(new UploadResponse("Invalid filename"));
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return the URL
            String imageUrl = "/uploads/" + filename;
            System.out.println("File uploaded successfully: " + imageUrl);
            System.out.println("=== FILE UPLOAD SUCCESS ===");
            
            return ResponseEntity.ok(new UploadResponse(imageUrl));
            
        } catch (IOException e) {
            System.out.println("=== FILE UPLOAD ERROR ===");
            System.out.println("Error uploading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new UploadResponse("Error uploading file: " + e.getMessage()));
        }
    }
    
    // Helper method for uploading a single file (used by multipart product creation)
    private String uploadSingleFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return null;
            }
            
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                System.out.println("ERROR: Invalid file type: " + contentType);
                return null;
            }
            
            // Create upload directory if it doesn't exist
            String uploadDir = "uploads/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !originalFilename.contains(".")) {
                return null;
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return the relative URL path (will be served by proxy)
            return "/uploads/" + filename;
            
        } catch (IOException e) {
            System.out.println("Error uploading file: " + e.getMessage());
            return null;
        }
    }
    
    // Database test endpoint
    @GetMapping("/test-db")
    public ResponseEntity<String> testDatabase() {
        try {
            System.out.println("=== DATABASE TEST START ===");
            List<Product> products = productService.getAllProducts();
            System.out.println("Database connection successful. Found " + products.size() + " products.");
            System.out.println("=== DATABASE TEST SUCCESS ===");
            return ResponseEntity.ok("Database connection successful. Found " + products.size() + " products.");
        } catch (Exception e) {
            System.out.println("=== DATABASE TEST ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Database connection failed: " + e.getMessage());
        }
    }

    // Simple test endpoint for basic operations
    @GetMapping("/test-simple")
    public ResponseEntity<String> testSimple() {
        try {
            System.out.println("=== SIMPLE TEST START ===");
            return ResponseEntity.ok("Simple test successful - backend is running");
        } catch (Exception e) {
            System.out.println("=== SIMPLE TEST ERROR ===");
            System.out.println("Error: " + e.getMessage());
            return ResponseEntity.status(500).body("Simple test failed: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/test-delete/{id}")
    public ResponseEntity<String> testDelete(@PathVariable Long id) {
        try {
            System.out.println("=== TEST DELETE START ===");
            System.out.println("Testing delete for product ID: " + id);
            
            productService.deleteProduct(id);
            
            System.out.println("=== TEST DELETE SUCCESS ===");
            return ResponseEntity.ok("Product " + id + " deleted successfully");
        } catch (Exception e) {
            System.out.println("=== TEST DELETE ERROR ===");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Delete failed: " + e.getMessage());
        }
    }

    // Admin stats
    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getStats() {
        try {
            List<Product> products = productService.getAllProducts();
            List<Order> orders = orderService.getAllOrders();
            
            AdminStats stats = new AdminStats();
            stats.setTotalProducts(products.size());
            stats.setTotalOrders(orders.size());
            stats.setTotalRevenue(orders.stream().mapToDouble(order -> order.getTotal().doubleValue()).sum());
            stats.setTotalCustomers(orders.stream().mapToLong(o -> o.getUser().getId()).distinct().count());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/recent-orders")
    public ResponseEntity<List<OrderDto>> getRecentOrders() {
        try {
            List<Order> orders = orderService.getAllOrders();
            List<OrderDto> recentOrders = orders.stream()
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .limit(5)
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(recentOrders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Helper methods
    private Product convertToEntity(ProductDto dto) {
        try {
            System.out.println("=== ADMIN CONTROLLER CONVERT TO ENTITY START ===");
            System.out.println("DTO: " + dto);
            
            Product product = new Product();
            System.out.println("Created new Product entity");
            
            product.setId(dto.getId());
            System.out.println("Set ID: " + dto.getId());
            
            // Set required fields with null checks and validation
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Product name is required");
            }
            product.setName(dto.getName().trim());
            System.out.println("Set name: " + product.getName());
            
            if (dto.getDescription() == null || dto.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Product description is required");
            }
            product.setDescription(dto.getDescription().trim());
            System.out.println("Set description: " + product.getDescription());
            
            if (dto.getPrice() == null || dto.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Product price must be greater than 0");
            }
            product.setPrice(dto.getPrice());
            System.out.println("Set price: " + product.getPrice());
            
            if (dto.getStockQuantity() == null || dto.getStockQuantity() < 0) {
                throw new IllegalArgumentException("Product stock quantity must be non-negative");
            }
            product.setStockQuantity(dto.getStockQuantity());
            System.out.println("Set stock quantity: " + product.getStockQuantity());
            
            if (dto.getCategory() == null || dto.getCategory().trim().isEmpty()) {
                throw new IllegalArgumentException("Product category is required");
            }
            product.setCategory(dto.getCategory().trim());
            System.out.println("Set category: " + product.getCategory());
            
            product.setBrand(dto.getBrand());
            System.out.println("Set brand: " + dto.getBrand());
            
            // Handle imageUrls - initialize empty list if null
            if (dto.getImageUrls() != null) {
                product.setImageUrls(dto.getImageUrls());
            } else {
                product.setImageUrls(new ArrayList<>());
            }
            System.out.println("Set image URLs: " + product.getImageUrls());
            
            // Handle size, color, and status fields
            if (dto.getSize() != null) {
                System.out.println("Processing size: " + dto.getSize());
                try {
                    product.setSize(Product.Size.valueOf(dto.getSize()));
                    System.out.println("Set size successfully: " + product.getSize());
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid size value: " + dto.getSize() + ", leaving as null");
                }
            } else {
                System.out.println("Size is null, leaving as null");
            }
            
            if (dto.getColor() != null) {
                System.out.println("Processing color: " + dto.getColor());
                try {
                    product.setColor(Product.Color.valueOf(dto.getColor()));
                    System.out.println("Set color successfully: " + product.getColor());
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid color value: " + dto.getColor() + ", leaving as null");
                }
            } else {
                System.out.println("Color is null, leaving as null");
            }
            
            if (dto.getStatus() != null) {
                System.out.println("Processing status: " + dto.getStatus());
                try {
                    product.setStatus(Product.ProductStatus.valueOf(dto.getStatus()));
                    System.out.println("Set status successfully: " + product.getStatus());
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid status value: " + dto.getStatus() + ", using default ACTIVE");
                    product.setStatus(Product.ProductStatus.ACTIVE);
                }
            } else {
                System.out.println("Status is null, using default ACTIVE");
                product.setStatus(Product.ProductStatus.ACTIVE);
            }
            
            System.out.println("Final product status: " + product.getStatus());
            System.out.println("=== ADMIN CONTROLLER CONVERT TO ENTITY SUCCESS ===");
            
            return product;
        } catch (Exception e) {
            System.out.println("=== ADMIN CONTROLLER CONVERT TO ENTITY ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            throw e; // Re-throw to be caught by calling method
        }
    }
    
    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setCategory(product.getCategory());
        dto.setBrand(product.getBrand());
        dto.setImageUrls(product.getImageUrls());
        dto.setSize(product.getSize() != null ? product.getSize().name() : null);
        dto.setColor(product.getColor() != null ? product.getColor().name() : null);
        dto.setStatus(product.getStatus() != null ? product.getStatus().name() : "ACTIVE");
        return dto;
    }
    
    private OrderDto convertOrderToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setSubtotal(order.getSubtotal());
        dto.setTax(order.getTax());
        dto.setShippingCost(order.getShippingCost());
        dto.setTotal(order.getTotal());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setOrderDate(order.getOrderDate());
        
        // Add user ID
        if (order.getUser() != null) {
            dto.setUserId(order.getUser().getId());
        }
        
        // Add order items with product images
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            List<com.piamonte.biz.OrderItemDto> orderItemDtos = order.getOrderItems().stream()
                .map(this::convertOrderItemToDto)
                .collect(Collectors.toList());
            dto.setOrderItems(orderItemDtos);
        }
        
        if (order.getShippingAddress() != null) {
            dto.setShippingAddress(new com.piamonte.biz.AddressDto(
                order.getShippingAddress().getStreet(),
                order.getShippingAddress().getCity(),
                order.getShippingAddress().getState(),
                order.getShippingAddress().getZipCode(),
                order.getShippingAddress().getCountry()
            ));
        }
        
        if (order.getBillingAddress() != null) {
            dto.setBillingAddress(new com.piamonte.biz.AddressDto(
                order.getBillingAddress().getStreet(),
                order.getBillingAddress().getCity(),
                order.getBillingAddress().getState(),
                order.getBillingAddress().getZipCode(),
                order.getBillingAddress().getCountry()
            ));
        }
        
        return dto;
    }
    
    private com.piamonte.biz.OrderItemDto convertOrderItemToDto(com.piamonte.biz.data.OrderItem orderItem) {
        com.piamonte.biz.OrderItemDto dto = new com.piamonte.biz.OrderItemDto();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProduct().getId());
        dto.setProductName(orderItem.getProduct().getName());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setQuantity(orderItem.getQuantity());
        dto.setTotalPrice(orderItem.getUnitPrice().multiply(new java.math.BigDecimal(orderItem.getQuantity())));
        
        // Add product image URL (use first image if available)
        if (orderItem.getProduct().getImageUrls() != null && !orderItem.getProduct().getImageUrls().isEmpty()) {
            dto.setImageUrl(orderItem.getProduct().getImageUrls().get(0));
        }
        
        return dto;
    }
    
    // DTOs
    public static class OrderStatusUpdate {
        private String status;
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    public static class UploadResponse {
        private String imageUrl;
        
        public UploadResponse(String imageUrl) {
            this.imageUrl = imageUrl;
        }
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
    
    public static class AdminStats {
        private int totalProducts;
        private int totalOrders;
        private double totalRevenue;
        private long totalCustomers;
        
        public int getTotalProducts() { return totalProducts; }
        public void setTotalProducts(int totalProducts) { this.totalProducts = totalProducts; }
        
        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
        
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        
        public long getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
    }
}
