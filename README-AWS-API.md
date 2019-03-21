# Configuração e operação da AWS para API Holismo

## Informações da AWS

- DNS público: **ec2-18-231-115-112.sa-east-1.compute.amazonaws.com**
- Usuário: ubuntu
- Arquivo de permissão: **Holismo.pem**

Exemplo acesso SSH:

ssh -i "Holismo.pem" ubuntu@ec2-18-231-115-112.sa-east-1.compute.amazonaws.com

## Métodos de acesso
São 2 métodos, um para acesso ao servidor que possibilita rodar serviços e outro por FTP para subir e descer arquivos de maneira mais fácil.

- [PuTTY](https://www.putty.org/) - Acesso ao servidor e serviços
- [WinSCP](https://winscp.net/eng/index.php) - FTP para gerenciamento de arquivos

# PuTTY
Para realizar conexões com o servidor em SSH você precisa primeiro converter o arquivo de permissão fornecido **Holismo.pem** em **Holismo.ppk**.

Configurando o arquivo de permissão para o PuTTY.

1. Primeiro baixe o conversor no website do putty, é o programa *puttygen.exe*
[puttygen.exe](https://the.earth.li/~sgtatham/putty/latest/w64/puttygen.exe)
2. Cliquem em *load* selecione o arquivo **Holismo.pen**
3. Clique em **Save private key**, digite caso queira uma **Key passphrase**, recomendo que sim.

Acessando AWS

1. Inicie o programa *PuTTY*
2. coloque o DNS publico no Host Name **ec2-18-231-115-112.sa-east-1.compute.amazonaws.com**
3. Em categorias clique em **Connection** e em seguida em **SSH** e então em **Auth**
4. Em *Authentication parameters* clique em **Browse** e selecione o arquivo convertido **terminado em .ppk**
5. Abra a conexão com **Open**
6. Se tiver inserido uma **Key passphrase** no passo 3 do configurando o arquivo de permissão para o Putty, digite esta senha agora.

# WinSCP
1. Inicie o programa
2. coloque o DNS publico no Host Name **ec2-18-231-115-112.sa-east-1.compute.amazonaws.com**
3. insira **ubuntu** no campo **User name**
4. Deixe em branco o campo **password**
5. clique em **Advanced**
6. clique em **SSH -> Authentication**
7. no campo **Private key file** selecione o arquivo convertido **.ppk** e clique em ok.
8. Login e digitar a **key passphrase** para o arquivo **.ppk**

O servidor está configurado na pasta **deploy**

# Rodando serviços com Forever
Instalar o **forever**, package para execução do Node em background.
- sudo npm install -g forever

Inicializa como aplicação
- forever server.js 

Inicializa como um serviço
- forever start server.js

O **forever** por default, reinicia sua aplicação ou serviço quantas vezes forem necessárias, para limitar em 5 reinicializações executar o seguinte comando.
- forever -m5 server.js 

Listar processos em andamento do **forever**
- forever list 

Parar o processo onde 0 é igual ao PID number do processo
- forever stop 0 

Reiniciar automaticamente sempre que o arquivo mudar
- forever -w server.js // to restart automatically whenever your server.js file changes:

Criar log de errose console.log
- forever start -o out.log -e err.log my-script.js

