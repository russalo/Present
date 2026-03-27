from django.urls import path
from . import views

urlpatterns = [
    path("healthz", views.healthz),
    path("session", views.session),        # GET → session log, POST → blocking turn
    path("session/new", views.new_session),
    path("stream", views.dm_stream),
    path("world", views.get_world),
    path("characters", views.get_characters),
    path("locations", views.get_locations),
    path("factions", views.get_factions),
    path("items", views.get_items),
]
