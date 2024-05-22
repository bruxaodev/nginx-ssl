# nginx-ssl

This is a CLI tool to automate the creation of SSL certificates using Certbot and OpenSSL.

## Installation

...

## Usage

The CLI supports the following parameters:

- `--domain`: The domain for which you want to create an SSL certificate.
- `--port`: The port on which the web server is listening.
- `--path`: The path to the web server's root directory.
- `--email`: The email address to register the SSL certificate with.

Please note that you must provide either a port or a path.

## Example

This command will create an SSL certificate for the domain `example.com` on port `443` and register it with the email address `example@example.com`.

## Support

If you encounter any issues or have any suggestions, please open an issue on [GitHub](https://github.com/your-repo).

## Contribution

Contributions are welcome! Please read the [contribution guide](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more details.