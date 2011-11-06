"""
Annotare Settings
"""

import os

DEBUG = True

# Discover Abs Project Path
PROJECT_ROOT = os.sep.join(os.path.abspath(__file__).split(os.sep)[:-1])

ASSETS_ROOT = os.path.join(PROJECT_ROOT, 'assets')

TEMPLATES_ROOT = os.path.join(PROJECT_ROOT, 'templates')

DOCUMENT_ROOT = os.path.join(PROJECT_ROOT, 'documents')