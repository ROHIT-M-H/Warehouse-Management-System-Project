import django_filters
from .models import Product, Inventory, StockMovement


class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    sku = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.NumberFilter(field_name='category__id')
    category_name = django_filters.CharFilter(field_name='category__name', lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=Product.STATUS_CHOICES)
    min_price = django_filters.NumberFilter(field_name='unit_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='unit_price', lookup_expr='lte')
    barcode = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['name', 'sku', 'category', 'status', 'barcode']


class InventoryFilter(django_filters.FilterSet):
    product_name = django_filters.CharFilter(field_name='product__name', lookup_expr='icontains')
    product_sku = django_filters.CharFilter(field_name='product__sku', lookup_expr='icontains')
    category = django_filters.NumberFilter(field_name='product__category__id')
    category_name = django_filters.CharFilter(
        field_name='product__category__name', lookup_expr='icontains'
    )
    warehouse = django_filters.NumberFilter(field_name='warehouse__id')
    warehouse_name = django_filters.CharFilter(
        field_name='warehouse__name', lookup_expr='icontains'
    )
    product_status = django_filters.ChoiceFilter(
        field_name='product__status', choices=Product.STATUS_CHOICES
    )
    low_stock = django_filters.BooleanFilter(method='filter_low_stock')
    min_quantity = django_filters.NumberFilter(
        field_name='quantity_available', lookup_expr='gte'
    )
    max_quantity = django_filters.NumberFilter(
        field_name='quantity_available', lookup_expr='lte'
    )

    def filter_low_stock(self, queryset, name, value):
        from django.db.models import F
        if value:
            return queryset.filter(quantity_available__lte=F('product__minimum_stock_level'))
        return queryset.exclude(quantity_available__lte=F('product__minimum_stock_level'))

    class Meta:
        model = Inventory
        fields = []


class StockMovementFilter(django_filters.FilterSet):
    product_name = django_filters.CharFilter(field_name='product__name', lookup_expr='icontains')
    product_sku = django_filters.CharFilter(field_name='product__sku', lookup_expr='icontains')
    warehouse = django_filters.NumberFilter(field_name='warehouse__id')
    movement_type = django_filters.ChoiceFilter(choices=StockMovement.MOVEMENT_TYPE_CHOICES)
    status = django_filters.ChoiceFilter(choices=StockMovement.STATUS_CHOICES)
    assigned_operator = django_filters.NumberFilter(field_name='assigned_operator__id')
    operator_name = django_filters.CharFilter(
        field_name='assigned_operator__name', lookup_expr='icontains'
    )
    date_from = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    date_to = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = StockMovement
        fields = []
