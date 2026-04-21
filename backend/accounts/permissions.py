from rest_framework import permissions


class IsTeamOwner(permissions.BasePermission):
    """Only team owner can modify/delete the team."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsTeamOwnerOrReadOnly(permissions.BasePermission):
    """Team owner can do anything, others can only read."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user
