#!/usr/bin/env python3
"""
Smart Dependency Installer for HireIQ Pro Backend
Handles Python version compatibility and dependency conflicts
"""

import sys
import subprocess
import platform
from pathlib import Path

def get_python_version():
    """Get Python version info"""
    return sys.version_info

def run_command(command, check=True):
    """Run a command and return the result"""
    print(f"Running: {command}")
    try:
        result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return e

def install_dependencies():
    """Install dependencies based on Python version"""
    python_version = get_python_version()
    print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    print(f"Platform: {platform.system()} {platform.machine()}")
    
    # Upgrade pip first
    print("Upgrading pip...")
    run_command(f"{sys.executable} -m pip install --upgrade pip")
    
    # Install wheel and setuptools
    print("Installing build tools...")
    run_command(f"{sys.executable} -m pip install wheel setuptools")
    
    # Choose requirements file based on Python version
    if python_version >= (3, 13):
        print("Using Python 3.13+ compatible requirements...")
        requirements_file = "requirements-py313.txt"
    else:
        print("Using standard requirements...")
        requirements_file = "requirements.txt"
    
    # Check if requirements file exists
    req_path = Path(requirements_file)
    if not req_path.exists():
        print(f"Requirements file {requirements_file} not found!")
        print("Available files:")
        for f in Path(".").glob("requirements*.txt"):
            print(f"  - {f}")
        return False
    
    print(f"Installing from {requirements_file}...")
    
    # Install core dependencies first
    core_deps = [
        "numpy>=1.24.0",
        "pandas>=2.0.0", 
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "pydantic>=2.5.0"
    ]
    
    print("Installing core dependencies...")
    for dep in core_deps:
        result = run_command(f"{sys.executable} -m pip install '{dep}'", check=False)
        if result.returncode != 0:
            print(f"Warning: Failed to install {dep}")
    
    # Install ML dependencies
    ml_deps = [
        "scikit-learn>=1.3.0",
        "scipy>=1.11.0",
        "transformers>=4.30.0",
        "torch>=2.0.0"
    ]
    
    print("Installing ML dependencies...")
    for dep in ml_deps:
        result = run_command(f"{sys.executable} -m pip install '{dep}'", check=False)
        if result.returncode != 0:
            print(f"Warning: Failed to install {dep}")
    
    # Install from requirements file (remaining dependencies)
    print(f"Installing remaining dependencies from {requirements_file}...")
    result = run_command(f"{sys.executable} -m pip install -r {requirements_file}", check=False)
    
    if result.returncode != 0:
        print("Some packages failed to install. Trying individual installation...")
        
        # Read requirements and install individually
        with open(requirements_file, 'r') as f:
            lines = f.readlines()
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):
                result = run_command(f"{sys.executable} -m pip install '{line}'", check=False)
                if result.returncode != 0:
                    print(f"Failed to install: {line}")
    
    # Install NLP models if spacy was installed successfully
    print("Downloading NLP models...")
    result = run_command(f"{sys.executable} -m spacy download en_core_web_sm", check=False)
    if result.returncode != 0:
        print("Warning: Failed to download spaCy English model")
    
    # Download NLTK data
    print("Downloading NLTK data...")
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        print("NLTK data downloaded successfully")
    except ImportError:
        print("NLTK not available, skipping data download")
    except Exception as e:
        print(f"Warning: Failed to download NLTK data: {e}")
    
    print("Installation complete!")
    return True

def verify_installation():
    """Verify that key packages are installed"""
    print("Verifying installation...")
    
    key_packages = [
        'fastapi',
        'uvicorn', 
        'pandas',
        'numpy',
        'sklearn',
        'transformers'
    ]
    
    failed_packages = []
    
    for package in key_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            failed_packages.append(package)
    
    if failed_packages:
        print(f"Failed to import: {', '.join(failed_packages)}")
        return False
    
    print("All key packages verified successfully!")
    return True

def main():
    """Main installation function"""
    print("🚀 HireIQ Pro Backend - Smart Dependency Installer")
    print("=" * 60)
    
    success = install_dependencies()
    
    if success:
        verify_installation()
        print("\n🎉 Installation completed!")
        print("\nNext steps:")
        print("1. Start the backend server: uvicorn app.main:app --reload")
        print("2. Test the text bias analyzer: python -c \"from app.models.text_bias_analyzer import analyze_text_bias; print('✅ Text bias analyzer ready')\"")
        print("3. Run tests: python test_advanced_bias_analysis.py")
    else:
        print("\n⚠️ Installation completed with some issues.")
        print("Some packages may not be available or compatible with your Python version.")
        print("The system will use fallback implementations where needed.")

if __name__ == "__main__":
    main()
