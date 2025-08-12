#!/usr/bin/env python3
"""
Portfolio Management Web Portal Setup Script
This script initializes the database and starts the Flask application.
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"STEP: {description}")
    print(f"{'='*50}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("ERROR: Python 3.7 or higher is required")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_requirements():
    """Install required packages"""
    if not os.path.exists('requirements.txt'):
        print("ERROR: requirements.txt not found")
        return False
    
    return run_command(
        'pip install -r requirements.txt',
        'Installing required Python packages'
    )

def setup_database():
    """Initialize the database with data from Excel files"""
    # Change to backend directory
    os.chdir('backend')
    
    success = run_command(
        'python database_setup.py',
        'Setting up database and loading Excel data'
    )
    
    # Change back to root directory
    os.chdir('..')
    return success

def start_application():
    """Start the Flask application"""
    print(f"\n{'='*50}")
    print("STARTING APPLICATION")
    print(f"{'='*50}")
    print("🚀 Starting Portfolio Management Web Portal...")
    print("📊 Access your application at: http://localhost:5000")
    print("⏹️  Press Ctrl+C to stop the server")
    print(f"{'='*50}\n")
    
    # Change to backend directory
    os.chdir('backend')
    
    try:
        subprocess.run('python app.py', shell=True, check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Application stopped by user")
    except Exception as e:
        print(f"\nERROR starting application: {e}")
    finally:
        # Change back to root directory
        os.chdir('..')

def main():
    """Main setup function"""
    print("🎯 Portfolio Management Web Portal Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("❌ Failed to install requirements")
        sys.exit(1)
    
    # Setup database
    if not setup_database():
        print("❌ Failed to setup database")
        sys.exit(1)
    
    print("\n✅ Setup completed successfully!")
    
    # Ask user if they want to start the application
    response = input("\n🚀 Would you like to start the application now? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        start_application()
    else:
        print("\n📋 To start the application later, run:")
        print("   cd backend")
        print("   python app.py")
        print("\n📊 Then visit: http://localhost:5000")

if __name__ == "__main__":
    main() 