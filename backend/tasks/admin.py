from django.contrib import admin
from .models import Task, TaskComment, TaskAttachment


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'priority', 'created_by', 'deadline')
    list_filter = ('status', 'priority', 'team', 'created_at')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('task__title', 'content')
    readonly_fields = ('created_at',)


@admin.register(TaskAttachment)
class TaskAttachmentAdmin(admin.ModelAdmin):
    list_display = ('task', 'uploaded_by', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('task__title',)
    readonly_fields = ('uploaded_at',)
