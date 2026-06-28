from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from .models import Category, Warehouse, Product, Inventory, StockMovement

User = get_user_model()


# ─────────────────────────────────────────────
# JWT — embed role + name into token payload
# ─────────────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['name'] = user.name
        token['role'] = user.role
        token['email'] = user.email
        token['status'] = user.status
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.status == 'inactive':
            raise serializers.ValidationError(
                'Your account has been disabled. Contact an administrator.'
            )
        data['user'] = {
            'id': self.user.id,
            'name': self.user.name,
            'email': self.user.email,
            'role': self.user.role,
            'status': self.user.status,
        }
        return data


# ─────────────────────────────────────────────
# User / Operator serializers
# ─────────────────────────────────────────────
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'status', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class OperatorCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'status']
        read_only_fields = ['id']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(role='operator', **validated_data)
        user.set_password(password)
        user.save()
        return user


class OperatorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'status']

    def validate_status(self, value):
        if value not in ['active', 'inactive']:
            raise serializers.ValidationError('Status must be active or inactive.')
        return value


# ─────────────────────────────────────────────
# Category
# ─────────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─────────────────────────────────────────────
# Warehouse
# ─────────────────────────────────────────────
class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'address', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# ─────────────────────────────────────────────
# Product
# ─────────────────────────────────────────────
class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'category_name',
            'unit_price', 'minimum_stock_level', 'status', 'barcode',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    inventory_records = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'category_name',
            'unit_price', 'minimum_stock_level', 'status',
            'description', 'barcode', 'inventory_records',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_inventory_records(self, obj):
        records = obj.inventory_records.select_related('warehouse').all()
        return InventorySerializer(records, many=True).data


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'sku', 'category', 'unit_price',
            'minimum_stock_level', 'status', 'description', 'barcode',
        ]

    def validate_sku(self, value):
        qs = Product.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('A product with this SKU already exists.')
        return value.upper()

    def validate_minimum_stock_level(self, value):
        if value < 0:
            raise serializers.ValidationError('Minimum stock level cannot be negative.')
        return value

    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Unit price cannot be negative.')
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Product name is required.')
        return value.strip()


# ─────────────────────────────────────────────
# Inventory
# ─────────────────────────────────────────────
class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_min_stock = serializers.IntegerField(source='product.minimum_stock_level', read_only=True)
    product_status = serializers.CharField(source='product.status', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id', 'product', 'product_name', 'product_sku', 'product_min_stock',
            'product_status', 'category_name',
            'warehouse', 'warehouse_name',
            'quantity_available', 'quantity_reserved', 'is_low_stock',
            'last_updated', 'created_at',
        ]
        read_only_fields = ['id', 'last_updated', 'created_at', 'is_low_stock']

    def validate_quantity_available(self, value):
        if value < 0:
            raise serializers.ValidationError('Quantity available cannot be negative.')
        return value

    def validate_quantity_reserved(self, value):
        if value < 0:
            raise serializers.ValidationError('Quantity reserved cannot be negative.')
        return value

    def validate(self, data):
        # On update: reserved cannot exceed available
        available = data.get('quantity_available',
            self.instance.quantity_available if self.instance else 0)
        reserved = data.get('quantity_reserved',
            self.instance.quantity_reserved if self.instance else 0)
        if reserved > available:
            raise serializers.ValidationError(
                'Quantity reserved cannot exceed quantity available.'
            )
        # Unique together check
        product = data.get('product', getattr(self.instance, 'product', None))
        warehouse = data.get('warehouse', getattr(self.instance, 'warehouse', None))
        if product and warehouse:
            qs = Inventory.objects.filter(product=product, warehouse=warehouse)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    'An inventory record for this product and warehouse already exists.'
                )
        return data


# ─────────────────────────────────────────────
# Stock Movement
# ─────────────────────────────────────────────
class StockMovementListSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    assigned_operator_name = serializers.CharField(
        source='assigned_operator.name', read_only=True
    )
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.name', read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_sku',
            'warehouse', 'warehouse_name',
            'movement_type', 'quantity', 'status',
            'assigned_operator', 'assigned_operator_name',
            'created_by', 'created_by_name',
            'completed_by', 'completed_by_name',
            'remarks', 'barcode_scanned',
            'completed_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'created_by', 'completed_by', 'completed_at',
            'created_at', 'updated_at',
        ]


class StockMovementCreateSerializer(serializers.ModelSerializer):
    """Admin creates + assigns a stock movement."""

    class Meta:
        model = StockMovement
        fields = [
            'product', 'warehouse', 'movement_type', 'quantity',
            'assigned_operator', 'remarks', 'barcode_scanned',
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Quantity must be greater than zero.')
        return value

    def validate(self, data):
        movement_type = data.get('movement_type')
        product = data.get('product')
        warehouse = data.get('warehouse')
        quantity = data.get('quantity', 0)

        if movement_type == 'stock_out':
            try:
                inv = Inventory.objects.get(product=product, warehouse=warehouse)
                available = inv.quantity_available - inv.quantity_reserved
                if quantity > available:
                    raise serializers.ValidationError(
                        f'Stock Out quantity ({quantity}) exceeds available stock ({available}).'
                    )
            except Inventory.DoesNotExist:
                raise serializers.ValidationError(
                    'No inventory record found for this product and warehouse.'
                )

        assigned_operator = data.get('assigned_operator')
        if assigned_operator and assigned_operator.role != 'operator':
            raise serializers.ValidationError(
                'Assigned user must have the Warehouse Operator role.'
            )
        if assigned_operator and assigned_operator.status == 'inactive':
            raise serializers.ValidationError(
                'Cannot assign movement to an inactive operator.'
            )

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        movement = StockMovement.objects.create(
            created_by=request.user,
            status='pending',
            **validated_data
        )
        # If stock_out, reserve the quantity immediately
        if movement.movement_type == 'stock_out':
            inv = Inventory.objects.get(
                product=movement.product, warehouse=movement.warehouse
            )
            inv.quantity_reserved += movement.quantity
            inv.save()
        return movement


class StockMovementCompleteSerializer(serializers.ModelSerializer):
    """
    Operator completes (or cancels) a movement.
    Inventory is updated atomically here.
    """

    class Meta:
        model = StockMovement
        fields = ['status', 'remarks', 'barcode_scanned']

    def validate_status(self, value):
        if value not in ['completed', 'cancelled']:
            raise serializers.ValidationError(
                'You can only set status to completed or cancelled.'
            )
        return value

    def validate(self, data):
        movement = self.instance
        if movement.status != 'pending':
            raise serializers.ValidationError(
                'Only pending movements can be completed or cancelled.'
            )
        return data

    def update(self, instance, validated_data):
        request = self.context.get('request')
        new_status = validated_data.get('status')

        with transaction.atomic():
            inv = Inventory.objects.select_for_update().get(
                product=instance.product, warehouse=instance.warehouse
            )

            if new_status == 'completed':
                if instance.movement_type == 'stock_in':
                    inv.quantity_available += instance.quantity

                elif instance.movement_type == 'stock_out':
                    # Release reservation and deduct
                    inv.quantity_reserved = max(0, inv.quantity_reserved - instance.quantity)
                    if inv.quantity_available < instance.quantity:
                        raise serializers.ValidationError(
                            'Insufficient stock to complete this movement.'
                        )
                    inv.quantity_available -= instance.quantity

                elif instance.movement_type == 'adjustment':
                    # Adjustment: quantity is the new absolute value
                    inv.quantity_available = instance.quantity

                inv.save()
                instance.completed_by = request.user
                instance.completed_at = timezone.now()

            elif new_status == 'cancelled':
                # Release any reservation
                if instance.movement_type == 'stock_out':
                    inv.quantity_reserved = max(0, inv.quantity_reserved - instance.quantity)
                    inv.save()

            instance.status = new_status
            instance.remarks = validated_data.get('remarks', instance.remarks)
            instance.barcode_scanned = validated_data.get('barcode_scanned', instance.barcode_scanned)
            instance.save()

        return instance


# ─────────────────────────────────────────────
# Dashboard serializers
# ─────────────────────────────────────────────
class AdminDashboardSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    total_inventory_units = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    active_operators = serializers.IntegerField()
    recent_movements = StockMovementListSerializer(many=True)
    low_stock_list = InventorySerializer(many=True)


class OperatorDashboardSerializer(serializers.Serializer):
    products_received_today = serializers.IntegerField()
    products_issued_today = serializers.IntegerField()
    pending_stock_updates = serializers.IntegerField()
    low_stock_alerts = serializers.IntegerField()
    pending_movements = StockMovementListSerializer(many=True)
