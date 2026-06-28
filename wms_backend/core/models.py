from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


# ─────────────────────────────────────────────
# Custom User Manager
# ─────────────────────────────────────────────
class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, role='operator'):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(email, name, password, role='admin')
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


# ─────────────────────────────────────────────
# User Model (replaces Django's default User)
# ─────────────────────────────────────────────
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('operator', 'Warehouse Operator'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='operator')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserManager()

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f'{self.name} ({self.role})'

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_operator(self):
        return self.role == 'operator'


# ─────────────────────────────────────────────
# Category
# ─────────────────────────────────────────────
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['name']
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# Warehouse
# Assumption: Location is a proper model, not just a text field.
# This allows multiple warehouses and operator assignments.
# ─────────────────────────────────────────────
class Warehouse(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'warehouses'
        ordering = ['name']

    def __str__(self):
        return self.name


# ─────────────────────────────────────────────
# Product
# Soft-delete: status=inactive keeps history intact.
# ─────────────────────────────────────────────
class Product(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name='products'
    )
    unit_price = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    minimum_stock_level = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    description = models.TextField(blank=True)
    barcode = models.CharField(max_length=100, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.sku})'


# ─────────────────────────────────────────────
# Inventory
# One row per product-warehouse combination.
# Assumption: qty_reserved is set when a StockOut movement is PENDING.
# ─────────────────────────────────────────────
class Inventory(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name='inventory_records'
    )
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.PROTECT, related_name='inventory_records'
    )
    quantity_available = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    quantity_reserved = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory'
        unique_together = ('product', 'warehouse')
        ordering = ['-last_updated']

    def __str__(self):
        return f'{self.product.name} @ {self.warehouse.name}: {self.quantity_available}'

    @property
    def is_low_stock(self):
        return self.quantity_available <= self.product.minimum_stock_level

    @property
    def quantity_on_hand(self):
        return self.quantity_available - self.quantity_reserved


# ─────────────────────────────────────────────
# Stock Movement
# Assumption flow:
#   Admin creates movement with status=PENDING and assigns an operator.
#   Operator marks it COMPLETED (only the assigned operator can do this).
#   Inventory is updated atomically when status moves to COMPLETED.
# ─────────────────────────────────────────────
class StockMovement(models.Model):
    MOVEMENT_TYPE_CHOICES = [
        ('stock_in', 'Stock In'),
        ('stock_out', 'Stock Out'),
        ('adjustment', 'Adjustment'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name='stock_movements'
    )
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.PROTECT, related_name='stock_movements'
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPE_CHOICES)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Assigned operator — only this user may complete the movement
    assigned_operator = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='assigned_movements',
        null=True,
        blank=True,
        limit_choices_to={'role': 'operator'},
    )
    # Who actually completed it
    completed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='completed_movements',
        null=True,
        blank=True,
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_movements',
    )

    remarks = models.TextField(blank=True)
    barcode_scanned = models.CharField(max_length=100, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stock_movements'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_movement_type_display()} — {self.product.name} x{self.quantity} [{self.status}]'
