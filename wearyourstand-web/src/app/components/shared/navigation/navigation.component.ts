import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  cartItemCount = 0;
  showUserMenu = false;

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCartCount();
  }

  loadCartCount(): void {
    // Subscribe to cart changes instead of making a direct API call
    this.cartService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;
    });
  }

  toggleUserMenu(): void {
    console.log('Toggle user menu clicked');
    this.showUserMenu = !this.showUserMenu;
    console.log('Show user menu:', this.showUserMenu);
  }

  logout(): void {
    console.log('Logout clicked');
    try {
      // Close menu
      this.showUserMenu = false;
      
      // Clear authentication
      this.authService.logout();
      console.log('Auth service logout completed');
      
      // Navigate to home
      this.router.navigate(['/home']).then(() => {
        console.log('Navigation to home completed');
      }).catch(error => {
        console.error('Navigation error:', error);
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  onMenuOpen(): void {
    console.log('User menu opened');
  }

  onMenuClose(): void {
    console.log('User menu closed');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenuContainer = target.closest('.user-menu-container');
    
    if (!userMenuContainer && this.showUserMenu) {
      this.showUserMenu = false;
      console.log('Menu closed by clicking outside');
    }
  }
}
