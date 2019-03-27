#!/bin/bash
sudo forever stopall
sudo rm -Rf auto-deploy
mkdir auto-deploy
cp MINHA_CHAVE auto-deploy
cd auto-deploy
git init
git remote add origin https://github.com/nicholasinatel/holism-backend.git
git fetch
git checkout -t origin/master

sudo apt-get -y update
sudo apt-get -y upgrade
sudo apt install git-crypt
sudo apt-get install haveged rng-tools

git-crypt unlock MINHA_CHAVE

sudo npm install 
sudo npm run aws