import http.server
import socketserver

# Define the handler to use for incoming requests
handler = http.server.SimpleHTTPRequestHandler

# Set the port number for the server
port = int(input("Choose server port: "))

# Create the server and bind it to the specified port
httpd = socketserver.TCPServer(("", port), handler)

print(f"Server url: http://localhost:{port}")

# Run the server indefinitely
httpd.serve_forever()
