from setuptools import setup, find_packages
setup(
    name="super-pi-aria-sdk",
    version="1.0.0",
    description="ARIA AI risk scoring and compliance SDK for Super Pi ecosystem",
    author="KOSASIH",
    license="MIT",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=["requests>=2.28", "cryptography>=41.0"],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.9",
    ],
)
