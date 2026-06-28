from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only administrators can access."""
    message = 'Administrator access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
            and request.user.status == 'active'
        )


class IsOperator(BasePermission):
    """Only warehouse operators can access."""
    message = 'Warehouse Operator access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'operator'
            and request.user.status == 'active'
        )


class IsAdminOrReadOnlyOperator(BasePermission):
    """
    Admins: full access.
    Operators: GET only.
    """
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.status != 'active':
            return False
        if request.user.role == 'admin':
            return True
        if request.user.role == 'operator' and request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return False


class IsAssignedOperator(BasePermission):
    """
    The movement can only be completed by the operator it was assigned to.
    Admins can always read/update.
    """
    message = 'You can only complete movements assigned to you.'

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'admin':
            return True
        if user.role == 'operator':
            if request.method in ('GET', 'HEAD', 'OPTIONS'):
                return obj.assigned_operator == user
            # For PATCH/PUT: only the assigned operator can complete
            return obj.assigned_operator == user
        return False
