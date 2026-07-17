"""
URL configuration for Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from Backend import views

urlpatterns = [
    # Customer APIs
    path('customers/', views.customers_list_or_add, name='customers_list_or_add'),
    path('customers/add/', views.customers_list_or_add, name='customers_add'),
    path('customers/update/<str:id>/', views.customer_detail_update_delete, name='customer_update'),
    path('customers/delete/<str:id>/', views.customer_detail_update_delete, name='customer_delete'),
    path('customers/login/', views.customer_login, name='customer_login'),

    # Service APIs
    path('services/', views.services_list_or_add, name='services_list_or_add'),
    path('services/add/', views.services_list_or_add, name='services_add'),
    path('services/update/<str:id>/', views.service_detail_update_delete, name='service_update'),
    path('services/delete/<str:id>/', views.service_detail_update_delete, name='service_delete'),

    # Stylist APIs
    path('stylists/', views.stylists_list_or_add, name='stylists_list_or_add'),
    path('stylists/add/', views.stylists_list_or_add, name='stylists_add'),
    path('stylists/update/<str:id>/', views.stylist_detail_update_delete, name='stylist_update'),
    path('stylists/delete/<str:id>/', views.stylist_detail_update_delete, name='stylist_delete'),

    # Appointment APIs
    path('appointments/', views.appointments_list_or_add, name='appointments_list_or_add'),
    path('appointments/add/', views.appointments_list_or_add, name='appointments_add'),
    path('appointments/update/<str:id>/', views.appointment_detail_update_delete, name='appointment_update'),
    path('appointments/delete/<str:id>/', views.appointment_detail_update_delete, name='appointment_delete'),

    # Payment APIs
    path('payments/', views.payments_list_or_add, name='payments_list_or_add'),
    path('payments/add/', views.payments_list_or_add, name='payments_add'),
    path('payments/update/<str:id>/', views.payment_detail_update_delete, name='payment_update'),
    path('payments/delete/<str:id>/', views.payment_detail_update_delete, name='payment_delete'),
]

