
docker-compose up -d

docker run -it --rm --link rabbittests_rabbit1_1:rabbitmq -e RABBITMQ_ERLANG_COOKIE='asdfasdf' rabbitmq bash


VBoxManage controlvm default natpf1 tcp-5672,tcp,,5672,,5672
VBoxManage showvminfo default

# https://www.rabbitmq.com/tutorials/tutorial-one-java.html

javac -cp rabbitmq-client.jar Send.java Recv.java

java -cp .:commons-io-1.2.jar:commons-cli-1.1.jar:rabbitmq-client.jar Send

java -cp .:commons-io-1.2.jar:commons-cli-1.1.jar:rabbitmq-client.jar Recv


rabbitmqctl list_queues
