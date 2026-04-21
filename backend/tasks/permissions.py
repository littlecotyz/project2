from rest_framework import permissions


class IsTaskOwnerOrAssigned(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return (
            obj.created_by == request.user or
            request.user in obj.assigned_to.all() or
            request.user.is_staff
        )
