from django.contrib.auth import get_user_model
from rest_framework import serializers
from core.models import Team

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'bio')
        read_only_fields = ('id',)


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar')


class TeamSerializer(serializers.ModelSerializer):
    owner = UserMinimalSerializer(read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ('id', 'name', 'description', 'avatar', 'owner', 'members', 'member_count', 'created_at')
        read_only_fields = ('owner', 'members', 'created_at')

    def get_member_count(self, obj):
        return obj.members.count()


class TeamCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('name', 'description', 'avatar')


class TeamDetailSerializer(serializers.ModelSerializer):
    owner = UserMinimalSerializer(read_only=True)
    members = TeamMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ('id', 'name', 'description', 'avatar', 'owner', 'members', 'created_at')
        read_only_fields = ('owner', 'members', 'created_at')
