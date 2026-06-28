from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Sum, F, Q
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Warehouse, Product, Inventory, StockMovement
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserListSerializer,
    OperatorCreateSerializer,
    OperatorUpdateSerializer,
    CategorySerializer,
    WarehouseSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    InventorySerializer,
    StockMovementListSerializer,
    StockMovementCreateSerializer,
    StockMovementCompleteSerializer,
)
from .permissions import IsAdmin, IsOperator, IsAdminOrReadOnlyOperator, IsAssignedOperator
from .filters import ProductFilter, InventoryFilter, StockMovementFilter

User = get_user_model()


# ─────────────────────────────────────────────
# Auth Views
# ─────────────────────────────────────────────
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """Blacklist the refresh token on logout."""
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {'detail': 'Refresh token is required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {'detail': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MeView(APIView):
    """Return current user info — used to rehydrate auth on page refresh."""
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'status': user.status,
        })


# ─────────────────────────────────────────────
# Dashboard Views
# ─────────────────────────────────────────────
class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()

        total_products = Product.objects.filter(status='active').count()

        total_inventory_units = (
            Inventory.objects.aggregate(total=Sum('quantity_available'))['total'] or 0
        )

        low_stock_items = Inventory.objects.filter(
            quantity_available__lte=F('product__minimum_stock_level'),
            product__status='active'
        ).count()

        active_operators = User.objects.filter(role='operator', status='active').count()

        recent_movements = StockMovement.objects.select_related(
            'product', 'warehouse', 'assigned_operator', 'created_by', 'completed_by'
        ).order_by('-created_at')[:10]

        low_stock_list = Inventory.objects.filter(
            quantity_available__lte=F('product__minimum_stock_level'),
            product__status='active'
        ).select_related('product', 'warehouse', 'product__category')[:10]

        from .serializers import StockMovementListSerializer, InventorySerializer
        return Response({
            'total_products': total_products,
            'total_inventory_units': total_inventory_units,
            'low_stock_items': low_stock_items,
            'active_operators': active_operators,
            'recent_movements': StockMovementListSerializer(recent_movements, many=True).data,
            'low_stock_list': InventorySerializer(low_stock_list, many=True).data,
        })


class OperatorDashboardView(APIView):
    permission_classes = [IsOperator]

    def get(self, request):
        today = timezone.now().date()
        user = request.user

        products_received_today = StockMovement.objects.filter(
            assigned_operator=user,
            movement_type='stock_in',
            status='completed',
            completed_at__date=today
        ).count()

        products_issued_today = StockMovement.objects.filter(
            assigned_operator=user,
            movement_type='stock_out',
            status='completed',
            completed_at__date=today
        ).count()

        # Assumption: Pending Stock Updates = movements assigned to this operator with status=pending
        pending_stock_updates = StockMovement.objects.filter(
            assigned_operator=user,
            status='pending'
        ).count()

        low_stock_alerts = Inventory.objects.filter(
            quantity_available__lte=F('product__minimum_stock_level'),
            product__status='active'
        ).count()

        pending_movements = StockMovement.objects.filter(
            assigned_operator=user,
            status='pending'
        ).select_related('product', 'warehouse', 'assigned_operator', 'created_by')

        from .serializers import StockMovementListSerializer
        return Response({
            'products_received_today': products_received_today,
            'products_issued_today': products_issued_today,
            'pending_stock_updates': pending_stock_updates,
            'low_stock_alerts': low_stock_alerts,
            'pending_movements': StockMovementListSerializer(pending_movements, many=True).data,
        })


# ─────────────────────────────────────────────
# Category ViewSet
# ─────────────────────────────────────────────
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnlyOperator]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


# ─────────────────────────────────────────────
# Warehouse ViewSet
# ─────────────────────────────────────────────
class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAdminOrReadOnlyOperator]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'created_at']


# ─────────────────────────────────────────────
# Operator ViewSet (Admin only)
# ─────────────────────────────────────────────
class OperatorViewSet(viewsets.GenericViewSet,
                      generics.mixins.ListModelMixin,
                      generics.mixins.CreateModelMixin,
                      generics.mixins.RetrieveModelMixin,
                      generics.mixins.UpdateModelMixin):
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'date_joined', 'status']
    filterset_fields = ['status']

    def get_queryset(self):
        return User.objects.filter(role='operator').order_by('-date_joined')

    def get_serializer_class(self):
        if self.action == 'create':
            return OperatorCreateSerializer
        if self.action in ('update', 'partial_update'):
            return OperatorUpdateSerializer
        return UserListSerializer


# ─────────────────────────────────────────────
# Product ViewSet
# ─────────────────────────────────────────────
class ProductViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'sku', 'category__name', 'barcode']
    ordering_fields = ['name', 'sku', 'unit_price', 'created_at', 'status']

    def get_queryset(self):
        return Product.objects.select_related('category').all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return ProductWriteSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return [IsAdminOrReadOnlyOperator()]

    def destroy(self, request, *args, **kwargs):
        """Soft delete — set status to inactive."""
        product = self.get_object()
        product.status = 'inactive'
        product.save()
        return Response(
            {'detail': f'Product "{product.name}" has been deactivated.'},
            status=status.HTTP_200_OK
        )


# ─────────────────────────────────────────────
# Inventory ViewSet
# ─────────────────────────────────────────────
class InventoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnlyOperator]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = InventoryFilter
    search_fields = ['product__name', 'product__sku', 'warehouse__name']
    ordering_fields = ['quantity_available', 'last_updated', 'product__name']
    serializer_class = InventorySerializer

    def get_queryset(self):
        return Inventory.objects.select_related(
            'product', 'product__category', 'warehouse'
        ).all()

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return [IsAdminOrReadOnlyOperator()]


# ─────────────────────────────────────────────
# Stock Movement ViewSet
# ─────────────────────────────────────────────
class StockMovementViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = StockMovementFilter
    search_fields = ['product__name', 'product__sku', 'assigned_operator__name', 'remarks']
    ordering_fields = ['created_at', 'status', 'movement_type']

    def get_queryset(self):
        user = self.request.user
        qs = StockMovement.objects.select_related(
            'product', 'warehouse', 'assigned_operator',
            'created_by', 'completed_by'
        )
        # Operators only see their own assigned movements
        if user.role == 'operator':
            qs = qs.filter(assigned_operator=user)
        return qs.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return StockMovementCreateSerializer
        if self.action in ('update', 'partial_update'):
            return StockMovementCompleteSerializer
        return StockMovementListSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdmin()]
        if self.action in ('update', 'partial_update'):
            # Both admin and assigned operator can update (object-level perm enforced)
            from rest_framework.permissions import IsAuthenticated
            return [IsAuthenticated(), IsAssignedOperator()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsAdminOrReadOnlyOperator()]

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj
