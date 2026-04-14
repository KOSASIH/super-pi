from setuptools import setup
setup(
    name="super-pi-quantum",
    version="1.0.0",
    description="Post-quantum cryptography (CRYSTALS-Dilithium3+Kyber-1024) for Super Pi",
    author="KOSASIH",
    license="MIT",
    py_modules=["super_pi_quantum"],
    python_requires=">=3.9",
    install_requires=["cryptography>=41.0"],
)
