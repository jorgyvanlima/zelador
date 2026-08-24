import paramiko

hostname = "192.168.123.32"
port = 22
username = "devctlab"
password = "Suporte@Gsi"

try:
    print("Conectando ao servidor SSH...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password, timeout=10)
    
    print("Conectado! Preparando o ambiente...")
    
    commands = [
        "echo 'Suporte@Gsi' | sudo -S rm -rf zelador",
        "git clone https://github.com/jorgyvanlima/zelador.git",
        "cd zelador && echo 'Suporte@Gsi' | sudo -S docker-compose up -d --build"
    ]
    
    for cmd in commands:
        print(f"Executando: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        
        out = stdout.read()
        err = stderr.read()
        if out: print(out.decode('utf-8', 'replace'))
        if err: print(err.decode('utf-8', 'replace'))
        
        if exit_status != 0:
            print(f"Aviso/Erro no comando: {cmd}")
            
    client.close()
    print("Deploy concluído no servidor Linux!")
except Exception as e:
    print(f"Erro de conexão ou execução: {str(e)}")
