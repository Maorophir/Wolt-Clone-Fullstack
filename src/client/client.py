import socket
import sys

if len(sys.argv) != 3:
    sys.exit(1)

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
dest_ip = sys.argv[1]
dest_port = int(sys.argv[2])

try:
    s.connect((dest_ip, dest_port))

    while True:
        try:
            # Wait for user input from the console
            msg = input()
        except EOFError:
            break

        # Send to server with the mandatory newline
        s.sendall((msg + '\n').encode('utf-8'))

        # Wait for the server's response
        data = s.recv(4096)

        if not data:
            # Server disconnected
            break

        # Print the exact response without adding extra newlines
        print(data.decode('utf-8'), end='')

except Exception:
    pass
finally:
    s.close()