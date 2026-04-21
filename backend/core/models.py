from django.db import models
from django.conf import settings

class Team(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='team_avatars/%Y/%m/', blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='owned_teams', on_delete=models.CASCADE)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='team_memberships', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    PRIORITY_CHOICES = ((1,'Low'),(2,'Medium'),(3,'High'))
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_tasks', on_delete=models.CASCADE)
    assignees = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='assigned_tasks', blank=True)
    team = models.ForeignKey(Team, related_name='tasks', null=True, blank=True, on_delete=models.SET_NULL)
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
    due_date = models.DateTimeField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    task = models.ForeignKey(Task, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='comments', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author} on {self.task}"


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    provider = models.CharField(max_length=50, blank=True, null=True)
    provider_id = models.CharField(max_length=200, blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Profile for {self.user}" 


from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('task_assigned', 'Task Assigned'),
        ('comment_added', 'Comment Added'),
        ('deadline_approaching', 'Deadline Approaching'),
        ('task_updated', 'Task Updated'),
        ('member_added', 'Member Added'),
    )
    
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='notifications', on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='task_assigned')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    task = models.ForeignKey(Task, related_name='notifications', null=True, blank=True, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Notification for {self.recipient}: {self.message}"
