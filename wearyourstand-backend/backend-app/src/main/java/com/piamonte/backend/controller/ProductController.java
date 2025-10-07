package com.piamonte.backend.controller;

import com.piamonte.biz.ProductDto;
import com.piamonte.biz.ProductSizeVariantDto;
import com.piamonte.biz.ProductService;
import com.piamonte.biz.data.Product;
import com.piamonte.biz.data.ProductSizeVariant;
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
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        List<ProductDto> productDtos = products.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productDtos);
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<ProductDto>> getAvailableProducts() {
        List<Product> products = productService.getAvailableProducts();
        List<ProductDto> productDtos = products.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productDtos);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        List<ProductDto> productDtos = products.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productDtos);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ProductDto>> searchProducts(@RequestParam String q) {
        List<Product> products = productService.searchProducts(q);
        List<ProductDto> productDtos = products.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(productDtos);
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = productService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        Optional<Product> productOpt = productService.getProductById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(convertToDto(productOpt.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto productDto) {
        try {
            System.out.println("=== PRODUCT CONTROLLER CREATE START ===");
            System.out.println("Product DTO: " + productDto);
            
            // Initialize imageUrls if null
            if (productDto.getImageUrls() == null) {
                productDto.setImageUrls(new ArrayList<>());
            }
            
            Product product = convertToEntity(productDto);
            Product savedProduct = productService.createProduct(product);
            
            System.out.println("Product created successfully with ID: " + savedProduct.getId());
            System.out.println("=== PRODUCT CONTROLLER CREATE SUCCESS ===");
            
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
    @PostMapping(value = "/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> createProductWithImages(
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            System.out.println("=== PRODUCT CONTROLLER MULTIPART CREATION START ===");
            
            // Get user context from JWT
            String userEmail = getCurrentUserEmail();
            System.out.println("User email from JWT: " + userEmail);
            
            // Deserialize JSON string to ProductDto
            ProductDto productDto = objectMapper.readValue(productJson, ProductDto.class);
            System.out.println("Product DTO received: " + productDto);
            System.out.println("Product name: " + productDto.getName());
            System.out.println("Product description: " + productDto.getDescription());
            System.out.println("Product price: " + productDto.getPrice());
            System.out.println("Product stock: " + productDto.getStockQuantity());
            System.out.println("Product category: " + productDto.getCategory());
            System.out.println("Product brand: " + productDto.getBrand());
            System.out.println("Product size: " + productDto.getSize());
            System.out.println("Product color: " + productDto.getColor());
            System.out.println("Product status: " + productDto.getStatus());
            System.out.println("Images count: " + (images != null ? images.size() : 0));
            
            // Handle image uploads if provided
            if (images != null && !images.isEmpty()) {
                System.out.println("Processing " + images.size() + " image files...");
                List<String> imageUrls = new ArrayList<>();
                for (int i = 0; i < images.size(); i++) {
                    MultipartFile image = images.get(i);
                    System.out.println("Processing image " + (i + 1) + ": " + image.getOriginalFilename());
                    System.out.println("Image size: " + image.getSize() + " bytes");
                    System.out.println("Image content type: " + image.getContentType());
                    System.out.println("Image empty: " + image.isEmpty());
                    
                    if (!image.isEmpty()) {
                        System.out.println("Uploading image " + (i + 1) + "...");
                        String imageUrl = uploadSingleFile(image);
                        if (imageUrl != null) {
                            imageUrls.add(imageUrl);
                            System.out.println("Image " + (i + 1) + " uploaded successfully: " + imageUrl);
                        } else {
                            System.out.println("Failed to upload image " + (i + 1));
                        }
                    } else {
                        System.out.println("Skipping empty image " + (i + 1));
                    }
                }
                productDto.setImageUrls(imageUrls);
                System.out.println("Total uploaded images: " + imageUrls.size());
                System.out.println("Image URLs: " + imageUrls);
            } else {
                System.out.println("No images provided, setting empty imageUrls list");
                productDto.setImageUrls(new ArrayList<>());
            }
            
            System.out.println("Converting DTO to entity...");
            Product product = convertToEntity(productDto);
            System.out.println("Entity converted successfully");
            System.out.println("Entity name: " + product.getName());
            System.out.println("Entity status: " + product.getStatus());
            System.out.println("Entity imageUrls: " + product.getImageUrls());
            
            System.out.println("Calling productService.createProduct...");
            Product savedProduct = productService.createProduct(product);
            System.out.println("Product created successfully with ID: " + savedProduct.getId());
            
            System.out.println("Converting to DTO for response...");
            ProductDto responseDto = convertToDto(savedProduct);
            System.out.println("=== PRODUCT CONTROLLER MULTIPART CREATION SUCCESS ===");
            
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            System.out.println("=== PRODUCT CONTROLLER MULTIPART CREATION VALIDATION ERROR ===");
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("=== PRODUCT CONTROLLER MULTIPART CREATION ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto productDto) {
        try {
            System.out.println("=== PRODUCT CONTROLLER UPDATE START ===");
            
            // Get user context from JWT
            String userEmail = getCurrentUserEmail();
            System.out.println("User email from JWT: " + userEmail);
            
            System.out.println("Product ID: " + id);
            System.out.println("Product DTO: " + productDto);
            System.out.println("Product name: " + productDto.getName());
            System.out.println("Product description: " + productDto.getDescription());
            System.out.println("Product price: " + productDto.getPrice());
            System.out.println("Product stock: " + productDto.getStockQuantity());
            System.out.println("Product category: " + productDto.getCategory());
            System.out.println("Product brand: " + productDto.getBrand());
            System.out.println("Product size: " + productDto.getSize());
            System.out.println("Product color: " + productDto.getColor());
            System.out.println("Product status: " + productDto.getStatus());
            System.out.println("Product imageUrls: " + productDto.getImageUrls());
            
            productDto.setId(id);
            System.out.println("Set product ID to: " + productDto.getId());
            
            System.out.println("Converting DTO to entity...");
            Product product = convertToEntity(productDto);
            System.out.println("Entity converted successfully");
            System.out.println("Entity ID: " + product.getId());
            System.out.println("Entity name: " + product.getName());
            System.out.println("Entity status: " + product.getStatus());
            
            System.out.println("Calling productService.updateProduct...");
            Product updatedProduct = productService.updateProduct(product);
            System.out.println("Product updated successfully with ID: " + updatedProduct.getId());
            
            System.out.println("Converting to DTO for response...");
            ProductDto responseDto = convertToDto(updatedProduct);
            System.out.println("=== PRODUCT CONTROLLER UPDATE SUCCESS ===");
            
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            System.out.println("=== PRODUCT CONTROLLER UPDATE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            
            // Return appropriate HTTP status based on error type
            if (e instanceof IllegalArgumentException) {
                System.out.println("Validation error: " + e.getMessage());
                return ResponseEntity.badRequest().build();
            } else if (e.getMessage() != null && e.getMessage().contains("not found")) {
                System.out.println("Product not found: " + e.getMessage());
                return ResponseEntity.notFound().build();
            } else {
                System.out.println("Unexpected error: " + e.getMessage());
                return ResponseEntity.status(500).build();
            }
        }
    }
    
    // Product editing with multipart support (for forms with images)
    @PutMapping(value = "/{id}/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDto> updateProductWithImages(
            @PathVariable Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            System.out.println("=== PRODUCT CONTROLLER MULTIPART UPDATE START ===");
            System.out.println("Product ID: " + id);
            
            // Deserialize JSON string to ProductDto
            ProductDto productDto = objectMapper.readValue(productJson, ProductDto.class);
            System.out.println("Product DTO received: " + productDto);
            System.out.println("Product name: " + productDto.getName());
            System.out.println("Product description: " + productDto.getDescription());
            System.out.println("Product price: " + productDto.getPrice());
            System.out.println("Product stock: " + productDto.getStockQuantity());
            System.out.println("Product category: " + productDto.getCategory());
            System.out.println("Product brand: " + productDto.getBrand());
            System.out.println("Product size: " + productDto.getSize());
            System.out.println("Product color: " + productDto.getColor());
            System.out.println("Product status: " + productDto.getStatus());
            System.out.println("Images count: " + (images != null ? images.size() : 0));
            
            // Set the ID from path variable
            productDto.setId(id);
            System.out.println("Set product ID to: " + productDto.getId());
            
            // Handle image uploads if provided
            if (images != null && !images.isEmpty()) {
                System.out.println("Processing " + images.size() + " image files...");
                List<String> imageUrls = new ArrayList<>();
                for (int i = 0; i < images.size(); i++) {
                    MultipartFile image = images.get(i);
                    System.out.println("Processing image " + (i + 1) + ": " + image.getOriginalFilename());
                    System.out.println("Image size: " + image.getSize() + " bytes");
                    System.out.println("Image content type: " + image.getContentType());
                    System.out.println("Image empty: " + image.isEmpty());
                    
                    if (!image.isEmpty()) {
                        System.out.println("Uploading image " + (i + 1) + "...");
                        String imageUrl = uploadSingleFile(image);
                        if (imageUrl != null) {
                            imageUrls.add(imageUrl);
                            System.out.println("Image " + (i + 1) + " uploaded successfully: " + imageUrl);
                        } else {
                            System.out.println("Failed to upload image " + (i + 1));
                        }
                    } else {
                        System.out.println("Skipping empty image " + (i + 1));
                    }
                }
                productDto.setImageUrls(imageUrls);
                System.out.println("Total uploaded images: " + imageUrls.size());
                System.out.println("Image URLs: " + imageUrls);
            } else {
                System.out.println("No new images provided, keeping existing imageUrls");
                // Keep existing imageUrls if no new images provided
                if (productDto.getImageUrls() == null) {
                    productDto.setImageUrls(new ArrayList<>());
                }
            }
            
            System.out.println("Converting DTO to entity...");
            Product product = convertToEntity(productDto);
            System.out.println("Entity converted successfully");
            System.out.println("Entity ID: " + product.getId());
            System.out.println("Entity name: " + product.getName());
            System.out.println("Entity status: " + product.getStatus());
            System.out.println("Entity imageUrls: " + product.getImageUrls());
            
            System.out.println("Calling productService.updateProduct...");
            Product updatedProduct = productService.updateProduct(product);
            System.out.println("Product updated successfully with ID: " + updatedProduct.getId());
            
            System.out.println("Converting to DTO for response...");
            ProductDto responseDto = convertToDto(updatedProduct);
            System.out.println("=== PRODUCT CONTROLLER MULTIPART UPDATE SUCCESS ===");
            
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            System.out.println("=== PRODUCT CONTROLLER MULTIPART UPDATE VALIDATION ERROR ===");
            System.out.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("=== PRODUCT CONTROLLER MULTIPART UPDATE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            System.out.println("=== PRODUCT CONTROLLER DELETE START ===");
            
            // Get user context from JWT
            String userEmail = getCurrentUserEmail();
            System.out.println("User email from JWT: " + userEmail);
            
            System.out.println("Product ID to delete: " + id);
            
            System.out.println("Calling productService.deleteProduct...");
            productService.deleteProduct(id);
            System.out.println("Product deleted successfully");
            System.out.println("=== PRODUCT CONTROLLER DELETE SUCCESS ===");
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("=== PRODUCT CONTROLLER DELETE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            
            // Return appropriate HTTP status based on error type
            if (e instanceof IllegalArgumentException) {
                System.out.println("Validation error: " + e.getMessage());
                return ResponseEntity.badRequest().build();
            } else if (e.getMessage() != null && e.getMessage().contains("not found")) {
                System.out.println("Product not found: " + e.getMessage());
                return ResponseEntity.notFound().build();
            } else if (e.getMessage() != null && (e.getMessage().contains("existing") || e.getMessage().contains("constraint"))) {
                System.out.println("Conflict error: " + e.getMessage());
                return ResponseEntity.status(409).build(); // Conflict
            } else {
                System.out.println("Unexpected error: " + e.getMessage());
                return ResponseEntity.status(500).build(); // Internal Server Error
            }
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
        
        // Convert size variants
        if (product.getSizeVariants() != null) {
            List<ProductSizeVariantDto> sizeVariantDtos = product.getSizeVariants().stream()
                .map(variant -> new ProductSizeVariantDto(variant.getSize().name(), variant.getQuantity()))
                .collect(Collectors.toList());
            dto.setSizeVariants(sizeVariantDtos);
        }
        
        return dto;
    }
    
    private Product convertToEntity(ProductDto dto) {
        try {
            System.out.println("=== CONVERT TO ENTITY START ===");
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
            
            // Handle size variants
            if (dto.getSizeVariants() != null && !dto.getSizeVariants().isEmpty()) {
                System.out.println("Processing size variants: " + dto.getSizeVariants().size());
                List<ProductSizeVariant> sizeVariants = new ArrayList<>();
                for (ProductSizeVariantDto variantDto : dto.getSizeVariants()) {
                    try {
                        ProductSizeVariant variant = new ProductSizeVariant();
                        variant.setProduct(product);
                        variant.setSize(Product.Size.valueOf(variantDto.getSize()));
                        variant.setQuantity(variantDto.getQuantity());
                        sizeVariants.add(variant);
                        System.out.println("Added size variant: " + variantDto.getSize() + " - " + variantDto.getQuantity());
                    } catch (IllegalArgumentException e) {
                        System.out.println("Invalid size in variant: " + variantDto.getSize());
                    }
                }
                product.setSizeVariants(sizeVariants);
            } else {
                System.out.println("No size variants provided, initializing empty list");
                product.setSizeVariants(new ArrayList<>());
            }
            
            // Set updated timestamp for updates
            if (dto.getId() != null) {
                product.setUpdatedAt(java.time.LocalDateTime.now());
                System.out.println("Set updated timestamp for existing product");
            }
            
            System.out.println("=== CONVERT TO ENTITY SUCCESS ===");
            
            return product;
        } catch (Exception e) {
            System.out.println("=== CONVERT TO ENTITY ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            throw e; // Re-throw to be caught by calling method
        }
    }
    
    // Helper method for uploading a single file (used by multipart product creation)
    private String uploadSingleFile(MultipartFile file) {
        try {
            System.out.println("=== UPLOAD SINGLE FILE START ===");
            System.out.println("File original name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("File content type: " + file.getContentType());
            System.out.println("File empty: " + file.isEmpty());
            
            if (file.isEmpty()) {
                System.out.println("File is empty, returning null");
                return null;
            }
            
            // Validate file type
            String contentType = file.getContentType();
            System.out.println("Validating content type: " + contentType);
            if (contentType == null || !contentType.startsWith("image/")) {
                System.out.println("ERROR: Invalid file type: " + contentType);
                return null;
            }
            System.out.println("File type validation passed");
            
            // Create upload directory if it doesn't exist
            String uploadDir = "uploads";
            Path uploadPath = Paths.get(uploadDir);
            System.out.println("Upload path: " + uploadPath.toAbsolutePath());
            
            if (!Files.exists(uploadPath)) {
                System.out.println("Creating upload directory...");
                Files.createDirectories(uploadPath);
                System.out.println("Upload directory created successfully");
            } else {
                System.out.println("Upload directory already exists");
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            System.out.println("Original filename: " + originalFilename);
            
            if (originalFilename == null || !originalFilename.contains(".")) {
                System.out.println("ERROR: Invalid filename: " + originalFilename);
                return null;
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            System.out.println("Generated filename: " + filename);
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            System.out.println("Full file path: " + filePath.toAbsolutePath());
            
            System.out.println("Copying file...");
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File copied successfully");
            
            // Return the relative URL path (will be served by proxy)
            String imageUrl = "/uploads/" + filename;
            System.out.println("Generated image URL: " + imageUrl);
            System.out.println("=== UPLOAD SINGLE FILE SUCCESS ===");
            
            return imageUrl;
            
        } catch (IOException e) {
            System.out.println("=== UPLOAD SINGLE FILE ERROR ===");
            System.out.println("Error type: " + e.getClass().getSimpleName());
            System.out.println("Error message: " + e.getMessage());
            System.out.println("Stack trace:");
            e.printStackTrace();
            return null;
        }
    }
    
    // Helper method to get current user email from JWT
    private String getCurrentUserEmail() {
        try {
            org.springframework.security.core.Authentication authentication = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof com.piamonte.biz.data.User) {
                com.piamonte.biz.data.User user = (com.piamonte.biz.data.User) authentication.getPrincipal();
                return user.getEmail();
            }
        } catch (Exception e) {
            System.out.println("Error getting current user email: " + e.getMessage());
        }
        return "unknown";
    }
}
