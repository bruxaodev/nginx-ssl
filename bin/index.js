#! /usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import child_process from 'child_process'
import { writeFileSync, existsSync } from 'fs'
import chalk from 'chalk'
import boxen from 'boxen'


function nginxHttpConfig(domain) {
    return `
server {
    if ($host = ${domain}) {
        return 301 https://$host$request_uri;
    }


    listen 80 ;
    listen [::]:80 ;
    server_name ${domain};
    return 404;
}`
}

function nginxHttpsConfig({ domain, port, path }) {
    if (port) {
        return `
server {
    root /var/www/html;

    index index.html index.htm index.nginx-debian.html;
    server_name ${domain};
    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    listen 443 ssl http2 ;
    listen [::]:443 ssl http2 ;
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}`
    }

    return `
server {
    root ${path};

    index index.html index.htm index.nginx-debian.html;
    server_name ${domain};
    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying a 404.
        try_files $uri $uri/ =404;
}

    listen 443 ssl http2 ;
    listen [::]:443 ssl http2 ;
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}`
}

function newSSl({domain, email}) {
    const emailComand = email ? `--email ${email}` : ''
    child_process.execSync(`sudo certbot certonly --webroot --webroot-path /var/www/html -d ${domain} --non-interactive --agree-tos ${emailComand} -v`, { encoding: 'utf-8' })
}

function testNginx() {
    try{
        child_process.execSync('sudo nginx -t', { encoding: 'utf-8' })
        return true
    }
    catch(err) {
        console.log(chalk.red(err))
        return false
    }
}
function restartNginx() {
    child_process.execSync('sudo systemctl restart nginx.service', { encoding: 'utf-8' })
    console.log(chalk.yellow('nginx service restarted !!'))
}

function deleteSSL(domain) {
    if (existsSync(`/etc/letsencrypt/live/${domain}`)) {
        child_process.execSync(`sudo certbot delete --cert-name ${domain} --non-interactive`, { encoding: 'utf-8' })
        console.log(chalk.yellow('ssl deleted !!'))
    }
    child_process.execSync(`sudo rm /etc/nginx/conf.d/${domain}.conf`, { encoding: 'utf-8' })
}

async function createSSL({ domain, port, path, email }) {
    deleteSSL(domain)
    child_process.execSync(`sudo chmod 777 /etc/nginx/conf.d/`, { encoding: 'utf-8' })
    writeFileSync(`/etc/nginx/conf.d/${domain}.conf`, nginxHttpConfig(domain))  
    if(!testNginx())return
    console.log(chalk.yellow('http config created !!'))
    restartNginx();
    console.log(chalk.yellow('creating ssl started !!'))
    newSSl({domain,email})
    console.log(chalk.yellow('ssl created !!'))
    writeFileSync(`/etc/nginx/conf.d/${domain}.conf`, nginxHttpsConfig({ domain, port, path }), { flag: 'a' })
    if(!testNginx())return
    console.log(chalk.yellow('https config created !!'))
    restartNginx()
}

function help() {
    //use exemple 
    console.log(chalk.green('nginx-ssl -d exemple.com -p 3000 -e exemple@exemple.com'))
    console.log(chalk.green('nginx-ssl -d exemple.com -f /var/www/html/ -e exemple@exemple.com'))
    console.log(chalk.green('Usage:'))
    console.log(chalk.green('  -d domain || domain name'))
    console.log(chalk.green('  -p port   || use only if you want to proxy_pass'))
    console.log(chalk.green('  -f path   || use only if you want to serve static files'))
    console.log(chalk.green('  -e email  || only if you never created a ssl'))
    console.log(chalk.green('  -h help'))
}

async function Main() {
    try {
        const argv = yargs(hideBin(process.argv)).argv;
        const domain = argv?.d || false
        const port = argv?.p || false
        const path = argv?.f || false
        const email = argv?.e || false
        const _help = argv?.h || false

        if(_help) {
            help()
            return
        }
        if (!existsSync('/etc/nginx')) {
            console.log(chalk.red('Nginx is not installed'))
            help()
            return
        }
        if (!existsSync('/etc/letsencrypt')) {
            console.log(chalk.red('Certbot is not installed'))
            help()
            return
        }
        if (typeof domain !== 'string') {
            console.log(chalk.red('You must provide a domain'))
            help()
            return
        }
        if (port && path) {
            console.log(chalk.red('You can only use port or path'))
            help()
            return
        }
        if(!port && !path) {
            console.log(chalk.red('You must provide a port or a path'))
            help()
            return
        }
        
        console.log(chalk.green(boxen(chalk.white(`creating ssl for domain ${JSON.stringify({ domain, port, path, email }, null, 2)}`), { padding: 1 })))
        await createSSL({ domain, port, path, email })
    }
    catch (err) {
        console.log(chalk.red(err))
    }
}
Main()
