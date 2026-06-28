import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wms_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Category, Warehouse, Product, Inventory, StockMovement

User = get_user_model()

print("Seeding users...")
admin = User.objects.create_user(
    email='admin@wms.com', name='Alice Admin',
    password='Admin@1234', role='admin'
)
admin.is_staff = True
admin.save()

op1 = User.objects.create_user(
    email='bob@wms.com', name='Bob Operator',
    password='Operator@1234', role='operator'
)
op2 = User.objects.create_user(
    email='carol@wms.com', name='Carol Operator',
    password='Operator@1234', role='operator'
)

print("Seeding categories...")
cat_electronics = Category.objects.create(name='Electronics', description='Electronic components and devices')
cat_tools       = Category.objects.create(name='Tools', description='Hand and power tools')
cat_packaging   = Category.objects.create(name='Packaging', description='Boxes, tapes, and wrapping materials')
cat_safety      = Category.objects.create(name='Safety', description='PPE and safety equipment')

print("Seeding warehouses...")
wh_main = Warehouse.objects.create(name='Main Warehouse', address='123 Industrial Road, Zone A')
wh_north = Warehouse.objects.create(name='North Wing', address='123 Industrial Road, Zone B')
wh_cold = Warehouse.objects.create(name='Cold Storage', address='45 Freeze Blvd, Zone C')

print("Seeding products...")
p1 = Product.objects.create(
    name='USB-C Hub 7-Port', sku='ELEC-001', category=cat_electronics,
    unit_price=24.99, minimum_stock_level=10, barcode='123456789012'
)
p2 = Product.objects.create(
    name='Power Drill 18V', sku='TOOL-001', category=cat_tools,
    unit_price=89.99, minimum_stock_level=5, barcode='234567890123'
)
p3 = Product.objects.create(
    name='Bubble Wrap Roll 50m', sku='PACK-001', category=cat_packaging,
    unit_price=12.50, minimum_stock_level=20, barcode='345678901234'
)
p4 = Product.objects.create(
    name='Safety Helmet Type II', sku='SAFE-001', category=cat_safety,
    unit_price=18.00, minimum_stock_level=15, barcode='456789012345'
)
p5 = Product.objects.create(
    name='HDMI Cable 2m', sku='ELEC-002', category=cat_electronics,
    unit_price=9.99, minimum_stock_level=25, barcode='567890123456'
)
p6 = Product.objects.create(
    name='Wireless Mouse', sku='ELEC-003', category=cat_electronics,
    unit_price=34.99, minimum_stock_level=8, barcode='678901234567'
)

print("Seeding inventory...")
Inventory.objects.create(product=p1, warehouse=wh_main,  quantity_available=45, quantity_reserved=0)
Inventory.objects.create(product=p1, warehouse=wh_north, quantity_available=8,  quantity_reserved=0)  # LOW
Inventory.objects.create(product=p2, warehouse=wh_main,  quantity_available=3,  quantity_reserved=0)  # LOW
Inventory.objects.create(product=p3, warehouse=wh_main,  quantity_available=60, quantity_reserved=5)
Inventory.objects.create(product=p4, warehouse=wh_north, quantity_available=12, quantity_reserved=0)  # LOW-ish
Inventory.objects.create(product=p5, warehouse=wh_main,  quantity_available=4,  quantity_reserved=0)  # LOW
Inventory.objects.create(product=p6, warehouse=wh_main,  quantity_available=22, quantity_reserved=0)

print("Seeding stock movements...")
m1 = StockMovement.objects.create(
    product=p2, warehouse=wh_main, movement_type='stock_in',
    quantity=20, assigned_operator=op1, created_by=admin,
    remarks='Restock from supplier', status='pending'
)
m2 = StockMovement.objects.create(
    product=p5, warehouse=wh_main, movement_type='stock_in',
    quantity=50, assigned_operator=op2, created_by=admin,
    remarks='Quarterly restock', status='pending'
)
m3 = StockMovement.objects.create(
    product=p3, warehouse=wh_main, movement_type='stock_out',
    quantity=10, assigned_operator=op1, created_by=admin,
    remarks='Dispatched to floor B', status='pending'
)

print("\n✅ Seed complete!")
print("─" * 40)
print("Admin login:    admin@wms.com    / Admin@1234")
print("Operator login: bob@wms.com      / Operator@1234")
print("Operator login: carol@wms.com    / Operator@1234")
