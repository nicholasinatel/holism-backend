# What it is
Install and Configuration of MongoDB on Ubuntu 18.04 LTS

Technologies used:
- [Ubuntu 18.04 LTS](http://releases.ubuntu.com/18.04/) - Open source Operation System.
- [MongoDB 4.0 Community Edition](https://www.mongodb.com) - Open Source Document Database


## Table of Contents
- [MongoDB Documentation](https://docs.mongodb.com)

## Install MongoDB Community Edition on Ubuntu
1 - Import the public key used by the package management system.
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
```

2 - Create a list file for MongoDB
```
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
```

3 - Reload local package database
```
sudo apt-get update
```

4 - Install the MongoDB packages
```
sudo apt-get install -y mongodb-org
```


After install run MongoDB Communit Edition:
1 - Start MongoDB
```
sudo service mongod start
```

2 - Verify that MongoDB has started successfully
```
[initandlisten] waiting for connections on port 27017
```

3 - Stop MongoDB
```
sudo service mongod stop
```

4 - Restart MongoDB
```
sudo service mongod restart
```

## Configuration File Options
On Linux, a default /etc/mongod.conf configuration file is included when using a package manager to install MongoDB.

The following sample configuration file contains several mongod settings that you may adapt to your local configuration:
```
systemLog:
   destination: file
   path: "/var/log/mongodb/mongod.log"
   logAppend: true
storage:
   journal:
      enabled: true
processManagement:
   fork: true
net:
   bindIp: 127.0.0.1
   port: 27017
setParameter:
   enableLocalhostAuthBypass: false
```

## Author
[Filipe Campos de Lima]
