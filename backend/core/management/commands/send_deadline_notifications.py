from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from datetime import timedelta
from core.models import Task, Notification


class Command(BaseCommand):
    help = 'Send email notifications for tasks with upcoming deadlines'

    def add_arguments(self, parser):
        parser.add_argument('--hours', type=int, default=24, help='Lookahead hours for upcoming deadlines')

    def handle(self, *args, **options):
        hours = options['hours']
        now = timezone.now()
        until = now + timedelta(hours=hours)
        tasks = Task.objects.filter(due_date__gte=now, due_date__lte=until, completed=False)
        for task in tasks:
            for user in task.assignees.all():
                title = f'Task due soon: {task.title}'
                body = f'The task "{task.title}" is due at {task.due_date}.'
                Notification.objects.create(user=user, title=title, body=body, url=f'/tasks/{task.id}/')
                if settings.EMAIL_HOST:
                    try:
                        send_mail(title, body, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
                    except Exception:
                        pass
        self.stdout.write(self.style.SUCCESS('Deadline notifications processed.'))
