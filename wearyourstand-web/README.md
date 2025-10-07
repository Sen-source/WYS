# Wear Your Stand - E-commerce Web Application

A complete e-commerce web application built with Angular 17 and Angular Material, connected to a Spring Boot backend.

## Features

- **Authentication**: Login and registration with JWT token management
- **Product Catalog**: Browse products with search and filtering
- **Shopping Cart**: Add, update, and remove items from cart
- **Checkout**: Complete order placement with shipping information
- **Order Management**: View order history and status
- **Responsive Design**: Mobile-friendly interface using Angular Material

## Prerequisites

- Node.js (v16 or higher)
- Angular CLI (v17 or higher)
- Spring Boot backend running on port 10080

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
ng serve
```

3. Open your browser and navigate to `http://localhost:4200`

## Backend Configuration

The application is configured to connect to a Spring Boot backend running on `http://localhost:8080`. Make sure your backend is running before starting the frontend.

## API Endpoints

The application expects the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/{productId}` - Remove item from cart
- `POST /api/cart/checkout` - Process checkout

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── home/
│   │   ├── orders/
│   │   ├── product-detail/
│   │   └── products/
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── cart.service.ts
│   │   └── product.service.ts
│   ├── app.component.ts
│   └── app.routes.ts
└── styles.css
```

## Key Features

### Authentication
- JWT token-based authentication
- Automatic token attachment to API requests
- Route guards for protected pages
- Persistent login state

### Shopping Cart
- Real-time cart updates
- Quantity management
- Item removal
- Cart persistence across sessions

### Product Management
- Product listing with search and filtering
- Product detail pages
- Stock quantity management
- Image handling with fallbacks

### Checkout Process
- Shipping address collection
- Payment method selection
- Order confirmation
- Order history tracking

## Development

### Running Tests
```bash
ng test
```

### Building for Production
```bash
ng build --prod
```

### Code Linting
```bash
ng lint
```

## Technologies Used

- Angular 17
- Angular Material
- TypeScript
- RxJS
- HTML5/CSS3
- Bootstrap (for some styling)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
