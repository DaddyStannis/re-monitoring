from django.urls import path
from . import views


urlpatterns = [
  path('', views.getIndex),
  path('img/icons.svg', views.getIcons),
  path('css/normalize.css', views.getNormalizer),
  path('css/styles.css', views.getStyles),
  path('js/modal.js', views.getJSModal),
  path('js/main.js', views.getJSMain),
  path('js/server-api.js', views.getJSServerApi),
  path('js/utils.js', views.getJSUtils),
  path('tasks/', views.getTasks),
]
