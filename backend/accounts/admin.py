from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from core.models import Team

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Profile', {'fields': ('avatar', 'bio')}),
    )


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'member_count', 'created_at')
    list_filter = ('created_at', 'owner')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)
    filter_horizontal = ('members',)

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'
