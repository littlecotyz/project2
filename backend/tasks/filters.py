from django_filters import FilterSet, CharFilter, DateTimeFromToRangeFilter, ChoiceFilter
from .models import Task


class TaskFilter(FilterSet):
    status = CharFilter(field_name='status', method='filter_status')
    priority = CharFilter(field_name='priority', method='filter_priority')
    assigned_to = CharFilter(field_name='assigned_to__id', method='filter_assigned_to')
    team = CharFilter(field_name='team__id')
    deadline = DateTimeFromToRangeFilter(field_name='deadline')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'team']

    def filter_status(self, queryset, name, value):
        if value:
            return queryset.filter(status=value)
        return queryset

    def filter_priority(self, queryset, name, value):
        if value:
            return queryset.filter(priority=value)
        return queryset

    def filter_assigned_to(self, queryset, name, value):
        if value:
            return queryset.filter(assigned_to__id=value)
        return queryset
