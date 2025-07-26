#!/usr/bin/env python3

from vantage_backend import create_app

if __name__ == '__main__':
    app = create_app()
    print("Starting Vantage.ai backend on http://127.0.0.1:5002")
    app.run(debug=True, host='0.0.0.0', port=5002) 