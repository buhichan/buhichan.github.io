
---

Docker 容器的时间会跟宿主同步, 但是时区会被设置为 etc/etc, 这个可以从 /etc/localtime 这个软连接链接的目标看出, 
解决办法是提供一个环境变量TZ, 例如
docker run ... -e TZ=Asia/Shanghai ...

---

Docker 数据目录修改方法

Centos修改方法：

# 关闭docker服务
systemctl stop docker.service

# 移动数据到新的目录
mv /var/lib/docker /data/docker

# 修改docker.service文件，使用-g参数指定存储位置

vi /usr/lib/systemd/system/docker.service  
ExecStart=/usr/bin/dockerd --graph /data/docker 

# reload配置文件 
systemctl daemon-reload 

# 重启docker 
systemctl restart docker.service

# 查看数据目录
docker info | grep Dir

---

如何解决  could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network

因为某些环境中172网段全都被占用了, 无法被docker使用, 这个时候只要手动指定一个网段就行了, 例如

docker network create prod_default --subnet 192.168.200.0/24

---

如何解决docker无法创建docker0

ip link add name prod_default type bridge
ip addr add dev prod_default 172.17.0.1/16

---

如何解决docker默认网段跟已有网段冲突
https://support.zenoss.com/hc/en-us/articles/203582809-How-to-Change-the-Default-Docker-Subnet

systemctl stop serviced
systemctl stop docker
iptables -t nat -F POSTROUTING
ip link set dev docker0 down
ip addr del 172.17.42.1/16 dev docker0
ip addr add 192.168.5.1/24 dev docker0
ip link set dev docker0 up
ip addr show docker0
systemctl start docker 
iptables -t nat -L -n
sytemctl start serviced

