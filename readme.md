# nginx-ssl-cli

This is a CLI tool to automate the creation of SSL certificates using Certbot and OpenSSL. It also configures the proxy settings in Nginx.

## Requirements
To use this CLI tool, you need to have the following software installed on your system:
- Nginx: A web server that will be used to configure the proxy settings.
- Certbot: A tool for automatically obtaining and renewing SSL certificates.

Please make sure that Nginx and Certbot are properly installed and configured before using this tool.

```sh
    sudo apt install nginx certbot python3-certbot-nginx
```

## Installation

```sh
    npm install -g nginx-ssl-cli
```

## Usage

The CLI supports the following parameters:

- `--domain`: The domain for which you want to create an SSL certificate.
- `--port`: The port on which the web server is listening.
- `--path`: The path to the web server's root directory.
- `--email`: The email address to register the SSL certificate with.

Please note that you must provide either a port or a path.

## Example

This command will create an SSL certificate for the domain `example.com` on port `443` and register it with the email address `example@example.com`.

proxy
```sh
    nginx-ssl-cli -d exemple.com -p 3000 -e exemple@exemple.com
```
or static files
```sh
    nginx-ssl-cli -d exemple.com -f /var/www/html -e exemple@exemple.com
```

## Support

If you encounter any issues or have any suggestions, please open an issue on [GitHub](https://github.com/your-repo).

## Contribution

Contributions are welcome! Please read the [contribution guide](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more details.