import http.server
import socketserver
import socket

# Define the handler to use for incoming requests
handler = http.server.SimpleHTTPRequestHandler

# Set the port number for the server
port = int(input("Choose server port: "))

hostname = socket.gethostname()
ip_address = socket.gethostbyname(hostname)

# Create the server and bind it to the specified port
httpd = socketserver.TCPServer((ip_address, port), handler)

print(f"Server url: http://{ip_address}:{port}")

# Run the server indefinitely
httpd.serve_forever()
