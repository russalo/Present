"""
Django models for Project Sentinel.

All models use managed=False — the tables already exist in PostgreSQL,
created by infrastructure/migrations/. Django reads them; Drizzle owns migrations.
"""

from django.db import models


class Session(models.Model):
    id = models.UUIDField(primary_key=True)
    world_name = models.TextField()
    started_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    world_seed = models.TextField(null=True, blank=True)
    turn_count = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = "sessions"


class WorldState(models.Model):
    id = models.AutoField(primary_key=True)
    session = models.ForeignKey(
        Session, on_delete=models.SET_NULL, null=True, blank=True, db_column="session_id"
    )
    world_name = models.TextField(default="Unknown Realm")
    current_era = models.TextField(default="The Beginning")
    current_location = models.TextField(default="Nowhere")
    weather = models.TextField(default="Calm")
    time_of_day = models.TextField(default="Dawn")
    tension = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "world_state"


class Turn(models.Model):
    id = models.AutoField(primary_key=True)
    session = models.ForeignKey(Session, on_delete=models.CASCADE, db_column="session_id")
    turn_number = models.IntegerField()
    player_action = models.TextField()
    narrative = models.TextField()
    world_updates = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = "turns"
        ordering = ["turn_number"]


class Character(models.Model):
    id = models.AutoField(primary_key=True)
    unique_id = models.UUIDField()
    namespace = models.TextField(default="core")
    name = models.TextField()
    role = models.TextField(default="npc")
    class_name = models.TextField(null=True, blank=True, db_column="class")
    race = models.TextField(null=True, blank=True)
    level = models.IntegerField(default=1)
    health = models.IntegerField(default=100)
    max_health = models.IntegerField(default=100, db_column="max_health")
    current_location = models.TextField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    traits = models.JSONField(default=list)
    status = models.TextField(default="alive")
    canon = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "characters"


class Location(models.Model):
    id = models.AutoField(primary_key=True)
    unique_id = models.UUIDField()
    namespace = models.TextField(default="core")
    name = models.TextField()
    type = models.TextField(default="area")
    description = models.TextField()
    region = models.TextField(null=True, blank=True)
    discovered = models.BooleanField(default=False)
    danger = models.IntegerField(default=0)
    notable_features = models.JSONField(default=list)
    canon = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "locations"


class Faction(models.Model):
    id = models.AutoField(primary_key=True)
    unique_id = models.UUIDField()
    namespace = models.TextField(default="core")
    name = models.TextField()
    description = models.TextField()
    alignment = models.TextField(null=True, blank=True)
    power = models.IntegerField(default=5)
    player_relation = models.IntegerField(default=0)
    goals = models.JSONField(default=list)
    canon = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "factions"


class Item(models.Model):
    id = models.AutoField(primary_key=True)
    unique_id = models.UUIDField()
    namespace = models.TextField(default="core")
    name = models.TextField()
    type = models.TextField(default="misc")
    description = models.TextField()
    rarity = models.TextField(default="common")
    owned_by = models.TextField(null=True, blank=True)
    location = models.TextField(null=True, blank=True)
    magical = models.BooleanField(default=False)
    canon = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = "items"
