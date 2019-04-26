#!/bin/bash
echo "Deploy Script for Holismo Backend";
if [ -e "MINHA_CHAVE" ];
then
    echo "git-crypt key ok";
else
    echo "ERROR! abort script, git-crypt file missing";
    exit 1;
fi

echo "Stop All Services";
sudo forever stopall; 
echo "System Update";
sudo apt-get -y update;
echo "git-crypt instalation";
sudo apt install git-crypt;
sudo apt-get install haveged rng-tools;

if [ -d "holism-backend" ];
then
    echo "Directory Exists"
    if [ -e holism-backend/.git ];
    then
        echo .git;
        echo "Local Git Repository Already Exists";
        cd holism-backend;
        git pull origin master;
        git-crypt unlock MINHA_CHAVE;
        sudo npm install; 
        sudo npm run prod;
        sudo npm run aws;
    else
        echo "Creating Local Git Repository";
        cp MINHA_CHAVE holism-backend;
        cd holism-backend;
        git init;
        git remote add origin https://github.com/nicholasinatel/holism-backend.git;
        git fetch;
        git checkout -t origin/master;
        git-crypt unlock MINHA_CHAVE;
        sudo npm install; 
        sudo npm run prod;
        sudo npm run aws;
    fi
else
    echo "Creating Backend Deploy Directory and Local Git Repository";
    mkdir holism-backend;
    cp MINHA_CHAVE holism-backend;
    cd holism-backend;
    git init;
    git remote add origin https://github.com/nicholasinatel/holism-backend.git;
    git fetch;
    git checkout -t origin/master;
    git-crypt unlock MINHA_CHAVE;
    sudo npm install; 
    sudo npm run prod;
    sudo npm run aws;
fi

# sudo forever stopall
# sudo rm -Rf auto-deploy
# mkdir auto-deploy
# cp MINHA_CHAVE auto-deploy
# cd auto-deploy
# git init
# git remote add origin https://github.com/nicholasinatel/holism-backend.git
# git fetch
# git checkout -t origin/master

# sudo apt-get -y update
# sudo apt-get -y upgrade
# sudo apt install git-crypt
# sudo apt-get install haveged rng-tools

# git-crypt unlock MINHA_CHAVE

# sudo npm install; 
# sudo npm run prod;
# sudo npm run aws;

# Justo for keeping it
# for file in holism-backend/*; do
#     echo "$(basename "$file")"
# done










