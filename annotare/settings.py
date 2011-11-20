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

# Server Settings
SERVERS = {
    'dev': {
        'host': 'localhost',
        'port': 8000
    },
}

# Environment Setup
try:
    from settings_local import *
except ImportError:
    env = 'dev'

TARGET_HOST = SERVERS[env]['host']
PORT = SERVERS[env]['port']