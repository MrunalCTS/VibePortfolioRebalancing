#!/usr/bin/env python3
"""
Portfolio Management Web Portal - Simple Launcher
Run this script from the project root directory to start the application.
"""

import os
import sys
import subprocess

def main():
    """Launch the Portfolio Management Web Portal"""
    print("🎯 Portfolio Management Web Portal")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('backend/app.py'):
        print("❌ Error: Please run this script from the project root directory")
        print("   Make sure you're in the PortfolioRebalProject folder")
        sys.exit(1)
    
    # Check if database exists
    if not os.path.exists('database/portfolio_management.db'):
        print("📊 Database not found. Creating database and loading data...")
        try:
            os.chdir('backend')
            subprocess.run([sys.executable, 'database_setup.py'], check=True)
            os.chdir('..')
            print("✅ Database created successfully!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error creating database: {e}")
            sys.exit(1)
    
    print("🚀 Starting Portfolio Management Web Portal...")
    print("📊 Access your application at: http://localhost:8000")
    print("⏹️  Press Ctrl+C to stop the server")
    print("=" * 50)
    print()
    
    # Change to backend directory and start Flask app
    try:
        os.chdir('backend')
        subprocess.run([sys.executable, 'app.py'])
    except KeyboardInterrupt:
        print("\n\n🛑 Application stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting application: {e}")
    finally:
        # Change back to root directory
        os.chdir('..')

if __name__ == "__main__":
    main() 