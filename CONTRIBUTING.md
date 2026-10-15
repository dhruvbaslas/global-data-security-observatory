# Contributing to the Global Data Security Observatory

Thank you for your interest in contributing to the **Global Data Security Observatory**!

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors.

## How to Contribute

1. **Fork the Repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/Demo.git
   cd Demo
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r scraper/requirements.txt
   cd frontend && npm install && cd ..
   ```
4. **Create a Topic Branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```
5. **Run Tests Locally**:
   ```bash
   # Python backend & scraper tests
   python -m pytest scraper/tests/ -v

   # Frontend unit tests
   cd frontend && npm test -- --run

   # End-to-end browser button validation
   npm run test:e2e
   ```
6. **Submit a Pull Request** with a clear description of your changes.

## Coding Standards

- **Python**: PEP 8 compliance, type hints, docstrings, defensive sanitization.
- **JavaScript / React**: Modern functional components with hooks, zero external heavyweight UI dependencies (pure SVG charts), accessible semantic HTML.
- **Privacy First**: Maintain zero tracking, client-side data isolation, and strict Content Security Policy.
