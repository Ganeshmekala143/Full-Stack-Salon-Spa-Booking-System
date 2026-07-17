import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from Backend.db import db
from bson import ObjectId

# Helper to format PyMongo documents for JSON serialization
def format_doc(doc):
    if doc is None:
        return None
    # Convert ObjectId to string
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

def format_list(cursor):
    return [format_doc(doc) for doc in cursor]

# Helper to parse request JSON body safely
def get_json_body(request):
    try:
        return json.loads(request.body)
    except Exception:
        return {}

# Helper to auto-increment custom numeric IDs
def get_next_id(collection_name, id_field, start_val):
    if db is None:
        return start_val
    col = db[collection_name]
    max_doc = col.find_one(sort=[(id_field, -1)])
    if max_doc and id_field in max_doc:
        try:
            return int(max_doc[id_field]) + 1
        except Exception:
            pass
    return start_val

# Helper to query by the custom ID (or fall back to ObjectId if query fails/matches standard)
def get_query_filter(id_str, id_field):
    # Try parsing as integer first
    try:
        return {id_field: int(id_str)}
    except ValueError:
        pass
    
    # Try parsing as ObjectId
    try:
        return {'_id': ObjectId(id_str)}
    except Exception:
        pass
        
    # Return query filter matching string representation of the ID
    return {id_field: id_str}


# =====================================================================
# CUSTOMER MANAGEMENT MODULE APIs
# =====================================================================

@csrf_exempt
def customers_list_or_add(request):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
    
    if request.method == 'GET':
        customers = db.customers.find()
        return JsonResponse(format_list(customers), safe=False)
        
    elif request.method == 'POST':
        data = get_json_body(request)
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        gender = data.get('gender')
        password = data.get('password')
        
        if not full_name or not email or not password:
            return JsonResponse({"error": "Full name, email, and password are required"}, status=400)
            
        # Check duplicate email
        if db.customers.find_one({"email": email}):
            return JsonResponse({"error": "Customer with this email already exists"}, status=400)
            
        # Check custom customer_id in request, or auto-generate
        customer_id = data.get('customer_id')
        if customer_id is None:
            customer_id = get_next_id('customers', 'customer_id', 101)
        else:
            customer_id = int(customer_id)
            
        customer_doc = {
            "customer_id": customer_id,
            "full_name": full_name,
            "email": email,
            "phone": phone or "",
            "gender": gender or "",
            "password": password
        }
        
        db.customers.insert_one(customer_doc)
        return JsonResponse(format_doc(customer_doc), status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def customer_detail_update_delete(request, id):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    query_filter = get_query_filter(id, 'customer_id')
    
    if request.method == 'GET':
        customer = db.customers.find_one(query_filter)
        if not customer:
            return JsonResponse({"error": "Customer not found"}, status=404)
        return JsonResponse(format_doc(customer))
        
    elif request.method == 'PUT':
        data = get_json_body(request)
        update_fields = {}
        for field in ['full_name', 'email', 'phone', 'gender', 'password']:
            if field in data:
                update_fields[field] = data[field]
                
        if not update_fields:
            return JsonResponse({"error": "No update fields provided"}, status=400)
            
        result = db.customers.update_one(query_filter, {"$set": update_fields})
        if result.matched_count == 0:
            return JsonResponse({"error": "Customer not found"}, status=404)
            
        updated_customer = db.customers.find_one(query_filter)
        return JsonResponse(format_doc(updated_customer))
        
    elif request.method == 'DELETE':
        result = db.customers.delete_one(query_filter)
        if result.deleted_count == 0:
            return JsonResponse({"error": "Customer not found"}, status=404)
        return JsonResponse({"message": "Customer deleted successfully", "id": id})
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def customer_login(request):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    if request.method == 'POST':
        data = get_json_body(request)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({"error": "Email and password are required"}, status=400)
            
        customer = db.customers.find_one({"email": email, "password": password})
        if not customer:
            return JsonResponse({"error": "Invalid email or password"}, status=401)
            
        # Do not send password in response
        cust_formatted = format_doc(customer)
        cust_formatted.pop('password', None)
        return JsonResponse(cust_formatted)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


# =====================================================================
# SERVICE MANAGEMENT MODULE APIs
# =====================================================================

@csrf_exempt
def services_list_or_add(request):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    if request.method == 'GET':
        services = db.services.find()
        return JsonResponse(format_list(services), safe=False)
        
    elif request.method == 'POST':
        data = get_json_body(request)
        service_name = data.get('service_name')
        category = data.get('category')
        duration = data.get('duration')
        price = data.get('price')
        description = data.get('description')
        
        if not service_name or not category or duration is None or price is None:
            return JsonResponse({"error": "Service name, category, duration, and price are required"}, status=400)
            
        service_id = data.get('service_id')
        if service_id is None:
            service_id = get_next_id('services', 'service_id', 201)
        else:
            service_id = int(service_id)
            
        service_doc = {
            "service_id": service_id,
            "service_name": service_name,
            "category": category,
            "duration": int(duration),
            "price": float(price),
            "description": description or ""
        }
        
        db.services.insert_one(service_doc)
        return JsonResponse(format_doc(service_doc), status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def service_detail_update_delete(request, id):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    query_filter = get_query_filter(id, 'service_id')
    
    if request.method == 'GET':
        service = db.services.find_one(query_filter)
        if not service:
            return JsonResponse({"error": "Service not found"}, status=404)
        return JsonResponse(format_doc(service))
        
    elif request.method == 'PUT':
        data = get_json_body(request)
        update_fields = {}
        for field in ['service_name', 'category', 'duration', 'price', 'description']:
            if field in data:
                if field == 'duration':
                    update_fields[field] = int(data[field])
                elif field == 'price':
                    update_fields[field] = float(data[field])
                else:
                    update_fields[field] = data[field]
                    
        if not update_fields:
            return JsonResponse({"error": "No update fields provided"}, status=400)
            
        result = db.services.update_one(query_filter, {"$set": update_fields})
        if result.matched_count == 0:
            return JsonResponse({"error": "Service not found"}, status=404)
            
        updated_service = db.services.find_one(query_filter)
        return JsonResponse(format_doc(updated_service))
        
    elif request.method == 'DELETE':
        result = db.services.delete_one(query_filter)
        if result.deleted_count == 0:
            return JsonResponse({"error": "Service not found"}, status=404)
        return JsonResponse({"message": "Service deleted successfully", "id": id})
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


# =====================================================================
# STYLIST MANAGEMENT MODULE APIs
# =====================================================================

@csrf_exempt
def stylists_list_or_add(request):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    if request.method == 'GET':
        stylists = db.stylists.find()
        return JsonResponse(format_list(stylists), safe=False)
        
    elif request.method == 'POST':
        data = get_json_body(request)
        stylist_name = data.get('stylist_name')
        specialization = data.get('specialization')
        experience = data.get('experience')
        phone = data.get('phone')
        availability = data.get('availability')
        
        if not stylist_name or experience is None or not availability:
            return JsonResponse({"error": "Stylist name, experience, and availability are required"}, status=400)
            
        stylist_id = data.get('stylist_id')
        if stylist_id is None:
            stylist_id = get_next_id('stylists', 'stylist_id', 301)
        else:
            stylist_id = int(stylist_id)
            
        stylist_doc = {
            "stylist_id": stylist_id,
            "stylist_name": stylist_name,
            "specialization": specialization or "",
            "experience": int(experience),
            "phone": phone or "",
            "availability": availability
        }
        
        db.stylists.insert_one(stylist_doc)
        return JsonResponse(format_doc(stylist_doc), status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def stylist_detail_update_delete(request, id):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    query_filter = get_query_filter(id, 'stylist_id')
    
    if request.method == 'GET':
        stylist = db.stylists.find_one(query_filter)
        if not stylist:
            return JsonResponse({"error": "Stylist not found"}, status=404)
        return JsonResponse(format_doc(stylist))
        
    elif request.method == 'PUT':
        data = get_json_body(request)
        update_fields = {}
        for field in ['stylist_name', 'specialization', 'experience', 'phone', 'availability']:
            if field in data:
                if field == 'experience':
                    update_fields[field] = int(data[field])
                else:
                    update_fields[field] = data[field]
                    
        if not update_fields:
            return JsonResponse({"error": "No update fields provided"}, status=400)
            
        result = db.stylists.update_one(query_filter, {"$set": update_fields})
        if result.matched_count == 0:
            return JsonResponse({"error": "Stylist not found"}, status=404)
            
        updated_stylist = db.stylists.find_one(query_filter)
        return JsonResponse(format_doc(updated_stylist))
        
    elif request.method == 'DELETE':
        result = db.stylists.delete_one(query_filter)
        if result.deleted_count == 0:
            return JsonResponse({"error": "Stylist not found"}, status=404)
        return JsonResponse({"message": "Stylist deleted successfully", "id": id})
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


# =====================================================================
# APPOINTMENT MANAGEMENT MODULE APIs
# =====================================================================

@csrf_exempt
def appointments_list_or_add(request):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    if request.method == 'GET':
        appointments = db.appointments.find()
        return JsonResponse(format_list(appointments), safe=False)
        
    elif request.method == 'POST':
        data = get_json_body(request)
        customer_name = data.get('customer_name')
        stylist_name = data.get('stylist_name')
        service_name = data.get('service_name')
        appointment_date = data.get('appointment_date')
        appointment_time = data.get('appointment_time')
        total_amount = data.get('total_amount')
        appointment_status = data.get('appointment_status')
        
        if not customer_name or not stylist_name or not service_name or not appointment_date or not appointment_time or total_amount is None or not appointment_status:
            return JsonResponse({"error": "All fields customer_name, stylist_name, service_name, appointment_date, appointment_time, total_amount, appointment_status are required"}, status=400)
            
        appointment_id = data.get('appointment_id')
        if appointment_id is None:
            appointment_id = get_next_id('appointments', 'appointment_id', 401)
        else:
            appointment_id = int(appointment_id)
            
        appointment_doc = {
            "appointment_id": appointment_id,
            "customer_name": customer_name,
            "stylist_name": stylist_name,
            "service_name": service_name,
            "appointment_date": appointment_date,
            "appointment_time": appointment_time,
            "total_amount": float(total_amount),
            "appointment_status": appointment_status
        }
        
        db.appointments.insert_one(appointment_doc)
        return JsonResponse(format_doc(appointment_doc), status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def appointment_detail_update_delete(request, id):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    query_filter = get_query_filter(id, 'appointment_id')
    
    if request.method == 'GET':
        appointment = db.appointments.find_one(query_filter)
        if not appointment:
            return JsonResponse({"error": "Appointment not found"}, status=404)
        return JsonResponse(format_doc(appointment))
        
    elif request.method == 'PUT':
        data = get_json_body(request)
        update_fields = {}
        for field in ['customer_name', 'stylist_name', 'service_name', 'appointment_date', 'appointment_time', 'total_amount', 'appointment_status']:
            if field in data:
                if field == 'total_amount':
                    update_fields[field] = float(data[field])
                else:
                    update_fields[field] = data[field]
                    
        if not update_fields:
            return JsonResponse({"error": "No update fields provided"}, status=400)
            
        result = db.appointments.update_one(query_filter, {"$set": update_fields})
        if result.matched_count == 0:
            return JsonResponse({"error": "Appointment not found"}, status=404)
            
        updated_appointment = db.appointments.find_one(query_filter)
        return JsonResponse(format_doc(updated_appointment))
        
    elif request.method == 'DELETE':
        result = db.appointments.delete_one(query_filter)
        if result.deleted_count == 0:
            return JsonResponse({"error": "Appointment not found"}, status=404)
        return JsonResponse({"message": "Appointment deleted successfully", "id": id})
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


# =====================================================================
# PAYMENT MANAGEMENT MODULE APIs
# =====================================================================

@csrf_exempt
def payments_list_or_add(request):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    if request.method == 'GET':
        payments = db.payments.find()
        return JsonResponse(format_list(payments), safe=False)
        
    elif request.method == 'POST':
        data = get_json_body(request)
        customer_name = data.get('customer_name')
        appointment_id = data.get('appointment_id')
        amount = data.get('amount')
        payment_method = data.get('payment_method')
        payment_status = data.get('payment_status')
        payment_date = data.get('payment_date')
        
        if not customer_name or appointment_id is None or amount is None or not payment_method or not payment_status or not payment_date:
            return JsonResponse({"error": "All fields customer_name, appointment_id, amount, payment_method, payment_status, payment_date are required"}, status=400)
            
        payment_id = data.get('payment_id')
        if payment_id is None:
            payment_id = get_next_id('payments', 'payment_id', 501)
        else:
            payment_id = int(payment_id)
            
        payment_doc = {
            "payment_id": payment_id,
            "customer_name": customer_name,
            "appointment_id": int(appointment_id),
            "amount": float(amount),
            "payment_method": payment_method,
            "payment_status": payment_status,
            "payment_date": payment_date
        }
        
        db.payments.insert_one(payment_doc)
        return JsonResponse(format_doc(payment_doc), status=201)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def payment_detail_update_delete(request, id):
    if db is None:
        return JsonResponse({"error": "Database not connected"}, status=500)
        
    query_filter = get_query_filter(id, 'payment_id')
    
    if request.method == 'GET':
        payment = db.payments.find_one(query_filter)
        if not payment:
            return JsonResponse({"error": "Payment not found"}, status=404)
        return JsonResponse(format_doc(payment))
        
    elif request.method == 'PUT':
        data = get_json_body(request)
        update_fields = {}
        for field in ['customer_name', 'appointment_id', 'amount', 'payment_method', 'payment_status', 'payment_date']:
            if field in data:
                if field == 'appointment_id':
                    update_fields[field] = int(data[field])
                elif field == 'amount':
                    update_fields[field] = float(data[field])
                else:
                    update_fields[field] = data[field]
                    
        if not update_fields:
            return JsonResponse({"error": "No update fields provided"}, status=400)
            
        result = db.payments.update_one(query_filter, {"$set": update_fields})
        if result.matched_count == 0:
            return JsonResponse({"error": "Payment not found"}, status=404)
            
        updated_payment = db.payments.find_one(query_filter)
        return JsonResponse(format_doc(updated_payment))
        
    elif request.method == 'DELETE':
        result = db.payments.delete_one(query_filter)
        if result.deleted_count == 0:
            return JsonResponse({"error": "Payment not found"}, status=404)
        return JsonResponse({"message": "Payment deleted successfully", "id": id})
        
    return JsonResponse({"error": "Method not allowed"}, status=405)
