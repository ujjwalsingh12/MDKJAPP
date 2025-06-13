#!/bin/bash

# Base directory
mkdir -p backend/app/{routes,services,utils}

# Files to create
touch backend/app/__init__.py
touch backend/app/routes/__init__.py
touch backend/app/routes/entries.py
touch backend/app/routes/customer.py
touch backend/app/routes/queries.py
touch backend/app/services/__init__.py
touch backend/app/services/journal.py
touch backend/app/services/queries.py
touch backend/app/utils/__init__.py
touch backend/app/utils/converters.py
touch backend/app/models.py
touch backend/config.py
touch backend/create.py
touch backend/wsgi.py
